/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Programs related helper functionality.
 */

// Dependencies

const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const userService = require(ROOT_PATH + "/generics/services/users");
const kafkaProducersHelper = require(ROOT_PATH + "/generics/kafka/producers");
const programUsersHelper = require(MODULES_BASE_PATH + "/programUsers/helper");
const timeZoneDifference =
  process.env.TIMEZONE_DIFFRENECE_BETWEEN_LOCAL_TIME_AND_UTC;
  const validateEntity = process.env.VALIDATE_ENTITIES
/**
 * ProgramsHelper
 * @class
 */
module.exports = class ProgramsHelper {
  /**
   * Programs Document.
   * @method
   * @name programDocuments
   * @param {Array} [filterQuery = "all"] - solution ids.
   * @param {Array} [fieldsArray = "all"] - projected fields.
   * @param {Array} [skipFields = "none"] - field not to include.
   * @param {Number} pageNo - page no.
   * @param {Number} pageSize - page size.
   * @returns {Array} List of programs.
   */

  static programDocuments(
    filterQuery = "all",
    fieldsArray = "all",
    skipFields = "none",
    pageNo = "",
    pageSize = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = filterQuery != "all" ? filterQuery : {};

        let projection = {};
        let pagination = {};
        if (fieldsArray != "all") {
          fieldsArray.forEach((field) => {
            projection[field] = 1;
          });
        }

        if (skipFields !== "none") {
          skipFields.forEach((field) => {
            projection[field] = 0;
          });
        }
        if (pageNo !== "" && pageSize !== "") {
          pagination = {
            skip: pageSize * (pageNo - 1),
            limit: pageSize,
          };
        }

        let programData = await database.models.programs
          .find(queryObject, projection, pagination)
          .lean();

        return resolve(programData);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Create program
   * @method
   * @name create
   * @param {Array} data
   * @param {Boolean} checkDate this is true for when its called via API calls
   * @returns {JSON} - create program.
   */

  static create(data, checkDate = false) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = {
          isDeleted: false,
          status: "active",
          components: [],
          isAPrivateProgram: data.isAPrivateProgram
            ? data.isAPrivateProgram
            : false,
          owner: data.userId,
          createdBy: data.userId,
          updatedBy: data.userId,
        };

        if (checkDate) {
          if (data.hasOwnProperty("endDate")) {
            data.endDate = gen.utils.getEndDate(
              data.endDate,
              timeZoneDifference
            );
          }
          if (data.hasOwnProperty("startDate")) {
            data.startDate = gen.utils.getStartDate(
              data.startDate,
              timeZoneDifference
            );
          }
        }

        _.assign(programData, {
          ...data,
        });
        programData = _.omit(programData, ["scope", "userId"]);
        let program = await database.models.programs.create(programData);

        if (!program._id) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_CREATED,
          };
        }

        if (data.scope) {
          let programScopeUpdated = await this.setScope(
            program._id,
            data.scope
          );

          if (!programScopeUpdated.success) {
            throw {
              message: constants.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM,
            };
          }
        }

        return resolve(program);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * List of user created programs
   * @method
   * @name userPrivatePrograms
   * @param {String} userId
   * @returns {JSON} - List of programs that user created on app.
   */

  static userPrivatePrograms(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        let programsData = await this.programDocuments(
          {
            createdBy: userId,
            isAPrivateProgram: true,
          },
          ["name", "externalId", "description", "_id", "isAPrivateProgram"]
        );

        if (!programsData.length > 0) {
          return resolve({
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
            result: [],
          });
        }

        return resolve(programsData);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * set scope in program
   * @method
   * @name setScope
   * @param {String} programId - program id.
   * @param {Object} scopeData - scope data.
   * @param {String} scopeData.entityType - entity type
   * @param {Array} scopeData.entities - entities in scope
   * @param {Array} scopeData.roles - roles in scope
   * @returns {JSON} - Set scope data.
   */

  static setScope(programId, scopeData) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await this.programDocuments({ _id: programId }, [
          "_id",
        ]);

        if (!programData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        let scope = {};
        if(validateEntity !== constants.common.OFF){

          if (scopeData.entityType) {
            // Get entity details of type {scopeData.entityType}
            let bodyData = {
              type: scopeData.entityType,
            };
            let entityTypeData = await userService.locationSearch(bodyData);

            if (!entityTypeData.success) {
              return resolve({
                status: httpStatusCode.bad_request.status,
                message: constants.apiResponses.ENTITY_TYPES_NOT_FOUND,
              });
            }

            scope["entityType"] = entityTypeData.data[0].type;
          }

          if (scopeData.entities && scopeData.entities.length > 0) {
            //call learners api for search
            let entityIds = [];
            let bodyData = {};
            let locationData = gen.utils.filterLocationIdandCode(
              scopeData.entities
            );

            //locationIds contain id of location data.
            if (locationData.ids.length > 0) {
              bodyData = {
                id: locationData.ids,
                type: scopeData.entityType,
              };
              let entityData = await userService.locationSearch(bodyData);
              if (entityData.success) {
                entityData.data.forEach((entity) => {
                  entityIds.push(entity.id);
                });
              }
            }

            if (locationData.codes.length > 0) {
              let filterData = {
                code: locationData.codes,
                type: scopeData.entityType,
              };
              let entityDetails = await userService.locationSearch(filterData);

              if (entityDetails.success) {
                let entitiesData = entityDetails.data;
                entitiesData.forEach((entity) => {
                  entityIds.push(entity.id);
                });
              }
            }

            if (!entityIds.length > 0) {
              throw {
                message: constants.apiResponses.ENTITIES_NOT_FOUND,
              };
            }
            scope["entities"] = entityIds;
          }
        
          if (scopeData.roles) {
            if (Array.isArray(scopeData.roles) && scopeData.roles.length > 0) {
              let userRoles = await userRolesHelper.roleDocuments(
                {
                  code: { $in: scopeData.roles },
                },
                ["_id", "code"]
              );

              if (!userRoles.length > 0) {
                return resolve({
                  status: httpStatusCode.bad_request.status,
                  message: constants.apiResponses.INVALID_ROLE_CODE,
                });
              }

              scope["roles"] = userRoles;
            } else {
              if (scopeData.roles === constants.common.ALL_ROLES) {
                scope["roles"] = [
                  {
                    code: constants.common.ALL_ROLES,
                  },
                ];
              }
            }
          }
        } else {
          scope = scopeData
        }
        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            { $set: { scope: scope } },
            { new: true }
          )
          .lean();

        if (!updateProgram._id) {
          throw {
            status: constants.apiResponses.PROGRAM_SCOPE_NOT_ADDED,
          };
        }

        return resolve({
          success: true,
          message: constants.apiResponses.PROGRAM_UPDATED_SUCCESSFULLY,
          data: updateProgram,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Update program
   * @method
   * @name update
   * @param {String} programId - program id.
   * @param {Array} data
   * @param {String} userId
   * @param {Boolean} checkDate this is true for when its called via API calls
   * @returns {JSON} - update program.
   */

  static update(programId, data, userId, checkDate = false) {
    return new Promise(async (resolve, reject) => {
      try {
        data.updatedBy = userId;
        data.updatedAt = new Date();
        //convert components to objectedIds
        if (data.components && data.components.length > 0) {
          data.components = data.components.map((component) =>
            gen.utils.convertStringToObjectId(component)
          );
        }

        if (checkDate) {
          if (data.hasOwnProperty("endDate")) {
            data.endDate = gen.utils.getEndDate(
              data.endDate,
              timeZoneDifference
            );
          }
          if (data.hasOwnProperty("startDate")) {
            data.startDate = gen.utils.getStartDate(
              data.startDate,
              timeZoneDifference
            );
          }
        }
        let program = await database.models.programs.findOneAndUpdate(
          {
            _id: programId,
          },
          { $set: _.omit(data, ["scope"]) },
          { new: true }
        );

        if (!program) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        if (data.scope) {
          let programScopeUpdated = await this.setScope(programId, data.scope);

          if (!programScopeUpdated.success) {
            throw {
              message: constants.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM,
            };
          }
        }

        return resolve({
          success: true,
          message: constants.apiResponses.PROGRAMS_UPDATED,
          data: {
            _id: programId,
          },
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: {},
        });
      }
    });
  }

  /**
   * List program
   * @method
   * @name list
   * @param {Number} pageNo - page no.
   * @param {Number} pageSize - page size.
   * @param {String} searchText - text to search.
   *  @param {Object} filter - filter.
   *  @param {Array} projection - projection.
   * @returns {Object} - Programs list.
   */

  static list(pageNo = "", pageSize = "", searchText, filter = {}, projection) {
    return new Promise(async (resolve, reject) => {
      try {
        let programDocument = [];

        let matchQuery = { status: constants.common.ACTIVE };

        if (Object.keys(filter).length > 0) {
          matchQuery = _.merge(matchQuery, filter);
        }

        if (searchText !== "") {
          matchQuery["$or"] = [];
          matchQuery["$or"].push(
            {
              externalId: new RegExp(searchText, "i"),
            },
            {
              name: new RegExp(searchText, "i"),
            },
            {
              description: new RegExp(searchText, "i"),
            }
          );
        }

        let sortQuery = {
          $sort: { createdAt: -1 },
        };

        let projection1 = {};

        if (projection && projection.length > 0) {
          projection.forEach((projectedData) => {
            projection1[projectedData] = 1;
          });
        } else {
          projection1 = {
            description: 1,
            externalId: 1,
            isAPrivateProgram: 1,
          };
        }

        let facetQuery = {};
        facetQuery["$facet"] = {};

        facetQuery["$facet"]["totalCount"] = [{ $count: "count" }];

        if (pageSize === "" && pageNo === "") {
          facetQuery["$facet"]["data"] = [{ $skip: 0 }];
        } else {
          facetQuery["$facet"]["data"] = [
            { $skip: pageSize * (pageNo - 1) },
            { $limit: pageSize },
          ];
        }

        let projection2 = {};
        projection2["$project"] = {
          data: 1,
          count: {
            $arrayElemAt: ["$totalCount.count", 0],
          },
        };

        programDocument.push(
          { $match: matchQuery },
          sortQuery,
          { $project: projection1 },
          facetQuery,
          projection2
        );

        let programDocuments = await database.models.programs.aggregate(
          programDocument
        );
        return resolve({
          success: true,
          message: constants.apiResponses.PROGRAM_LIST,
          data: programDocuments[0],
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: [],
        });
      }
    });
  }

  /**
   * List of programs based on role and location.
   * @method
   * @name forUserRoleAndLocation
   * @param {String} bodyData - Requested body data.
   * @param {String} pageSize - Page size.
   * @param {String} pageNo - Page no.
   * @param {String} searchText - search text.
   * @returns {JSON} - List of programs based on role and location.
   */

  static forUserRoleAndLocation(
    bodyData,
    pageSize,
    pageNo,
    searchText = "",
    projection,
    programId = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryData = await this.queryBasedOnRoleAndLocation(bodyData);

        if (!queryData.success) {
          return resolve(queryData);
        }
        if (programId !== "") {
          queryData.data._id = gen.utils.convertStringToObjectId(programId);
        }
        queryData.data.startDate = { $lte: new Date() };
        queryData.data.endDate = { $gte: new Date() };

        let targetedPrograms = await this.list(
          pageNo,
          pageSize,
          searchText,
          queryData.data,
          projection
        );

        return resolve({
          success: true,
          message: constants.apiResponses.TARGETED_PROGRAMS_FETCHED,
          data: targetedPrograms.data.data,
          count: targetedPrograms.data.count,
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: {},
        });
      }
    });
  }

  /**
   * Query data based on role and location.
   * @method
   * @name queryBasedOnRoleAndLocation
   * @param {Object} data - Requested body data.
   * @returns {JSON} - Query data based on role and location.
   */

  static queryBasedOnRoleAndLocation(data) {
    return new Promise(async (resolve, reject) => {
      try {
        let filterQuery = {
          isDeleted: false,
          status: constants.common.ACTIVE,
        }
        if(validateEntity !== constants.common.OFF){
          let locationIds = Object.values(_.omit(data, ["role", "filter"])).map(
            (locationId) => {
              return locationId;
            }
          );
          if (!locationIds.length > 0) {
            throw {
              message: constants.apiResponses.NO_LOCATION_ID_FOUND_IN_DATA,
            };
          }

          filterQuery = {
            "scope.roles.code": {
              $in: [constants.common.ALL_ROLES, ...data.role.split(",")],
            },
            "scope.entities": { $in: locationIds },
          };
        } else {
          let userRoleInfo = _.omit(data, ['filter'])
          let userRoleKeys = Object.keys(userRoleInfo);
          userRoleKeys.forEach(entities => {
            filterQuery["scope."+entities] = {$in:userRoleInfo[entities].split(",")}
          });
        }

        if (data.filter && Object.keys(data.filter).length > 0) {
          Object.keys(data.filter).forEach((filterKey) => {
            if (gen.utils.isValidMongoId(data.filter[filterKey])) {
              data.filter[filterKey] = ObjectId(data.filter[filterKey]);
            }
          });

          filterQuery = _.merge(filterQuery, data.filter);
        }

        return resolve({
          success: true,
          data: filterQuery,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
          data: {},
        });
      }
    });
  }

  /**
   * Add roles in program.
   * @method
   * @name addRolesInScope
   * @param {String} programId - Program Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Added roles data.
   */

  static addRolesInScope(programId, roles) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await this.programDocuments(
          {
            _id: programId,
            scope: { $exists: true },
            isAPrivateProgram: false,
          },
          ["_id"]
        );

        if (!programData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        let updateQuery = {};

        if (Array.isArray(roles) && roles.length > 0) {
          let userRoles = await userRolesHelper.roleDocuments(
            {
              code: { $in: roles },
            },
            ["_id", "code"]
          );

          if (!userRoles.length > 0) {
            return resolve({
              status: httpStatusCode.bad_request.status,
              message: constants.apiResponses.INVALID_ROLE_CODE,
            });
          }

          await database.models.programs
            .findOneAndUpdate(
              {
                _id: programId,
              },
              {
                $pull: { "scope.roles": { code: constants.common.ALL_ROLES } },
              },
              { new: true }
            )
            .lean();

          updateQuery["$addToSet"] = {
            "scope.roles": { $each: userRoles },
          };
        } else {
          if (roles === constants.common.ALL_ROLES) {
            updateQuery["$set"] = {
              "scope.roles": [{ code: constants.common.ALL_ROLES }],
            };
          }
        }

        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            updateQuery,
            { new: true }
          )
          .lean();

        if (!updateProgram || !updateProgram._id) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        return resolve({
          message: constants.apiResponses.ROLES_ADDED_IN_PROGRAM,
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }

  /**
   * Add entities in program.
   * @method
   * @name addEntitiesInScope
   * @param {String} programId - Program Id.
   * @param {Array} entities - entities data.
   * @returns {JSON} - Added entities data.
   */

  static addEntitiesInScope(programId, entities) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await this.programDocuments(
          {
            _id: programId,
            scope: { $exists: true },
            isAPrivateProgram: false,
          },
          ["_id", "scope.entityType"]
        );

        if (!programData.length > 0) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          };
        }

        let entityIds = [];
        let bodyData = {};
        let locationData = gen.utils.filterLocationIdandCode(entities);

        if (locationData.ids.length > 0) {
          bodyData = {
            id: locationData.ids,
            type: programData[0].scope.entityType,
          };
          let entityData = await userService.locationSearch(bodyData);
          if (entityData.success) {
            entityData.data.forEach((entity) => {
              entityIds.push(entity.id);
            });
          }
        }

        if (locationData.codes.length > 0) {
          let filterData = {
            code: locationData.codes,
            type: programData[0].scope.entityType,
          };
          let entityDetails = await userService.locationSearch(filterData);

          if (entityDetails.success) {
            entityDetails.data.forEach((entity) => {
              entityIds.push(entity.externalId);
            });
          }
        }

        if (!entityIds.length > 0) {
          throw {
            message: constants.apiResponses.ENTITIES_NOT_FOUND,
          };
        }

        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            {
              $addToSet: { "scope.entities": { $each: entityIds } },
            },
            { new: true }
          )
          .lean();

        if (!updateProgram || !updateProgram._id) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        return resolve({
          message: constants.apiResponses.ENTITIES_ADDED_IN_PROGRAM,
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }

  /**
   * remove roles in program.
   * @method
   * @name removeRolesInScope
   * @param {String} programId - Program Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Added roles data.
   */

  static removeRolesInScope(programId, roles) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await this.programDocuments(
          {
            _id: programId,
            scope: { $exists: true },
            isAPrivateProgram: false,
          },
          ["_id"]
        );

        if (!programData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        let userRoles = await userRolesHelper.roleDocuments(
          {
            code: { $in: roles },
          },
          ["_id", "code"]
        );

        if (!userRoles.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.INVALID_ROLE_CODE,
          });
        }

        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            {
              $pull: { "scope.roles": { $in: userRoles } },
            },
            { new: true }
          )
          .lean();

        if (!updateProgram || !updateProgram._id) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        return resolve({
          message: constants.apiResponses.ROLES_REMOVED_IN_PROGRAM,
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }

  /**
   * remove entities in program scope.
   * @method
   * @name removeEntitiesInScope
   * @param {String} programId - Program Id.
   * @param {Array} entities - entities.
   * @returns {JSON} - Removed entities data.
   */

  static removeEntitiesInScope(programId, entities) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await this.programDocuments(
          {
            _id: programId,
            scope: { $exists: true },
            isAPrivateProgram: false,
          },
          ["_id", "scope.entities"]
        );

        if (!programData.length > 0) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          };
        }
        let entitiesData = [];
        entitiesData = programData[0].scope.entities;

        if (!entitiesData.length > 0) {
          throw {
            message: constants.apiResponses.ENTITIES_NOT_FOUND,
          };
        }

        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            {
              $pull: { "scope.entities": { $in: entities } },
            },
            { new: true }
          )
          .lean();

        if (!updateProgram || !updateProgram._id) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        return resolve({
          message: constants.apiResponses.ENTITIES_REMOVED_IN_PROGRAM,
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }

  /**
   * Program details.
   * @method
   * @name details
   * @param {String} programId - Program Id.
   * @returns {Object} - Details of the program.
   */

  static details(programId) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await this.programDocuments({
          _id: programId,
        });

        if (!programData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        return resolve({
          message: constants.apiResponses.PROGRAMS_FETCHED,
          success: true,
          data: programData[0],
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }

  /**
   * Program join.
   * @method
   * @name join
   * @param {String} programId - Program Id.
   * @param {Object} data - body data (can include isResourse flag && userRoleInformation).
   * @param {String} userId - Logged in user id.
   * @param {String} userToken - User token.
   * @param {String} [appName = ""] - App Name.
   * @param {String} [appVersion = ""] - App Version.
   * @param {Boolean} callConsetAPIOnBehalfOfUser - required to call consent api or not
   * @returns {Object} - Details of the program join.
   */

  static join(
    programId,
    data,
    userId,
    userToken,
    appName = "",
    appVersion = "",
    callConsetAPIOnBehalfOfUser = false
  ) {
    return new Promise(async (resolve, reject) => {
      try {
       
          let pushProgramUsersDetailsToKafka = false;
          //Using programId fetch program details. Also checking the program status in the query.
          let programData = await this.programDocuments(
            {
              _id: programId,
              status: constants.common.ACTIVE,
              isDeleted: false,
            },
            ["name", "externalId", "requestForPIIConsent", "rootOrganisations"]
          );

          if (!programData.length > 0) {
            throw {
              status: httpStatusCode.bad_request.status,
              message: constants.apiResponses.PROGRAM_NOT_FOUND,
            };
          }
          let programUsersData = {};
          let update = {};

          // check if user already joined for program or not
          const programUsersDetails =
            await programUsersHelper.programUsersDocuments(
              {
                userId: userId,
                programId: programId,
              },
              ["_id", "consentShared"]
            );
          // if user not joined for program. we have add more key values to programUsersData
          if (!programUsersDetails.length > 0) {
            // Fetch user profile information by calling sunbird's user read api.
            // !Important check specific fields of userProfile.
            let userProfile = await userService.profile(userToken, userId);
            if (
              !userProfile.success ||
              !userProfile.data ||
              !userProfile.data.profileUserTypes ||
              !userProfile.data.profileUserTypes.length > 0 ||
              !userProfile.data.userLocations ||
              !userProfile.data.userLocations.length > 0
            ) {
              throw {
                status: httpStatusCode.bad_request.status,
                message: constants.apiResponses.PROGRAM_JOIN_FAILED,
              };
            }
            programUsersData = {
              programId: programId,
              userRoleInformation: data.userRoleInformation,
              userId: userId,
              userProfile: userProfile.data,
              resourcesStarted: false,
            };
            if (appName != "") {
              programUsersData["appInformation.appName"] = appName;
            }
            if (appVersion != "") {
              programUsersData["appInformation.appVersion"] = appVersion;
            }

            //For internal calls add consent using sunbird api
            if (
              callConsetAPIOnBehalfOfUser &&
              programData[0].hasOwnProperty("requestForPIIConsent") &&
              programData[0].requestForPIIConsent === true
            ) {
              if (
                !programData[0].rootOrganisations ||
                !programData[0].rootOrganisations.length > 0
              ) {
                throw {
                  message: constants.apiResponses.PROGRAM_JOIN_FAILED,
                  status: httpStatusCode.bad_request.status,
                };
              }
              let userConsentRequestBody = {
                request: {
                  consent: {
                    status: constants.common.REVOKED,
                    userId: userProfile.data.id,
                    consumerId: programData[0].rootOrganisations[0],
                    objectId: programId,
                    objectType: constants.common.PROGRAM,
                  },
                },
              };
              let consentResponse = await userService.setUserConsent(
                userToken,
                userConsentRequestBody
              );

              if (!consentResponse.success) {
                throw {
                  message: constants.apiResponses.PROGRAM_JOIN_FAILED,
                  status: httpStatusCode.bad_request.status,
                };
              }
            }
          }

          // if requestForPIIConsent Is false and user not joined program till now then set pushProgramUsersDetailsToKafka = true;
          // if requestForPIIConsent == true and data.consentShared value is true which means user interacted with the consent popup set pushProgramUsersDetailsToKafka = true;
          // if programUsersDetails[0].consentShared === true which means the data is already pushed to Kafka once
          if (
            (programData[0].hasOwnProperty("requestForPIIConsent") &&
              programData[0].requestForPIIConsent === false &&
              !programUsersDetails.length > 0) ||
            (programData[0].hasOwnProperty("requestForPIIConsent") &&
              programData[0].requestForPIIConsent === true &&
              data.hasOwnProperty("consentShared") &&
              data.consentShared == true &&
              ((programUsersDetails.length > 0 &&
                programUsersDetails[0].consentShared === false) ||
                !programUsersDetails.length > 0))
          ) {
            pushProgramUsersDetailsToKafka = true;
          }

          //create or update query
          const query = {
            programId: programId,
            userId: userId,
          };
          //if a resource is started
          if (data.isResource) {
            programUsersData.resourcesStarted = true;
          }
          //if user interacted with the consent-popup
          if (data.hasOwnProperty("consentShared")) {
            programUsersData.consentShared = data.consentShared;
          }
          update["$set"] = programUsersData;

          // add record to programUsers collection
          let joinProgram = await programUsersHelper.update(query, update, {
            new: true,
            upsert: true,
          });

          if (!joinProgram._id) {
            throw {
              message: constants.apiResponses.PROGRAM_JOIN_FAILED,
              status: httpStatusCode.bad_request.status,
            };
          }

          let joinProgramDetails = joinProgram.toObject();

          if (pushProgramUsersDetailsToKafka) {
            joinProgramDetails.programName = programData[0].name;
            joinProgramDetails.programExternalId = programData[0].externalId;
            joinProgramDetails.requestForPIIConsent =
              programData[0].requestForPIIConsent;
            //  push programUsers details to kafka
            await kafkaProducersHelper.pushProgramUsersToKafka(
              joinProgramDetails
            );
          }

          return resolve({
            message: constants.apiResponses.JOINED_PROGRAM,
            success: true,
            data: {
              _id: joinProgram._id,
            },
          });
       
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }
  /**
   * List Program using organization id.
   * @method
   * @name assets
   * @query {String} type - Assets type (program/solutions).
   * @returns {Object} - Details of the program under the organization.
   */

  static queryForOrganizationPrograms(bodyData,queryData){
    return new Promise(async (resolve, reject) => {
      try{
        let programDocument=[];
        let matchQuery={};
        let filterEmptyStringsFromArray;

        //if there is an empty string then remove from userids
        if(!bodyData.filters.userId){
          filterEmptyStringsFromArray=[];
        }else{
          filterEmptyStringsFromArray= bodyData.filters.userId.filter(str => str !== "");
        }

        if(filterEmptyStringsFromArray.length > 0){
          matchQuery={
            $and: [
              {createdFor: {$in:[bodyData.filters.orgId]} }, 
               { owner: { $in: bodyData.filters.userId} }, 
       ]
       
          
    }
        }else{

          matchQuery = {createdFor:{$in:[bodyData.filters.orgId]}}

        }

        let projection1 = {};
        if (bodyData.fields && bodyData.fields.length  > 0) {
          bodyData.fields.forEach((projectedData) => {
            if(projectedData === "objectType"){
              projection1["objectType"]="program"
            }else{
            projection1[projectedData] = 1;
            }
          });
        } else{
          projection1={
            "_id":1,
            "name":1,
            "status":1,
            "owner":1,
            "orgId":1,
            "objectType":"program"
          }
        }
        let limitQuery;
        //omit the limit if there is no type 
        if(queryData === "" || queryData === undefined){
         limitQuery =Number.MAX_SAFE_INTEGER;
        }else{
          limitQuery =bodyData.limit;

        }

        
       
        programDocument.push(
          { $match: matchQuery },
          { $project: projection1 },
          {$limit : limitQuery}

        );
      let programDocuments = await database.models.programs.aggregate(
        programDocument
      );
      return resolve({
        success: true,
        message: constants.apiResponses.PROGRAM_LIST,
        data: programDocuments,
      });

      }catch(error) {
        return resolve({
          success: false,
          message: error.message,
          data: [],
        });
      }
    })

  }
};

 

const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
