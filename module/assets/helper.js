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
        let fromUpdateQuery = {
          userId: reqData.fromUserProfile.userId,
        };
        let fromUpdateUnsetQuery = {
          $set: { platformRoles: [] },
        };
        let toFindQuery = {
          userId: reqData.toUserProfile.userId,
          platformRoles: { $exists: true },
        };
        const newCollectionForUserExtension = {
          // roles: [],
          // status: "active",
          // isDeleted: false,
          // removedFromHomeScreen: [],
          // improvementProjects: [],
          platformRoles: [],
          // deleted: false,
          userId: reqData.toUserProfile.userId,
          externalId: reqData.toUserProfile.userName,
          updatedBy: reqData.actionBy.userId,
          createdBy: reqData.actionBy.userId,
        };
        if (
          reqData.actionBy.userId &&
          reqData.fromUserProfile.userId &&
          reqData.toUserProfile.userId
        ) {
          let fromUserData = await userExtensionsHelper.findOne(fromFindQuery);
          let allAssetsData = fromUserData.platformRoles;
          const typeOfAssetsToMove = reqData.assetInformation.objectType;

          //Query for object type not present on reqData.assetInformation.objectType

          let updateQuery = {
            userId: reqData.toUserProfile.userId,
          };
          let updateSetQuery = {
            $push: { platformRoles: { $each: allAssetsData } },
          };
          //Query for object type present on reqData.assetInformation.objectType

          const arrayToMove = allAssetsData.filter(
            (role) => role.code === typeOfAssetsToMove
          );
          const updateToQuery = {
            userId: reqData.toUserProfile.userId,
            "platformRoles.code": typeOfAssetsToMove,
          };

          const updateToFields = {
            $push: {
              "platformRoles.$.programs": { $each: arrayToMove?.[0]?.programs },
            },
          };
          const arrayFilters = [{ "elem.code": typeOfAssetsToMove }];

          let deleteProgramFromUserQuery = {
            userId: reqData.fromUserProfile.userId,
            "platformRoles.code": typeOfAssetsToMove,
          };
          let deleteProgramFromUserField = {
            $pull: {
              "platformRoles.$.programs": { $in: arrayToMove?.[0]?.programs },
            },
          };
          if (fromUserData) {
            if (!typeOfAssetsToMove || !typeOfAssetsToMove > 0) {
              let toUserWithoutObjectTypeData = await userExtensionsHelper.findOne(
                  _.omit(updateToQuery, ["platformRoles.code"])
                );
              if (toUserWithoutObjectTypeData) {
                let updateProgramRoles = await userExtensionsHelper.updateOne(
                  updateQuery,
                  updateSetQuery
                );
                if (updateProgramRoles) {
                  let deleteProgram = await userExtensionsHelper.updateOne(
                    fromUpdateQuery,
                    fromUpdateUnsetQuery
                  );
                }
              } else {
                let findProgramManagerQuery = {
                  code: { $in: reqData.toUserProfile.roles },
                };

                let findProgramManagerId = await userRolesHelper.findOne(
                  findProgramManagerQuery
                );
                let createUserExtensions = await userExtensionsHelper.createOne(
                  newCollectionForUserExtension
                );
                if (createUserExtensions) {
                  let updateProgramRolesForNewUser =
                    await userExtensionsHelper.updateOne(
                      updateQuery,
                      updateSetQuery
                    );
                  if (updateProgramRolesForNewUser) {
                    let deleteProgram = await userExtensionsHelper.updateOne(
                      fromUpdateQuery,
                      fromUpdateUnsetQuery
                    );
                  }
                }
              }
            } else {
              let toUserData = await userExtensionsHelper.findOne(
                updateToQuery,
                updateToFields
              );

              if (toUserData) {
                //Move the data when  typeOfAssetsToMove is present in to user data
                const arrayToMoveInToUser = toUserData.platformRoles.filter(
                  (role) => role.code === typeOfAssetsToMove
                );

                if (arrayToMoveInToUser) {
                  let updateProgram =
                    await userExtensionsHelper.findOneandUpdate(
                      updateToQuery,
                      updateToFields,
                      arrayFilters
                    );
                  if (updateProgram) {
                    // let updateOperation =  !reqData.assetInformation.objectType? fromUpdateQuery: updateFromUserBasedonTypeQuery

                    let deleteProgram =
                      await userExtensionsHelper.findOneandUpdate(
                        deleteProgramFromUserQuery,
                        deleteProgramFromUserField,
                        arrayFilters
                      );
                  }
                }
              } else {
                let findProgramManagerQuery = {
                  code: { $in: reqData.toUserProfile.roles },
                };

                let findProgramManagerId = await userRolesHelper.findOne(
                  findProgramManagerQuery
                );
                let setProgramRoles;
                if (typeOfAssetsToMove === constants.common.PROGRAM_DESIGNER) {
                  setProgramRoles = {
                    roleId: findProgramManagerId._id,
                    isAPlatformRole: true,
                    entities: [],
                    code: typeOfAssetsToMove,
                  };
                } else {
                  setProgramRoles = {
                    roleId: findProgramManagerId._id,
                    code: typeOfAssetsToMove,
                  };
                }

                newCollectionForUserExtension.platformRoles.push(
                  setProgramRoles
                );
                let createUserExtensions = await userExtensionsHelper.createOne(
                  newCollectionForUserExtension
                );
                if (createUserExtensions) {
                  let updateProgram =
                    await userExtensionsHelper.findOneandUpdate(
                      updateToQuery,
                      updateToFields,
                      arrayFilters
                    );
                  if (updateProgram) {
                    let deleteProgram =
                      await userExtensionsHelper.findOneandUpdate(
                        deleteProgramFromUserQuery,
                        deleteProgramFromUserField,
                        arrayFilters
                      );
                  }
                }
              }
            }
          }
        }

        let solutionFilter = {
          author: reqData.toUserProfle.userId,
        };
        let updateSolutions = {
          $set: {
            author: reqData.toUserProfle.userId,
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

        let updateUserSolutions = [
          solutionsHelper.updateMany(solutionFilter, updateSolutions),
          solutionsHelper.updateMany(
            solutionLicenseFilter,
            updateSolutionsLicense
          ),
        ];
        let updateUserSolutionsDataResult = await Promise.all(
          updateUserSolutions
        );

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
