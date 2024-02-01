// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
const userExtensionsHelper = require(MODULES_BASE_PATH +
  "/user-extension/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const kafkaProducersHelper = require(ROOT_PATH + "/generics/kafka/producers");
const assetService = require(ROOT_PATH + "/generics/services/assetsTransfer");

module.exports = class AssetsHelper {
  
  /**
   * Get users assets based on Type .
   * @method
   * @name fetchAssets
   * @param {String} queryData -  query for type data.
   * @param {Object} [bodyData] - request body data data.
   * @returns {Promise} returns a promise.
   */
  static fetchAssets(queryData, bodyData) {
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
              await solutionsHelper.queryForOrganizationSolutions(bodyData,queryData);

            break;
          default:
            let allOrganizationProgram =
              await programsHelper.queryForOrganizationPrograms(
                bodyData,
                queryData
              );
            let allOrganizationSolutions =
              await solutionsHelper.queryForOrganizationSolutions(bodyData,queryData);
            organizationAssets = {
              success: true,
              message: constants.apiResponses.ASSETS_SUCCESSFULLY,
             data:{data:[ ...allOrganizationProgram.data.data,
              ...allOrganizationSolutions.data.data]},
              count:allOrganizationProgram.data.count + allOrganizationSolutions.data.count
            }

            break;
        }

        return resolve({
            result: organizationAssets,
          });
        
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Transfer ownership Kafka Event.
   * @method
   * @name ownershipTransfer
   * @param {ownershipTransferEvent} - OwenerShip transfer Event message object 
   * {
      "highWaterOffset": 63,
       "key": "",
       "offset": 62,
       "partition": 0,
       "topic": "ownershiptransfer",
       "edata": {
          "action": "ownership-transfer",
          "organisationId": "01269934121990553633",
          "context": "Ownership Transfer",
        "actionBy": {
             "userId": "86d2d978-5b20-4453-8a76-82b5a4c728c9",
            "userName": ""
            },
      "fromUserProfile": {
              "userId": "19d81ef7-36ce-41fe-ae2d-c8365d977be4",
              "userName": "",
              "channel": "",
              "organisationId": "",
              "roles": [
                 "PROGRAM_MANAGER"
                 ]
             },
       "toUserProfile": {
              "userId": "86d2d978-5b20-4453-8a76-82b5a4c728c9",
              "userName": "test",
              "firstName": "test",
              "lastName": "",
           "roles": [
                "PROGRAM_MANAGER",
                "CONTENT_CREATOR"
               ]
            },
       "assetInformation": {
             "objectType": "solution || program",
             "identifier": "{{resource_identifier}}"
           },
         "iteration": 1
  }
}
   * @returns {Promise} success Data.
   */
  static ownershipTransfer(ownershipTransferEvent) {
    return new Promise(async (resolve, reject) => {
      try {
        let reqData = ownershipTransferEvent.edata;
        let fromFindQuery = {
          userId: reqData.fromUserProfile.userId,
          platformRoles: { $exists: true },
        };

        let updateUserSolutionsDataResult;
        let checkUsersRolesIsIdentical= assetService.checkRolesPresence(
          reqData.fromUserProfile.roles,
          reqData.fromUserProfile.roles
        );

        if (
          reqData.actionBy.userId &&
          reqData.fromUserProfile.userId &&
          reqData.toUserProfile.userId && checkUsersRolesIsIdentical
        ) {
          //get Fromuser details from user Extension

          let fromUserData = await userExtensionsHelper.userExtensionDocument(
            fromFindQuery
          );
          //get Touser details from user Extension
          let toFindQuery = {
            userId: reqData.toUserProfile.userId,
          };
          let toUserData = await userExtensionsHelper.userExtensionDocument(
            toFindQuery
          );
          let allAssetsData = fromUserData?.platformRoles;
          let typeOfAssetsToMove = reqData.assetInformation.objectType;
          let checkAssetInformation =
            reqData.hasOwnProperty("assetInformation");

          //condition for if there is no object type
          if (!checkAssetInformation) {
            if (
              reqData.toUserProfile.roles.includes(
                constants.common.CONTENT_CREATOR
              )
            ) {
              //filter for solution updates
              let solutionFilter = {
                author: reqData.fromUserProfile.userId,
              };
              let updateSolutions = {
                $set: {
                  author: reqData.toUserProfile.userId,
                  creator: reqData.toUserProfile.firstname,
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
              updateUserSolutionsDataResult = await Promise.all(
                updateUserSolutions
              );
            } else {
              if (
                reqData.toUserProfile.roles.includes(
                  constants.common.PROGRAM_MANAGER
                ) ||
                reqData.toUserProfile.roles.includes(
                  constants.common.PROGRAM_DESIGNER
                )
              ) {
                if (toUserData) {
                  const updateQueries =
                    await assetService.generateUpdateOperations(
                      fromUserData,
                      reqData,
                      toUserData,
                      allAssetsData
                    );
                  let updateProgram =
                    await userExtensionsHelper.findOneandUpdate(updateQueries);
                } else {

                  //data for create new user in user Extension
                  let newCollectionForUserExtension = {
                    platformRoles: [],
                    userId: reqData.toUserProfile.userId,
                    externalId: reqData.toUserProfile.userName,
                    updatedBy: reqData.actionBy.userId,
                    createdBy: reqData.actionBy.userId,
                  };
                  const filterCodes = fromUserData.platformRoles.map(
                    (role) => role.code
                  );

                  let findProgramManagerQuery = {
                    code: { $in: filterCodes },
                  };

                  let findProgramManagerId = await userRolesHelper.findOne(
                    findProgramManagerQuery
                  );

                  const programRolesArray =
                    assetService.createProgramRolesArray(
                      fromUserData,
                      findProgramManagerId
                    );

                  newCollectionForUserExtension.platformRoles =
                    programRolesArray;

                  //create new Touser if he is not available in the user extension
                  let createUserExtensions =
                    await userExtensionsHelper.createOne(
                      newCollectionForUserExtension
                    );
                  if (createUserExtensions) {
                    let deleteProgramFromUserQuery = {
                      userId: reqData.fromUserProfile.userId,
                    };
                    let deleteProgramFromUserField = {
                      $set: { platformRoles: [] },
                    };
                    let deleteProgram = await userExtensionsHelper.updateOne(
                      deleteProgramFromUserQuery,
                      deleteProgramFromUserField
                    );
                  }
                }
              }
            }
          } else {
            if (
              reqData.toUserProfile.roles.includes(
                constants.common.CONTENT_CREATOR
              ) &&
              typeOfAssetsToMove === constants.common.SOULTION
            ) {
              //filter for solution updates
              let solutionFilter = {
                author: reqData.fromUserProfile.userId,
              };
              let updateSolutions = {
                $set: {
                  author: reqData.toUserProfile.userId,
                  creator: reqData.toUserProfile.firstname,
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
              updateUserSolutionsDataResult = await Promise.all(
                updateUserSolutions
              );
            } else {
              if (
                reqData.toUserProfile.roles.includes(
                  constants.common.PROGRAM_MANAGER
                ) ||
                reqData.toUserProfile.roles.includes(
                  constants.common.PROGRAM_DESIGNER
                )
              ) {
                if (toUserData) {
                  const updateQueries =
                    await assetService.generateUpdateOperations(
                      fromUserData,
                      reqData,
                      toUserData,
                      allAssetsData
                    );
                  let updateProgram =
                    await userExtensionsHelper.findOneandUpdate(updateQueries);
                } else {
                  //data for create user in user Extension
                  let newCollectionForUserExtension = {
                    platformRoles: [],
                    userId: reqData.toUserProfile.userId,
                    externalId: reqData.toUserProfile.userName,
                    updatedBy: reqData.actionBy.userId,
                    createdBy: reqData.actionBy.userId,
                  };
                  const filterCodes = fromUserData.platformRoles.map(
                    (role) => role.code
                  );

                  let findProgramManagerQuery = {
                    code: { $in: filterCodes },
                  };

                  let findProgramManagerId = await userRolesHelper.findOne(
                    findProgramManagerQuery
                  );

                  const programRolesArray =
                    assetService.createProgramRolesArray(
                      fromUserData,
                      findProgramManagerId
                    );

                  newCollectionForUserExtension.platformRoles =
                    programRolesArray;
                  //create new Touser if he is not available in the user extension
                  let createUserExtensions =
                    await userExtensionsHelper.createOne(
                      newCollectionForUserExtension
                    );
                  if (createUserExtensions) {
                    let deleteProgramFromUserQuery = {
                      userId: reqData.fromUserProfile.userId,
                    };
                    let deleteProgramFromUserField = {
                      $set: { platformRoles: [] },
                    };
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

};
