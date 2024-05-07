// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
const userExtensionsHelper = require(MODULES_BASE_PATH +
  "/user-extension/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const kafkaProducersHelper = require(ROOT_PATH + "/generics/kafka/producers");
const telemetryEventOnOff = process.env.TELEMETRY_ON_OFF;

module.exports = class AssetsHelper {
  /**
   * Get Organization's assets based on Type .
   * @method
   * @name fetchAssets
   * @param {String} typeOfAssets -  typeOfAssets(program or solution)
   * @param {String}  orgId       -  Organization Id
   * @param {String}  userIds     -  Array of user
   * @param {Object} [projection]
   * @returns {Promise}           -returns a promise.
   */
  static fetchAssets(typeOfAssets, orgId, userIds = [], projection = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        let organizationAssets;
        let solutionMatchQuery = {
          createdFor: { $in: [orgId] },
        };
        let programMatchQuery = {
          createdFor: { $in: [orgId] },
        };
        if (userIds && userIds.length > 0) {
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
        /**
         * 
         * @params reqData.fromUserProfile.roles
         * 
         *  [
                "CONTENT_CREATOR",
                "PROGRAM_MANAGER"
            ]
         * 
         * @params reqData.toUserProfile.roles
         * 
         *  [
                "PROGRAM_MANAGER"
            ]
         * @param {String} reqData.assetInformation.objectType
            "Program" or "Soultion"
            @returns {boolean} true or false
         * 
         * 
         */
        let checkUsersRolesIsIdentical = await this.checkRolesPresence(
          reqData.fromUserProfile.roles,
          reqData.toUserProfile.roles,
          reqData.assetInformation.objectType
        );
        if (checkUsersRolesIsIdentical) {
          let checkAssetInformation =
            reqData.hasOwnProperty("assetInformation");
          //condition for if there is no assetInformation in ownershipTransferEvent
          if (!checkAssetInformation) {
            if (
              reqData.toUserProfile.roles.includes(
                constants.common.CONTENT_CREATOR
              )
            ) {
              //Queries for one to one solution updates
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
              //Query to get Touser details from user Extension
              let findQuery = {
                userId: reqData.toUserProfile.userId,
              };
              let toUserData = await userExtensionsHelper.userExtensionDocument(
                findQuery
              );

              if (toUserData) {
                // updating program in userExtension collection

                /**
                   * @fromUserData
                   *   {
                         _id: 662fdbdbe53ee147322ed8ee,
                        roles: [],
                        status: 'active',
                        isDeleted: false,
                        devices: [ [] ],
                        userProfileScreenVisitedTrack: null,
                        ratings: [],
                        platformRoles: [
                              {
                                  roleId: 60c83b247f8464532732cdc3,
                                  code: 'PROGRAM_DESIGNER',
                                  programs: [Array],
                                  isAPlatformRole: true,
                                  entities: []
                              },
                              {
                                  roleId: 60c74aa8b81797534e9a3f11,
                                  code: 'PROGRAM_MANAGER',
                                  programs: [Array]
                              }
                        ],
                       deleted: false,
                       userId: '9bb884fc-8a56-4727-9522-25a7d5b8ea21',
                     }
                   * @toUserData
                     {
                        _id: 662fdbdbe53ee147322ed8ee,
                         roles: [],
                         status: 'active',
                         isDeleted: false,
          
                         platformRoles: [
                           {
                              roleId: 60c83b247f8464532732cdc3,
                              code: 'PROGRAM_DESIGNER',
                              programs: [Array],
                              isAPlatformRole: true,
                              entities: []
                           },
                     
                    ],
                    deleted: false,
                    userId: '9bb884fc-8a56-4727-9522-25a7d5b8ea21',
                  }
                  @reqBodyData - edata of Event
                  @response -promise
               */
                let transferResult = await this.transferPlatformRoles(
                  fromUserData,
                  toUserData,
                  reqData
                );
                if (!transferResult.success) {
                  throw {
                    message: constants.apiResponses.PROGRAM_NOT_TRANSFERRED,
                  };
                }
              } else {
                //Query  to  add or create in user Extension collection
                let addUserExtension = {
                  userId: reqData.toUserProfile.userId,
                  userName: reqData.toUserProfile.userName,
                  updatedBy: reqData.actionBy.userId,
                  createdBy: reqData.actionBy.userId,
                };

                //return platformRoles according to Parial or one to one transfer from fromUser
                /**
                   * @fromUserData
                   *    [
                              {
                                  roleId: 60c83b247f8464532732cdc3,
                                  code: 'PROGRAM_DESIGNER',
                                  programs: [Array],
                                  isAPlatformRole: true,
                                  entities: []
                              },
                              {
                                  roleId: 60c74aa8b81797534e9a3f11,
                                  code: 'PROGRAM_MANAGER',
                                  programs: [Array]
                              }
                        ],
                      
                  @response -
                   [
                     {
                       roleId: 60c74aa8b81797534e9a3f11,
                       code: 'PROGRAM_MANAGER',
                       programs: [
                           607d320de9cce45e22ce90c0,
                                ]
                      },
                  ]
               */
                let platformRolesToUpdate = await this.fetchuserRolesToTransfer(
                  fromUserData.platformRoles,
                  reqData
                );

                //create user if not exits in the user extension collection
                let createUserExtension =
                  await userExtensionsHelper.createOrUpdate(
                    [],
                    addUserExtension
                  );
                if (createUserExtension) {
                  let matchQuery = {
                    userId: reqData.toUserProfile.userId,
                  };

                  let pushQuery = {
                    $push: {
                      platformRoles: {
                        $each: platformRolesToUpdate,
                      },
                    },
                  };

                  let fromUserMatchQuery = {
                    userId: reqData.fromUserProfile.userId,
                  };
                  let setQuery = {
                    $pull: {
                      platformRoles: {
                        code: {
                          $in: platformRolesToUpdate.map((role) => role.code),
                        },
                      },
                    },
                  };
                  let updateUserExtension =
                    await userExtensionsHelper.updateMany(
                      matchQuery,
                      pushQuery
                    );
                  if (updateUserExtension) {
                    await userExtensionsHelper.updateMany(
                      fromUserMatchQuery,
                      setQuery
                    );
                  }
                }
              }
              //Queries to update owner in programs Collections for ownership transfer
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
            //condition for if there is an assetInformation in ownershipTransferEvent
            let typeOfAssetsToMove = reqData.assetInformation.objectType;
            if (
              reqData.toUserProfile.roles.includes(
                constants.common.CONTENT_CREATOR
              ) &&
              typeOfAssetsToMove === constants.common.SOULTION
            ) {
              //match and Set Queries for solutions partial Transfer
              let solutionFilter = {
                _id: new ObjectId(reqData.assetInformation.identifier),
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
              let updatedOneToOneTransferSolution = await Promise.all(
                updateUserSolutions
              );
              updatedOneToOneTransferSolution
                ? (updateUserAssetDataResult = true)
                : (updateUserAssetDataResult = false);
            }
            if (
              (reqData.toUserProfile.roles.includes(
                constants.common.PROGRAM_MANAGER
              ) ||
                reqData.toUserProfile.roles.includes(
                  constants.common.PROGRAM_DESIGNER
                )) &&
              typeOfAssetsToMove === constants.common.PROGRAM
            ) {
              let fromUserData =
                await userExtensionsHelper.userExtensionDocument(fromFindQuery);
              //Query to check toUser exits on userExtension collection
              let toFindQuery = {
                userId: reqData.toUserProfile.userId,
              };
              let toUserData = await userExtensionsHelper.userExtensionDocument(
                toFindQuery
              );
              if (toUserData) {
                //return promise after updating program in userExtension collection
                /**
                   * @fromUserData
                   *   {
                         _id: 662fdbdbe53ee147322ed8ee,
                        roles: [],
                        status: 'active',
                        isDeleted: false,
                        devices: [ [] ],
                        userProfileScreenVisitedTrack: null,
                        ratings: [],
                        platformRoles: [
                              {
                                  roleId: 60c83b247f8464532732cdc3,
                                  code: 'PROGRAM_DESIGNER',
                                  programs: [Array],
                                  isAPlatformRole: true,
                                  entities: []
                              },
                              {
                                  roleId: 60c74aa8b81797534e9a3f11,
                                  code: 'PROGRAM_MANAGER',
                                  programs: [Array]
                              }
                        ],
                       deleted: false,
                       userId: '9bb884fc-8a56-4727-9522-25a7d5b8ea21',
                     }
                   * @toUserData
                     {
                        _id: 662fdbdbe53ee147322ed8ee,
                         roles: [],
                         status: 'active',
                         isDeleted: false,
          
                         platformRoles: [
                           {
                              roleId: 60c83b247f8464532732cdc3,
                              code: 'PROGRAM_DESIGNER',
                              programs: [Array],
                              isAPlatformRole: true,
                              entities: []
                           },
                     
                    ],
                    deleted: false,
                    userId: '9bb884fc-8a56-4727-9522-25a7d5b8ea21',
                  }
                  @reqBodyData - edata of Event
                  @checkAssetInformation - true or false
                  @response -promise
               */
                let transferResult = await this.transferPlatformRoles(
                  fromUserData,
                  toUserData,
                  reqData,
                  checkAssetInformation
                );
                if (!transferResult.success) {
                  throw {
                    message: constants.apiResponses.PROGRAM_NOT_TRANSFERRED,
                  };
                }
              } else {
                //Query to add or create new user in user Extension
                let addUserExtension = {
                  userId: reqData.toUserProfile.userId,
                  userName: reqData.toUserProfile.userName,
                  updatedBy: reqData.actionBy.userId,
                  createdBy: reqData.actionBy.userId,
                };
                /**
                   * @fromUserData
                   *   {
                         _id: 662fdbdbe53ee147322ed8ee,
                        roles: [],
                        status: 'active',
                        isDeleted: false,
                        devices: [ [] ],
                        userProfileScreenVisitedTrack: null,
                        ratings: [],
                        platformRoles: [
                              {
                                  roleId: 60c83b247f8464532732cdc3,
                                  code: 'PROGRAM_DESIGNER',
                                  programs: [Array],
                                  isAPlatformRole: true,
                                  entities: []
                              },
                              {
                                  roleId: 60c74aa8b81797534e9a3f11,
                                  code: 'PROGRAM_MANAGER',
                                  programs: [Array]
                              }
                        ],
                       deleted: false,
                       userId: '9bb884fc-8a56-4727-9522-25a7d5b8ea21',
                     }
                  @reqBodyData - edata of Event
                  @checkAssetInformation - true or false
                  @response -
                   [
                     {
                       roleId: 60c74aa8b81797534e9a3f11,
                       code: 'PROGRAM_MANAGER',
                       programs: [
                           607d320de9cce45e22ce90c0,
                                ]
                      },
                  ]
               */
                let platformRolesToUpdate = await this.fetchuserRolesToTransfer(
                  fromUserData.platformRoles,
                  reqData,
                  checkAssetInformation
                );

                //create new user if not exits in the user extension
                let createUserExtension =
                  await userExtensionsHelper.createOrUpdate(
                    [], // device data array
                    addUserExtension
                  );
                if (createUserExtension) {
                  let mactchQuery = {
                    userId: reqData.toUserProfile.userId,
                  };

                  // Push Paticular program to the toUser
                  let addToSetQuery = {
                    $addToSet: {
                      platformRoles: {
                        $each: platformRolesToUpdate,
                      },
                    },
                  };

                  let fromUserMatchQuery = {
                    userId: reqData.fromUserProfile.userId,
                  };
                  let pullQuery = {
                    $pull: {
                      "platformRoles.$[elem].programs": new ObjectId(
                        reqData.assetInformation.identifier
                      ),
                    },
                  };
                  let arrayFilters = {
                    arrayFilters: [
                      { "elem.code": platformRolesToUpdate[0].code },
                    ],
                  };

                  let updateUserExtension =
                    await userExtensionsHelper.updateMany(
                      mactchQuery,
                      addToSetQuery
                    );
                  if (updateUserExtension) {
                    await userExtensionsHelper.updateMany(
                      fromUserMatchQuery,
                      pullQuery,
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
            /**
             * @telemetryEvent
             * {
                  timestamp: 2024-05-06T06:15:54.742Z,
                  msg: '{"eid":"AUDIT","ets":1714976154741,"ver":"3.0","mid":"bf25ba06-4d13-4161-83b2-aec50ceb1a56","actor":{"id":"9bb884fc-8a56-4727-9522-25a7d5b8ea28","type":"User"},"context":{"channel":"","pdata":{"id":"projectservice","ver":"8.0.0","pid":"projectservice.ownerTransfer"},"env":"User","cdata":[],"rollup":{}},"object":{"id":"9bb884fc-8a56-4727-9522-25a7d5b8ea28","type":"User"},"edata":{"state":"Transfer","type":"OwnerTransferStatus","props":[]}}',
                  lname: 'TelemetryEventLogger',
                  tname: '',
                 level: 'INFO',
                  HOSTNAME: '',
  '               application.home': ''
                } 
               */
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
   * Transfers programs from one user to another.
   * @method transferPlatformRoles
   * @param {Object} fromUserData - The user data to transfer programs from.
   * @param {Object} toUserData   - The user data to transfer programs to.
   * @param {Object} [reqData={}] - requesbody data.
   * @param {boolean} [checkAssetInformation=false] - check asset information.
   * @returns {Promise<Object>}   -A promise that resolves with an object indicating the success of the program transfer.
   * @throws {Error}              -If an error occurs during the transfer process.
   */

  static transferPlatformRoles(
    fromUserData,
    toUserData,
    reqData = {},
    checkAssetInformation = false
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let updatePlatformRoleQueries = [];
        fromUserData.platformRoles.forEach(async (role) => {
          //Program Role code of fromUser
          let userRole = role.code;
          // Check if user Role already exists in userExtension or not 
          let toUserRoleExists = toUserData.platformRoles.some(
            (toRole) => toRole.code === userRole
          );

          // Check user Role  exists in KafkaEvent 

          let kafkaeventToUserRoles = reqData.toUserProfile.roles.some(
            (toUserRole) => toUserRole === userRole
          );
          // If Platform role  doesn't exist in toUserExtensionData and exists in kafka toUserRole

          if (!toUserRoleExists && kafkaeventToUserRoles) {
            // check partial or one to one Transfer if programRole not exits in toUser
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
                updatePlatformRoleQueries.push(
                  userExtensionsHelper.updateMany(
                    { userId: toUserData.userId },
                    {
                      $push: {
                        platformRoles: newRole,
                      },
                    }
                  ),

                  userExtensionsHelper.updateMany(
                    { userId: fromUserData.userId },
                    {
                      $pull: {
                        "platformRoles.$[elem].programs": new ObjectId(
                          reqData.assetInformation.identifier
                        ),
                      },
                    },
                    { arrayFilters: [{ "elem.code": userRole }] }
                  )
                );
              }
            } else {
              updatePlatformRoleQueries.push(
                userExtensionsHelper.updateMany(
                  { userId: toUserData.userId },
                  {
                    $push: {
                      platformRoles: role,
                    },
                  }
                ),

                userExtensionsHelper.updateMany(
                  { userId: fromUserData.userId },
                  {
                    $pull: {
                      platformRoles: { code: userRole },
                    },
                  }
                )
              );
            }
          }
          // If Platform role  does exist in toUserExtensionData and exists in kafka toUserRole
          if (toUserRoleExists && kafkaeventToUserRoles) {
            let matchQuery = {
              userId: toUserData.userId,
              "platformRoles.code": userRole,
            };

            let addToSetQuery;
            let pullQuery;
            // check partial or one to one Transfer if programRole exits in toUser
            if (checkAssetInformation) {
              addToSetQuery = {
                $addToSet: {
                  "platformRoles.$[elem].programs": {
                    $each: role.programs.filter((oneProgram) =>
                      oneProgram.equals(reqData.assetInformation.identifier)
                    ),
                  },
                },
              };
              pullQuery = {
                $pull: {
                  "platformRoles.$[elem].programs": new ObjectId(
                    reqData.assetInformation.identifier
                  ),
                },
              };
            } else {
              addToSetQuery = {
                $addToSet: {
                  "platformRoles.$[elem].programs": {
                    $each: role.programs,
                  },
                },
              };
              pullQuery = {
                $pull: {
                  "platformRoles.$[elem].programs": {
                    $in: role.programs,
                  },
                },
              };
            }

            let arrayFilters = { arrayFilters: [{ "elem.code": userRole }] };

            let fromUserMatchQuery = {
              userId: fromUserData.userId,
              "platformRoles.code": userRole,
            };

            updatePlatformRoleQueries.push(
              userExtensionsHelper.updateMany(
                matchQuery,
                addToSetQuery,
                arrayFilters
              ),
              userExtensionsHelper.updateMany(
                fromUserMatchQuery,
                pullQuery,
                arrayFilters
              )
            );
          }
        });
        let updatedResults = await Promise.all(updatePlatformRoleQueries);
        if (updatedResults) {
          return resolve({
            message: "Program transferred Successfully",
            success: true,
          });
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Retrieves platform roles to transfer based on role and assetInformation.
   * @method
   * @name getPlatformRolesToTransfer
   * @param {Array} fromUserPlatformRoleData        - User data of the from user.
   * @param {String} userRoleData                   - UserRole's Data.
   * @param {Array}  [reqData={}]                   - request body Data.
   * @param {boolean} [checkAssetInformation=false] - check asset information
   * @returns {Promise<Array>}   -Returns Array of platform roles.
   */

  static getPlatformRolesToTransfer(
    fromUserPlatformRoleData,
    userRoleData,
    reqData = {},
    checkAssetInformation = false
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let platformRoles = [];

        for (let eachRole of fromUserPlatformRoleData) {
          let matchingRole = userRoleData.find(
            (role) => role.code === eachRole.code
          );
          let kafkaeventToUserRoles = reqData.toUserProfile.roles.some(
            (toUserRole) => toUserRole === eachRole.code
          );
          if (matchingRole && kafkaeventToUserRoles) {
            let roleId = matchingRole._id;
            let roleDetails;
            if (checkAssetInformation) {
              let checkRoleToUpdateProgram = eachRole.programs.some(
                (programId) =>
                  programId.equals(reqData.assetInformation.identifier)
              );
              if (checkRoleToUpdateProgram) {
                roleDetails = {
                  roleId: roleId,
                  code: eachRole.code,
                  programs: eachRole.programs.filter((eachProgram) =>
                    eachProgram.equals(reqData.assetInformation.identifier)
                  ),
                };
              }
            } else {
              roleDetails = {
                roleId: roleId,
                code: eachRole.code,
                programs: eachRole.programs,
              };
            }

            if (
              eachRole.code === constants.common.PROGRAM_DESIGNER &&
              roleDetails
            ) {
              roleDetails.isAPlatformRole = true;
              roleDetails.entities = [];
            }
            if (roleDetails) {
              platformRoles.push(roleDetails);
            }
          }
        }
        return resolve(platformRoles);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Checks whether the from and to users have identical roles.
   * @method
   * @name checkRolesPresence
   * @param {Array} fromUserRole  - Array of roles for the from user.
   * @param {Array} toUserRole    - Array of roles for the to user.
   * @param {String} assetsType   - typeOfassets whether its program or solution
   * @returns {Promise<Boolean>}  - A promise that resolves with true if both users have identical roles, otherwise false.
   */

  static checkRolesPresence(fromUserRole, toUserRole, assetsType = "") {
    return new Promise(async (resolve, reject) => {
      try {
        let rolesToCheck = [];
        switch (assetsType) {
          case constants.common.PROGRAM:
            rolesToCheck = [
              constants.common.PROGRAM_MANAGER,
              constants.common.PROGRAM_DESIGNER,
            ];
          case constants.common.SOULTION:
            rolesToCheck = [constants.common.CONTENT_CREATOR];
          default:
            rolesToCheck = [
              constants.common.PROGRAM_MANAGER,
              constants.common.PROGRAM_DESIGNER,
              constants.common.CONTENT_CREATOR,
            ];
        }

        let hasRolesInFromArray = rolesToCheck.some((role) =>
          fromUserRole.includes(role)
        );
        let hasRolesInToArray = rolesToCheck.some((role) =>
          toUserRole.includes(role)
        );

        return resolve(hasRolesInFromArray && hasRolesInToArray);
      } catch (err) {
        reject(err);
      }
    });
  }
  /**
 * Retrieves platform roles with userRoles to transfer to a user when the user is not in the UserExtension collection.
 * @method
 * @name fetchuserRolesToTransfer
 * @param {Array} fromUserData            - Fromuser data
 * @param {Object} reqBodyData            - eData of the event.
 * @param {Boolean} checkAssetInformation - whether to check the asset information
 * @returns {Promise<Array>} A promise that resolves with an array of platform roles with userRoles to push for the touser.
 * @returns
 * 

 * [
          {
            roleId: 60c74aa8b81797534e9a3f11,
            code: 'PROGRAM_MANAGER',
            programs: [
              607d320de9cce45e22ce90c0,
            ]
          },
          {
            roleId: 60c83b247f8464532732cdc3,
            code: 'PROGRAM_DESIGNER',
            programs: [
                601429016a1ef53356b1d714,
            ],
            isAPlatformRole: true,
            entities: []
            }
          ]
 */
  static fetchuserRolesToTransfer(
    platformRoles,
    reqBodyData = {},
    checkAssetInformation = false
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let fromUserRoleCodes = platformRoles.map((role) => role.code);

        let matchQuery = {
          code: { $in: fromUserRoleCodes },
        };
        let userRoleData = await userRolesHelper.roleDocuments(matchQuery);

        /**
         * @platformRoles
         *   [
                     {
                         roleId: 60c83b247f8464532732cdc3,
                         code: 'PROGRAM_DESIGNER',
                         programs: [Array],
                        isAPlatformRole: true,
                        entities: []
                       },
                      {
                          roleId: 60c74aa8b81797534e9a3f11,
                          code: 'PROGRAM_MANAGER',
                           programs: [Array]
                      }
                    ],
              deleted: false,
              userId: '9bb884fc-8a56-4727-9522-25a7d5b8ea21',
            
        * @userRoleData
            [
              {
                 _id: 60c74aa8b81797534e9a3f11,
                  entityTypes: [],
                  status: 'active',
                  isDeleted: false,
                  isAPlatformRole: true,
                  deleted: false,
                  updatedBy: '0fecc38b-956c-4909-a3e7-be538ef7acd4',
                  createdBy: '0fecc38b-956c-4909-a3e7-be538ef7acd4',
                  code: 'PROGRAM_MANAGER',
                  title: 'Program Manager',
                  updatedAt: 2021-06-14T12:25:12.184Z,
                 createdAt: 2021-06-14T12:25:12.184Z,
                __v: 0
               }
          ] 
          @reqBodyData - edata of Event
          @checkAssetInformation -true or false
          @response -promise
          [
             {
                roleId: 60c83b247f8464532732cdc3,
                code: 'PROGRAM_DESIGNER',
                programs: [Array],
                isAPlatformRole: true,
                entities: []
             },
             {
                roleId: 60c74aa8b81797534e9a3f11,
                code: 'PROGRAM_MANAGER',
                programs: [Array]
              }
          ]
     */
        let platformrolesData = await this.getPlatformRolesToTransfer(
          platformRoles,
          userRoleData,
          reqBodyData,
          checkAssetInformation
        );
        return resolve(platformrolesData);
      } catch (error) {
        reject(error);
      }
    });
  }
};
