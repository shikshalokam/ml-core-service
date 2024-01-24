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
          [programRoles]: { $exists: true },
        };
        let fromUpdateQuery = {
          userId: reqData.fromUserProfile.userId,
          $unset: { programRoles: [] },
        };
        let toFindQuery = {
          userId: reqData.toUserProfile.userId,
          [programRoles]: { $exists: true },
        };
        const newCollectionForUserExtension = {
          roles: [],
          status: "active",
          isDeleted: false,
          removedFromHomeScreen: [],
          improvementProjects: [],
          platformRoles: [
            {
              roleId: userRoleId,
              code: "PROGRAM_MANAGER",
              programs: [],
            },
            {
              roleId: userRoleId,
              code: "PROGRAM_DESIGNER",
              entities: [],
              isAPlatformRole: true,
              programs: [],
            },
          ],
          deleted: false,
          userId: toUserProfile.userId,
          externalId: toUserProfile.userName,
          updatedBy: reqData.actionBy.userId,
          createdBy: reqData.actionBy.userId,
          updatedAt: new Date(),
          createdAt: new Date(),
          __v: 0,
        };
        if (
          reqData.actionBy.userId &&
          reqData.fromUserProfile.userId &&
          reqData.toUserProfile.userId
        ) {
          if (!reqData.assetInformation.objectType) {
            let fromUserData = await userExtensionsHelper.findOne(
              fromFindQuery
            );
            let allAssetsData = fromUserData.programRoles;
            if (fromUserData) {
              let toUserData = await userExtensionsHelper.findOne(toFindQuery);

              let updateQuery = {
                userId: reqData.toUserProfile.userId,
                $set: { programRoles: allAssetsData },
                upsert: true,
              };
              if (toUserData) {
                if (!toUserData.programRoles) {
                  let insertProgramRolesQuery = {
                    userId: reqData.toUserProfile.userId,
                    programRoles: [],
                  };
                  let insertProgram = await userExtensionsHelper.insertOne(
                    insertProgramRolesQuery
                  );

                  if (insertProgram) {
                    let updateProgram;
                    if (
                      reqData.toUserProfile.role === "PROGRAM_MANAGER" ||
                      reqData.toUserProfile.role === "PROGRAM_DESIGNER"
                    ) {
                      await userExtensionsHelper.updateOne(updateQuery);
                    }
                    if (updateProgram) {
                      let deleteProgram = await userExtensionsHelper.updateOne(
                        fromUpdateQuery
                      );
                      // resData=updateProgram;
                      // return resolve(updateProgram);
                    }
                  }
                } else {
                  let updateProgram;
                  if (
                    reqData.toUserProfile.role === "PROGRAM_MANAGER" ||
                    reqData.toUserProfile.role === "PROGRAM_DESIGNER"
                  ) {
                    await userExtensionsHelper.updateOne(updateQuery);
                  }
                  if (updateProgram) {
                    let deleteProgram = await userExtensionsHelper.updateOne(
                      fromUpdateQuery
                    );
                    // resData=updateProgram;

                    // return resolve(updateProgram);
                  }
                }
              } else {
                let findProgramManagerQuery = {
                  code: { $in: reqData.toUserProfile.role },
                };
                let findProgramManagerId;
                findProgramManagerId = await userRolesHelper.findOne(
                  findProgramManagerQuery
                );

                const roleToUpdate =
                  newCollectionForUserExtension.platformRoles.find(
                    (role) =>
                      role.code ===
                      reqData.toUserProfile.role.includes(role.code)
                  );
                if (roleToUpdate) {
                  roleToUpdate.roleId = findProgramManagerId._id;
                  newCollectionForUserExtension.platformRoles =
                    newCollectionForUserExtension.platformRoles.filter(
                      (role) =>
                        role.code !==
                        reqData.toUserProfile.role.includes(role.code)
                    );
                }
                let createUserExtensions = await userExtensionsHelper.createOne(
                  newCollectionForUserExtension
                );
                if (createUserExtensions) {
                  ownershipTransfer(ownershipTransferEvent);
                }
              }
            }
          } else {
            const fromUserData = await userExtensionsHelper.findOne(
              fromFindQuery
            );
            let programRoleAssets = fromUserData.programRoles;
            const typeOfAssetsToMove = reqData.assetInformation.objectType;
            if (fromUserData) {
              //update program or solution inside the programRoles
              let toUserData = await userExtensionsHelper.findOne(toFindQuery);
              if (toUserData) {
                if (!toUserData.programRoles) {
                  let insertProgramRolesQuery = {
                    userId: reqData.toUserProfile.userId,
                    programRoles: [],
                  };
                  let insertProgramRoles = await userExtensionsHelper.insertOne(
                    insertProgramRolesQuery
                  );
                  if (insertProgramRoles) {
                    const arrayToMove = programRoleAssets.filter(
                      (role) => role[typeOfAssetsToMove]
                    );

                    let updateBasedonTypeQuery = {
                      userId: reqData.toUserProfile.userId,
                      $push: { programRoles: { $each: arrayToMove } },
                      upsert: true,
                    };
                    let updateFromUserBasedonTypeQuery = {
                      userId: reqData.fromUserProfile.userId,
                      $pull: {
                        programRoles: {
                          [typeOfAssetsToMove]: { $exists: true },
                        },
                      },
                      upsert: true,
                    };
                    let updateBasedonType;
                    if (
                      reqData.toUserProfile.role === "PROGRAM_MANAGER" ||
                      reqData.toUserProfile.role === "PROGRAM_DESIGNER"
                    ) {
                      updateBasedonType = await userExtensionsHelper.updateOne(
                        updateBasedonTypeQuery
                      );
                    }
                    if (updateBasedonType) {
                      let deleteBasedonTypeinFromUser =
                        await userExtensionsHelper.updateOne(
                          updateFromUserBasedonTypeQuery
                        );
                        // resData=updateBasedonType;

                      // return resolve(updateBasedonType);
                    }
                  }
                }
              } else {
                let findProgramManagerQuery = {
                  code: { $in: reqData.toUserProfile.role },
                };
                let findProgramManagerId;
                findProgramManagerId = await userRolesHelper.findOne(
                  findProgramManagerQuery
                );

                const roleToUpdate =
                  newCollectionForUserExtension.platformRoles.find((role) =>
                    reqData.toUserProfile.role.includes(role.code)
                  );
                if (roleToUpdate) {
                  roleToUpdate.roleId = findProgramManagerId._id;
                  data.platformRoles =
                    newCollectionForUserExtension.platformRoles.filter(
                      (role) =>
                        role.code !==
                        reqData.toUserProfile.role.includes(role.code)
                    );
                }
                let createUserExtensions = await userExtensionsHelper.createOne(
                  newCollectionForUserExtension
                );
                if (createUserExtensions) {
                  ownershipTransfer(ownershipTransferEvent);
                }
              }
            }
          }
        }

        let solutionFilter = {
          author: reqData.touserProfle.userId,
          
        }
        let updateSolutions =  {
          $set: {
            author:reqData.  touserProfle.userId,
            crator: reqData.touserProfile.firstname },
        };
        let solutionLicenseFilter = {
          author:reqData. fromuserProfile.userId,
          license: {$exists:true, $ne:""},
        }
        let updateSolutionsLicense =  {
          $set: {
            "license.author": toUserProfile.firstName,
            "license.creator": toUserProfile.firstName
          },
        };

        let updateUserSolutions = [ solutionsHelper.updateMany(solutionFilter, updateSolutions), solutionsHelper.updateMany(solutionLicenseFilter, updateSolutionsLicense)]
        let updateUserSolutionsDataResult  = await Promise.all(updateUserSolutions);

        if (updateUserSolutionsDataResult && (updateUserSolutionsDataResult[0].nModified > 0 || updateUserSolutionsDataResult[1].nModified > 0 )) {
          if(telemetryEventOnOff !== constants.common.OFF){
            /**
             * Telemetry Raw Event
             * {"eid":"","ets":1700188609568,"ver":"3.0","mid":"e55a91cd-7964-46bc-b756-18750787fb32","actor":{},"context":{"channel":"","pdata":{"id":"projectservice","pid":"manage-learn","ver":"7.0.0"},"env":"","cdata":[{"id":"adf3b621-619b-4195-a82d-d814eecdb21f","type":"Request"}],"rollup":{}},"object":{},"edata":{}}
             */
            let rawEvent = await gen.utils.generateTelemetryEventSkeletonStructure();
            rawEvent.eid = constants.common.AUDIT;
            rawEvent.context.channel = userDeleteEvent.context.channel;
            rawEvent.context.env = constants.common.USER;
            rawEvent.edata.state = constants.common.TRANSFER_STATE;
            rawEvent.edata.type = constants.common.OWNERSHIP_TRANSFER_TYPE;
            rawEvent.edata.props = [];
            let userObject = {
              id:  reqData.toUserProfile.userId,
              type: constants.common.USER,
            };
            rawEvent.actor = userObject;
            rawEvent.object = userObject;
            rawEvent.context.pdata.pid = `${process.env.ID}.${constants.common.OWNERSHIP_TRANSFER_MODULE}`

            let telemetryEvent = await gen.utils.generateTelemetryEvent(rawEvent);
            telemetryEvent.lname = constants.common.TELEMTRY_EVENT_LOGGER;
            telemetryEvent.level = constants.common.INFO_LEVEL

            await kafkaProducersHelper.pushTelemetryEventToKafka(telemetryEvent);
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
};
