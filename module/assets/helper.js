// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
const userExtensionsHelper = require(MODULES_BASE_PATH +
  "/user-extension/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const kafkaProducersHelper = require(ROOT_PATH + "/generics/kafka/producers");
const programUsersHelper = require(MODULES_BASE_PATH + "/programUsers/helper");
const telemetryEventOnOff = process.env.TELEMETRY_ON_OFF;

module.exports = class AssetsHelper {
  /**
   * Get user's assets based on Type .
   * @method
   * @name fetchAssets
   * @param {String} typeOfAssets -  typeOfAssets(program or solution)
   * @param {String}  orgId       -  Organization Id
   * @param {String}  userIds     -  Array of user
   * @param {Object} [projection]
   * @returns {Promise}           -returns a promise.
   */
  static fetchAssets(typeOfAssets, orgId, userIds, projection = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        let organizationAssets;
        let solutionMatchQuery = {
          createdFor: { $in: [orgId] },
        };
        let programMatchQuery = {
          createdFor: { $in: [orgId] },
        };
        if (userIds) {
          solutionMatchQuery.author = { $in: userIds };
          solutionMatchQuery.isAPrivateProgram = false;
          programMatchQuery.owner = { $in: userIds };
        }
        switch (typeOfAssets) {
          case "program":
            organizationAssets = await programsHelper.list(
              "", // for pageNo
              "", // for pageSize
              "", // for searchText
              programMatchQuery,
              projection
            );
            break;
          case "solution":
            organizationAssets = await solutionsHelper.list(
              "", //for type
              "", // for subType
              solutionMatchQuery,
              "", // for pageNo
              "", // for pageSize
              "", // for searchText
              projection
            );
            break;
          default:
            let listAssets = [
              await programsHelper.list(
                "", // for pageNo
                "", // for pageSize
                "", // for searchText
                programMatchQuery,
                projection
              ),
              await solutionsHelper.list(
                "", //for type
                "", // for subType
                solutionMatchQuery,
                "", // for pageNo
                "", // for pageSize
                "", // for searchText
                projection
              ),
            ];
            let listOrgAssets = await Promise.all(listAssets);

            organizationAssets = {
              success: true,
              message: constants.apiResponses.ASSETS_FETCHED_SUCCESSFULLY,
              data: {
                data: [
                  ...listOrgAssets[0].data.data,
                  ...listOrgAssets[1].data.data,
                ],
              },
              count: listOrgAssets[0].data.count + listOrgAssets[1].data.count,
            };

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
   * @param {ownershipTransferEvent} - OwenerShiptransfer Event
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

        let updateUserAssetDataResult = false;
        //Check if the users has identical Role or not, and return boolean
        let checkUsersRolesIsIdentical = this.checkRolesPresence(
          reqData.fromUserProfile.roles,
          reqData.toUserProfile.roles
        );

        if (
          reqData.actionBy.userId &&
          reqData.fromUserProfile.userId &&
          reqData.toUserProfile.userId &&
          checkUsersRolesIsIdentical
        ) {
          let checkAssetInformation =
            reqData.hasOwnProperty("assetInformation");

          //condition for if there is no assetInformation
          if (!checkAssetInformation) {
            if (
              reqData.toUserProfile.roles.includes(
                constants.common.CONTENT_CREATOR
              )
            ) {
              //Queries for solution updates
              let solutionFilter = {
                author: reqData.fromUserProfile.userId,
              };
              let updateSolutions = {
                $set: {
                  author: reqData.toUserProfile.userId,
                  creator: reqData.toUserProfile.firstName,
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
              let updatedSolution = await Promise.all(updateUserSolutions);

              updatedSolution
                ? (updateUserAssetDataResult = true)
                : (updateUserAssetDataResult = false);
            }
            if (
              reqData.toUserProfile.roles.includes(
                constants.common.PROGRAM_MANAGER
              ) ||
              reqData.toUserProfile.roles.includes(
                constants.common.PROGRAM_DESIGNER
              )
            ) {
              let fromUserData =
                await userExtensionsHelper.userExtensionDocument(fromFindQuery);
              //Query get Touser details from user Extension
              let toFindQuery = {
                userId: reqData.toUserProfile.userId,
              };
              let toUserData = await userExtensionsHelper.userExtensionDocument(
                toFindQuery
              );
              let allAssetsData = fromUserData?.platformRoles;

              if (toUserData) {
                //return array of queries to update fromUser's and toUser's programRoles
                let updateQueries = this.generateUpdateOperations(
                  fromUserData,
                  toUserData,
                  allAssetsData,
                  reqData
                );
                await userExtensionsHelper.updateMany(updateQueries);
              } else {
                //Query object to  create new user in user Extension
                let newCollectionForUserExtension = {
                  userId: reqData.toUserProfile.userId,
                  userName: reqData.toUserProfile.userName,
                  updatedBy: reqData.actionBy.userId,
                  createdBy: reqData.actionBy.userId,
                };

                //return programRoles according to Parial or one to one transfer from fromUser
                let programRolesArray =
                  await this.fetchFromUserDataPlatformRoles(fromUserData);

                //create user if he is not exits in the user extension
                let createUserExtensions =
                  await userExtensionsHelper.createOrUpdate(
                    [],
                    newCollectionForUserExtension
                  );
                if (createUserExtensions) {
                  let updateProgramRolesAndCreatedByMatchQuery = {
                    userId: reqData.toUserProfile.userId,
                  };

                  let updateProgramRolesAndCreatedByFieldQuery = {
                    $push: {
                      platformRoles: {
                        $each: programRolesArray,
                      },
                    },
                  };

                  let deleteProgramFromUserQuery = {
                    userId: reqData.fromUserProfile.userId,
                  };
                  let deleteProgramFromUserField = {
                    $set: { platformRoles: [] },
                  };
                  let updateUserExtension =
                    await userExtensionsHelper.updateOne(
                      updateProgramRolesAndCreatedByMatchQuery,
                      updateProgramRolesAndCreatedByFieldQuery
                    );
                  if (updateUserExtension) {
                    await userExtensionsHelper.updateOne(
                      deleteProgramFromUserQuery,
                      deleteProgramFromUserField
                    );
                  }
                }
              }
              let programFilter = {
                owner: reqData.fromUserProfile.userId,
              };
              let updatePrograms = {
                $set: {
                  owner: reqData.toUserProfile.userId,
                },
              };
              let updatePartialPrograms = await programsHelper.updateMany(
                programFilter,
                updatePrograms
              );
              updatePartialPrograms
                ? (updateUserAssetDataResult = true)
                : (updateUserAssetDataResult = false);
            }
          } else {
            let typeOfAssetsToMove = reqData.assetInformation?.objectType;

            if (
              reqData.toUserProfile.roles.includes(
                constants.common.CONTENT_CREATOR
              ) &&
              typeOfAssetsToMove === constants.common.SOULTION
            ) {
              //filter for solution updates
              let solutionFilter = {
                author: reqData.fromUserProfile.userId,
                _id: new ObjectId(reqData.assetInformation.identifier),
              };
              let updateSolutions = {
                $set: {
                  author: reqData.toUserProfile.userId,
                  creator: reqData.toUserProfile.firstName,
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
              let updatedOneToOneTransferSolution = await Promise.all(
                updateUserSolutions
              );
              updatedOneToOneTransferSolution
                ? (updateUserAssetDataResult = true)
                : (updateUserAssetDataResult = false);
            }

            if (
              reqData.toUserProfile.roles.includes(
                constants.common.PROGRAM_MANAGER
              ) ||
              (reqData.toUserProfile.roles.includes(
                constants.common.PROGRAM_DESIGNER
              ) &&
                typeOfAssetsToMove === constants.common.PROGRAM)
            ) {
              let fromUserData =
                await userExtensionsHelper.userExtensionDocument(fromFindQuery);
              //Query to check toUser exits
              let toFindQuery = {
                userId: reqData.toUserProfile.userId,
              };
              let toUserData = await userExtensionsHelper.userExtensionDocument(
                toFindQuery
              );
              let allAssetsData = fromUserData?.platformRoles;
              if (toUserData) {
                //return array of queries to update fromUser's and toUser's programRoles

                let updateQueries = this.generateUpdateOperations(
                  fromUserData,
                  toUserData,
                  allAssetsData,
                  reqData,
                  checkAssetInformation
                );
                await userExtensionsHelper.updateMany(updateQueries);
              } else {
                //Query object to  create new user in user Extension
                let newCollectionForUserExtension = {
                  userId: reqData.toUserProfile.userId,
                  userName: reqData.toUserProfile.userName,
                  updatedBy: reqData.actionBy.userId,
                  createdBy: reqData.actionBy.userId,
                };
                let programRolesArray =
                  await this.fetchFromUserDataPlatformRoles(
                    fromUserData,
                    reqData,
                    checkAssetInformation
                  );

                //create new user if not exits in the user extension
                let createUserExtensions =
                  await userExtensionsHelper.createOrUpdate(
                    [], // device data array
                    newCollectionForUserExtension
                  );
                if (createUserExtensions) {
                  let updateProgramRolesAndCreatedByMatchQuery = {
                    userId: reqData.toUserProfile.userId,
                  };

                  // Push Paticular program to the toUser
                  let updateProgramRolesAndCreatedByFieldQuery = {
                    $addToSet: {
                      platformRoles: {
                        $each: programRolesArray,
                      },
                    },
                  };

                  let deleteProgramFromUserQuery = {
                    userId: reqData.fromUserProfile.userId,
                    platformRoles: {
                      $elemMatch: {
                        code: programRolesArray[0].code,
                      },
                    },
                  };
                  let deleteProgramFromUserField = {
                    $pull: {
                      "platformRoles.$[elem].programs": new ObjectId(
                        reqData.assetInformation.identifier
                      ),
                    },
                  };
                  let arrayFilters = [
                    { "elem.code": programRolesArray[0].code },
                  ];

                  let updateUserExtension =
                    await userExtensionsHelper.updateOne(
                      updateProgramRolesAndCreatedByMatchQuery,
                      updateProgramRolesAndCreatedByFieldQuery
                    );
                  if (updateUserExtension) {
                    await userExtensionsHelper.updateOne(
                      deleteProgramFromUserQuery,
                      deleteProgramFromUserField,
                      arrayFilters
                    );
                  }
                }
              }

              let programFilter = {
                owner: reqData.fromUserProfile.userId,
                _id: new ObjectId(reqData.assetInformation.identifier),
              };
              let updatePrograms = {
                $set: {
                  owner: reqData.toUserProfile.userId,
                },
              };

              let updatedOneToOneTransferProgram =
                await programsHelper.updateMany(programFilter, updatePrograms);

              updatedOneToOneTransferProgram
                ? (updateUserAssetDataResult = true)
                : (updateUserAssetDataResult = false);
            }
          }
        }

        if (updateUserAssetDataResult) {
          if (telemetryEventOnOff !== constants.common.OFF) {
            /**
             * Telemetry Raw Event
             * {"eid":"","ets":1700188609568,"ver":"3.0","mid":"e55a91cd-7964-46bc-b756-18750787fb32","actor":{},"context":{"channel":"","pdata":{"id":"projectservice","pid":"manage-learn","ver":"7.0.0"},"env":"","cdata":[{"id":"adf3b621-619b-4195-a82d-d814eecdb21f","type":"Request"}],"rollup":{}},"object":{},"edata":{}}
             */
            let rawEvent =
              await gen.utils.generateTelemetryEventSkeletonStructure();
            rawEvent.eid = constants.common.AUDIT;
            rawEvent.context.channel = ownershipTransferEvent.context.channel;
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

  /**
   * Generate Update programs Queires for fromUser and to user
   * @method
   * @name generateUpdateOperations
   * @param {Object} fromUserData  -   from userData.
   * @param {Object} reqData       - request body data data.
   * @param {Object} toUserData    - to user Data from userExtension.
   * @param {Array}  allAssetsData - PlatformRoles of from user.

   * @returns {Array} returns array of queries to Update.
   */

  static generateUpdateOperations(
    fromUserData,
    toUserData,
    allAssetsData,
    reqData = {},
    checkAssetInformation = false
  ) {
    let bulkOperations = [];

    fromUserData.platformRoles.forEach((role) => {
      let roleCodeToUpdate = role.code;
      let arrayToMove = allAssetsData.filter(
        (roleData) => roleData.code === roleCodeToUpdate
      );

      let toUserRoleExists = toUserData.platformRoles.some(
        (toRole) => toRole.code === roleCodeToUpdate
      );

      // If role  doesn't exist in toUserData

      if (!toUserRoleExists) {
        if (checkAssetInformation) {
          let checkRoleToUpdateProgram = role.programs.some((programId) =>
            programId.equals(reqData.assetInformation.identifier)
          );
          if (checkRoleToUpdateProgram) {
            let newRole = {
              roleId: role.roleId,
              code: role.code,
              programs: role.programs.filter((eachProgram) =>
                eachProgram.equals(reqData.assetInformation.identifier)
              ),
            };
            bulkOperations.push({
              updateOne: {
                filter: { userId: toUserData.userId },
                update: {
                  $push: {
                    platformRoles: newRole,
                  },
                },
              },
            });

            // Remove the program from fromUserData
            bulkOperations.push({
              updateOne: {
                filter: { userId: fromUserData.userId },
                update: {
                  $pull: {
                    "platformRoles.$[elem].programs": new ObjectId(
                      reqData.assetInformation.identifier
                    ),
                  },
                },
                arrayFilters: [{ "elem.code": roleCodeToUpdate }],
              },
            });
          }
        } else {
          bulkOperations.push({
            updateOne: {
              filter: { userId: toUserData.userId },
              update: {
                $push: {
                  platformRoles: role,
                },
              },
            },
          });

          // Remove the object from fromUserData
          bulkOperations.push({
            updateOne: {
              filter: { userId: fromUserData.userId },
              update: {
                $pull: {
                  platformRoles: { code: roleCodeToUpdate },
                },
              },
            },
          });
        }
      } else {
        let updateToQuery = {
          userId: toUserData.userId,
          "platformRoles.code": roleCodeToUpdate,
        };

        let updateToFields;
        let deleteProgramFromUserField;
        if (checkAssetInformation) {
          updateToFields = {
            $addToSet: {
              "platformRoles.$[elem].programs": {
                $each: arrayToMove[0].programs.filter((oneProgram) =>
                  oneProgram.equals(reqData.assetInformation.identifier)
                ),
              },
            },
          };
          deleteProgramFromUserField = {
            $pull: {
              "platformRoles.$[elem].programs": new ObjectId(
                reqData.assetInformation.identifier
              ),
            },
          };
        } else {
          updateToFields = {
            $addToSet: {
              "platformRoles.$[elem].programs": {
                $each: arrayToMove?.[0]?.programs,
              },
            },
          };
          deleteProgramFromUserField = {
            $pull: {
              "platformRoles.$[elem].programs": {
                $in: arrayToMove?.[0]?.programs,
              },
            },
          };
        }

        let arrayFilters = [{ "elem.code": roleCodeToUpdate }];

        let deleteProgramFromUserQuery = {
          userId: fromUserData.userId,
          "platformRoles.code": roleCodeToUpdate,
        };

        // Create bulk write operations
        bulkOperations.push({
          updateOne: {
            filter: updateToQuery,
            update: updateToFields,
            arrayFilters: arrayFilters,
          },
        });

        bulkOperations.push({
          updateOne: {
            filter: deleteProgramFromUserQuery,
            update: deleteProgramFromUserField,
            arrayFilters: arrayFilters,
          },
        });
      }
    });

    return bulkOperations;
  }

  /**
   * Get users assets based on assetInformation .
   * @method
   * @name createProgramRolesArray
   * @param {Object} fromUserData         - from userData.
   * @param {String} findProgramManagerId - Id of Role.
   * @param {Array} allAssetsData         - PlatformRoles of from user.

   * @returns {Array} returns PlatformRoles to update in Touser.
   */

  static createProgramRolesArray(
    fromUserData,
    findProgramManagerId,
    reqData = {},
    checkAssetInformation = false
  ) {
    let programRolesArray = [];

    for (let roleCode of fromUserData.platformRoles) {
      let matchingRole = findProgramManagerId.find(
        (role) => role.code === roleCode.code
      );

      if (matchingRole) {
        let roleId = matchingRole._id;
        let roleDetails;
        if (checkAssetInformation) {
          let checkRoleToUpdateProgram = roleCode.programs.some((programId) =>
            programId.equals(reqData.assetInformation.identifier)
          );
          if (checkRoleToUpdateProgram) {
            roleDetails = {
              roleId: roleId,
              code: roleCode.code,
              programs: roleCode.programs.filter((eachProgram) =>
                eachProgram.equals(reqData.assetInformation.identifier)
              ),
            };
          }
        } else {
          roleDetails = {
            roleId: roleId,
            code: roleCode.code,
            programs: roleCode.programs,
          };
        }

        if (
          roleCode.code === constants.common.PROGRAM_DESIGNER &&
          roleDetails
        ) {
          roleDetails.isAPlatformRole = true;
          roleDetails.entities = [];
        }
        if (roleDetails) {
          programRolesArray.push(roleDetails);
        }
      }
    }

    return programRolesArray;
  }

  /**
 * Check whether from and to user has Identical Roles.
 * @method
 * @name createProgramRolesArray
 * @param {Array} fromUserData  -fromUser array.
 * @param {Array} toUserArray   - toserU array.
 * @returns {Boolean} returns true or false. 
 
 */

  static checkRolesPresence(fromUserRoleArray, toUserRoleArray) {
    let rolesToCheck = [
      constants.common.PROGRAM_MANAGER,
      constants.common.PROGRAM_DESIGNER,
      constants.common.CONTENT_CREATOR,
    ];

    let hasRolesInFromArray = rolesToCheck.some((role) =>
      fromUserRoleArray.includes(role)
    );
    let hasRolesInToArray = rolesToCheck.some((role) =>
      toUserRoleArray.includes(role)
    );

    return hasRolesInFromArray && hasRolesInToArray;
  }
  /**
 * Query to get Platform Roles for touser when user Not in UserExtension 
 * @method
 * @name fetchFromUserDataPlatformRoles
 * @param {Array} fromUserData -   From user data
 * @returns {Array} returns Array of Platform Roles to push for touser
 
 */
  static fetchFromUserDataPlatformRoles(
    fromUserData,
    reqData,
    checkAssetInformation
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let filterCodes = fromUserData.platformRoles.map((role) => role.code);

        let findProgramManagerQuery = {
          code: { $in: filterCodes },
        };

        let findProgramManagerId = await userRolesHelper.roleDocuments(
          findProgramManagerQuery
        );

        let programRolesArray = this.createProgramRolesArray(
          fromUserData,
          findProgramManagerId,
          reqData,
          checkAssetInformation
        );
        return resolve(programRolesArray);
      } catch (error) {
        reject(error);
      }
    });
  }
};
