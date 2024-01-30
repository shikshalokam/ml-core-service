// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
const userExtensionsHelper = require(MODULES_BASE_PATH +
  "/user-extension/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const kafkaProducersHelper = require(ROOT_PATH + "/generics/kafka/producers");

module.exports = class AssetsHelper {

  static fetchPrograms(queryData, bodyData) {
    return new Promise(async (resolve, reject) => {
      try {
        let organizationAssets;

        switch (queryData) {
          case "program":
            organizationAssets =
              await programsHelper.queryForOrganizationPrograms(
                bodyData,
                queryData
              );
            break;
          case "solution":
            organizationAssets =
              await solutionsHelper.queryForOrganizationSolutions(bodyData);

            break;
          default:
            let allOrganizationProgram =
              await programsHelper.queryForOrganizationPrograms(
                bodyData,
                queryData
              );
            let allOrganizationSolutions =
              await solutionsHelper.queryForOrganizationSolutions(bodyData);
            organizationAssets = [
              ...allOrganizationProgram.data,
              ...allOrganizationSolutions.data,
            ];

            break;
        }

        if (queryData !== "" && queryData !== undefined) {
          return resolve({
            result: organizationAssets,
          });
        } else {
          return resolve({
            success: true,
            message: constants.apiResponses.ASSETS_SUCCESSFULLY,
            result: organizationAssets,
          });
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  static ownershipTransfer(ownershipTransferEvent) {
    return new Promise(async (resolve, reject) => {
      try {

        let reqData = ownershipTransferEvent.edata;
        let fromFindQuery = {
          userId: reqData.fromUserProfile.userId,
          platformRoles: { $exists: true },
        };
      
        let updateUserSolutionsDataResult;
        //data for create user in user Extension
        const newCollectionForUserExtension = {
          platformRoles: [],
          userId: reqData.toUserProfile.userId,
          externalId: reqData.toUserProfile.userName,
          updatedBy: reqData.actionBy.userId,
          createdBy: reqData.actionBy.userId,
        };
        //filter for solution updates
        let solutionFilter = {
          author: reqData.toUserProfile.userId,
        };
        let updateSolutions = {
          $set: {
            author: reqData.toUserProfile.userId,
            crator: reqData.toUserProfile.firstname,
          },
        };
        let solutionLicenseFilter = {
          author: reqData.fromUserProfile.userId,
          license: { $exists: true, $ne: "" },
        };
        let updateSolutionsLicense = {
          $set: {
            "license.author": reqData.toUserProfile.firstName,
            "license.creator": reqData.toUserProfile.firstName,
          },
        };

        if (
          reqData.actionBy.userId &&
          reqData.fromUserProfile.userId &&
          reqData.toUserProfile.userId
        ) {
          //get Fromuser details from user Extension

          let fromUserData = await userExtensionsHelper.findOne(fromFindQuery);
          //get Touser details from user Extension
          let toFindQuery = {
            userId: reqData.toUserProfile.userId,
          };
          let toUserData = await userExtensionsHelper.findOne(
            toFindQuery
          );
          let allAssetsData = fromUserData.platformRoles;
          const typeOfAssetsToMove = reqData.assetInformation.objectType;

          //condition for if there is no object type
          if (!typeOfAssetsToMove && !typeOfAssetsToMove.length > 0) {
            if (reqData.toUserProfile.roles.includes(constants.common.CONTENT_CREATOR)) {
                 let updateUserSolutions = [
                solutionsHelper.updateMany(solutionFilter, updateSolutions),
                solutionsHelper.updateMany(
                  solutionLicenseFilter,
                  updateSolutionsLicense
                ),
              ];
              updateUserSolutionsDataResult = await Promise.all(
                updateUserSolutions
              );
            } else {
              if (fromUserData) {
                if (
                  reqData.toUserProfile.roles.includes(constants.common.PROGRAM_MANAGER) ||
                  reqData.toUserProfile.roles.includes(constants.common. PROGRAM_DESIGNER)
                ) {
                    if (toUserData) {

                    let typeOfAssetsToMove = fromUserData.platformRoles.map(role =>  role.code);
                    typeOfAssetsToMove.forEach(async roleCodeToUpdate => {
                       
                      const arrayToMove = allAssetsData.filter(
                        (role) => role.code === roleCodeToUpdate
                      );
                      const updateToQuery = {
                        userId: reqData.toUserProfile.userId,
                        "platformRoles.code": roleCodeToUpdate,
                      };
            
                      const updateToFields = {
                        $push: {
                          "platformRoles.$.programs": { $each: arrayToMove?.[0]?.programs },
                        },
                      };
                      const arrayFilters = [{ "elem.code": roleCodeToUpdate }];
            
                      let deleteProgramFromUserQuery = {
                        userId: reqData.fromUserProfile.userId,
                        "platformRoles.code": roleCodeToUpdate,
                      };
                      let deleteProgramFromUserField = {
                        $pull: {
                          "platformRoles.$.programs": { $in: arrayToMove?.[0]?.programs },
                        },
                      }
                      let updateProgram =
                     await userExtensionsHelper.findOneandUpdate(
                      updateToQuery,
                      updateToFields,
                        arrayFilters
                      );

                      if (updateProgram){
                        let deleteProgram =
                        await userExtensionsHelper.findOneandUpdate(
                          deleteProgramFromUserQuery,
                          deleteProgramFromUserField,
                          arrayFilters
                        );
                      }
                    })

                  } else {
                    const filterCodes = fromUserData.platformRoles.map(role => role.code);

                    let findProgramManagerQuery = {
                      code: { $in:filterCodes},
                    };
         
                    let findProgramManagerId = await userRolesHelper.findOne(
                      findProgramManagerQuery
                    );

                    const programRolesArray = [];
                    for (const roleCode of fromUserData.platformRoles) {
                      const matchingRole = findProgramManagerId.find(
                        (role) => role.code === roleCode.code
                      );
                      if (matchingRole) {
                        const roleId = matchingRole._id;
                        if (
                          roleCode.code === constants.common.PROGRAM_DESIGNER
                        ) {
                          programRolesArray.push({
                            roleId: roleId,
                            isAPlatformRole: true,
                            entities: [],
                            code: roleCode.code,
                            programs: roleCode.programs,
                          });
                        } else {
                          programRolesArray.push({
                            roleId: roleId,
                            code: roleCode.code,
                            programs: roleCode.programs,
                          });
                        }
                      }
                    }
                    newCollectionForUserExtension.platformRoles=programRolesArray;
                    //create new Touser if he is not available in the user extension
                    let createUserExtensions = await userExtensionsHelper.createOne(
                      newCollectionForUserExtension
                    );
                    if(createUserExtensions){
                      let deleteProgramFromUserQuery={
                        userId: reqData.fromUserProfile.userId,
                        }
                        let deleteProgramFromUserField={
                          $set: { platformRoles: [] },
                        }
                       let deleteProgram = await userExtensionsHelper.updateOne(
                          deleteProgramFromUserQuery,
                          deleteProgramFromUserField
                        );
                    }
                  }
                }
              }
            }

          } else {
            if (
              reqData.toUserProfile.roles.includes(constants.common.CONTENT_CREATOR) &&
              typeOfAssetsToMove === constants.common.SOULTION
            ) {
                 let updateUserSolutions = [
                solutionsHelper.updateMany(solutionFilter, updateSolutions),
                solutionsHelper.updateMany(
                  solutionLicenseFilter,
                  updateSolutionsLicense
                ),
              ];
              updateUserSolutionsDataResult = await Promise.all(
                updateUserSolutions
              );
            } else {
              if (fromUserData) {
                if (
                  reqData.toUserProfile.roles.includes(constants.common.PROGRAM_MANAGER) ||
                  reqData.toUserProfile.roles.includes(constants.common.PROGRAM_DESIGNER)
                ) {
                    if (toUserData) {

                    let typeOfAssetsToMove = fromUserData.platformRoles.map(role =>  role.code);
                    typeOfAssetsToMove.forEach(async roleCodeToUpdate => {
                       
                      const arrayToMove = allAssetsData.filter(
                        (role) => role.code === roleCodeToUpdate
                      );
                      const updateToQuery = {
                        userId: reqData.toUserProfile.userId,
                        "platformRoles.code": roleCodeToUpdate,
                      };
            
                      const updateToFields = {
                        $push: {
                          "platformRoles.$.programs": { $each: arrayToMove?.[0]?.programs },
                        },
                      };
                      const arrayFilters = [{ "elem.code": roleCodeToUpdate }];
            
                      let deleteProgramFromUserQuery = {
                        userId: reqData.fromUserProfile.userId,
                        "platformRoles.code": roleCodeToUpdate,
                      };
                      let deleteProgramFromUserField = {
                        $pull: {
                          "platformRoles.$.programs": { $in: arrayToMove?.[0]?.programs },
                        },
                      }
                      let updateProgram =
                     await userExtensionsHelper.findOneandUpdate(
                      updateToQuery,
                      updateToFields,
                        arrayFilters
                      );

                      if (updateProgram){
                        let deleteProgram =
                        await userExtensionsHelper.findOneandUpdate(
                          deleteProgramFromUserQuery,
                          deleteProgramFromUserField,
                          arrayFilters
                        );
                      }
                    })

                  } else {
                    const filterCodes = fromUserData.platformRoles.map(role => role.code);

                    let findProgramManagerQuery = {
                      code: { $in:filterCodes},
                    };
         
                    let findProgramManagerId = await userRolesHelper.findOne(
                      findProgramManagerQuery
                    );

                    const programRolesArray = [];
                    for (const roleCode of fromUserData.platformRoles) {
                      const matchingRole = findProgramManagerId.find(
                        (role) => role.code === roleCode.code
                      );
                      if (matchingRole) {
                        const roleId = matchingRole._id;
                        if (
                          roleCode.code === constants.common.PROGRAM_DESIGNER
                        ) {
                          programRolesArray.push({
                            roleId: roleId,
                            isAPlatformRole: true,
                            entities: [],
                            code: roleCode.code,
                            programs: roleCode.programs,
                          });
                        } else {
                          programRolesArray.push({
                            roleId: roleId,
                            code: roleCode.code,
                            programs: roleCode.programs,
                          });
                        }
                      }
                    }
                    newCollectionForUserExtension.platformRoles=programRolesArray;
                    //create new Touser if he is not available in the user extension
                    let createUserExtensions = await userExtensionsHelper.createOne(
                      newCollectionForUserExtension
                    );
                    if(createUserExtensions){
                      let deleteProgramFromUserQuery={
                        userId: reqData.fromUserProfile.userId,
                        }
                        let deleteProgramFromUserField={
                          $set: { platformRoles: [] },
                        }
                       let deleteProgram = await userExtensionsHelper.updateOne(
                          deleteProgramFromUserQuery,
                          deleteProgramFromUserField
                        );
                    }
                  }
                }
              }
            }
          }
        }

        if (
          updateUserSolutionsDataResult &&
          (updateUserSolutionsDataResult[0].nModified > 0 ||
            updateUserSolutionsDataResult[1].nModified > 0)
        ) {
          if (telemetryEventOnOff !== constants.common.OFF) {
            /**
             * Telemetry Raw Event
             * {"eid":"","ets":1700188609568,"ver":"3.0","mid":"e55a91cd-7964-46bc-b756-18750787fb32","actor":{},"context":{"channel":"","pdata":{"id":"projectservice","pid":"manage-learn","ver":"7.0.0"},"env":"","cdata":[{"id":"adf3b621-619b-4195-a82d-d814eecdb21f","type":"Request"}],"rollup":{}},"object":{},"edata":{}}
             */
            let rawEvent =
              await gen.utils.generateTelemetryEventSkeletonStructure();
            rawEvent.eid = constants.common.AUDIT;
            rawEvent.context.channel = userDeleteEvent.context.channel;
            rawEvent.context.env = constants.common.USER;
            rawEvent.edata.state = constants.common.TRANSFER_STATE;
            rawEvent.edata.type = constants.common.OWNERSHIP_TRANSFER_TYPE;
            rawEvent.edata.props = [];
            let userObject = {
              id: reqData.toUserProfile.userId,
              type: constants.common.USER,
            };
            rawEvent.actor = userObject;
            rawEvent.object = userObject;
            rawEvent.context.pdata.pid = `${process.env.ID}.${constants.common.OWNERSHIP_TRANSFER_MODULE}`;

            let telemetryEvent = await gen.utils.generateTelemetryEvent(
              rawEvent
            );
            telemetryEvent.lname = constants.common.TELEMTRY_EVENT_LOGGER;
            telemetryEvent.level = constants.common.INFO_LEVEL;

            await kafkaProducersHelper.pushTelemetryEventToKafka(
              telemetryEvent
            );
          }
          return resolve({
            success: true,
          });
        } else {
          return resolve({
            success: true,
          });
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  static pushKafka(message) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await kafkaProducersHelper.pushTransferAssetsToKafka(
          message
        );
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }
};
