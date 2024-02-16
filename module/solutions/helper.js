/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Solution related helper functionality.
 */
// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const surveyService = require(ROOT_PATH + "/generics/services/survey");
const improvementProjectService = require(ROOT_PATH +
  "/generics/services/improvement-project");
const appsPortalBaseUrl = process.env.APP_PORTAL_BASE_URL + "/";
const userService = require(ROOT_PATH + "/generics/services/users");
const programUsersHelper = require(MODULES_BASE_PATH + "/programUsers/helper");
const timeZoneDifference =
  process.env.TIMEZONE_DIFFRENECE_BETWEEN_LOCAL_TIME_AND_UTC;
const validateEntity = process.env.VALIDATE_ENTITIES

/**
 * SolutionsHelper
 * @class
 */
module.exports = class SolutionsHelper {
  /**
   * Solution Data
   * @method
   * @name solutionDocuments
   * @param {Array} [filterQuery = "all"] - solution ids.
   * @param {Array} [fieldsArray = "all"] - projected fields.
   * @param {Array} [skipFields = "none"] - field not to include
   * @returns {Array} List of solutions.
   */

  static solutionDocuments(
    filterQuery = "all",
    fieldsArray = "all",
    skipFields = "none"
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = filterQuery != "all" ? filterQuery : {};

        let projection = {};

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

        let solutionDocuments = await database.models.solutions
          .find(queryObject, projection)
          .lean();

        return resolve(solutionDocuments);
      } catch (error) {
        return reject(error);
      }
    });
  }

   /**
     * Update solution users
     * @method
     * @name updateMany
     * @param {Object} query 
     * @param {Object} update 
     * @param {Object} options 
     * @returns {JSON} - update solutions.
    */

   static updateMany(query, update, options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
        
            let updatedSolutionCount = await database.models.solutions.updateMany(
                query, 
                update,
                options
            );
            if( updatedSolutionCount) {
                return resolve(updatedSolutionCount);
            }
        } catch (error) {
            return reject(error);
        }
    })
}

  /**
   * Create solution.
   * @method create
   * @name create
   * @param {Object} data - solution creation data.
   * @returns {JSON} solution creation data.
   */

  static create(data) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await database.models.solutions.create(data);

        return resolve(solutionData);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Create solution.
   * @method
   * @name createSolution
   * @param {Object} solutionData - solution creation data.
   * @returns {JSON} solution creation data.
   */

  static createSolution(solutionData, checkDate = false) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await programsHelper.programDocuments(
          {
            externalId: solutionData.programExternalId,
          },
          ["name", "description", "scope", "endDate", "startDate"]
        );

        if (!programData.length > 0) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          };
        }

        solutionData.programId = programData[0]._id;
        solutionData.programName = programData[0].name;
        solutionData.programDescription = programData[0].description;

        if (
          solutionData.type == constants.common.COURSE &&
          !solutionData.link
        ) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.COURSE_LINK_REQUIRED,
          });
        }

        if (solutionData.entities && solutionData.entities.length > 0) {
          let entityIds = [];
          let locationData = gen.utils.filterLocationIdandCode(
            solutionData.entities
          );

          if (locationData.ids.length > 0) {
            let bodyData = {
              id: locationData.ids,
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
              externalId: locationData.codes,
            };
            let schoolDetails = await userService.orgSchoolSearch(filterData);

            if (schoolDetails.success) {
              let schoolData = schoolDetails.data;
              schoolData.forEach((entity) => {
                entityIds.push(entity.externalId);
              });
            }
          }

          if (!entityIds.length > 0) {
            throw {
              message: constants.apiResponses.ENTITIES_NOT_FOUND,
            };
          }

          solutionData.entities = entityIds;
        }

        if (
          solutionData.minNoOfSubmissionsRequired &&
          solutionData.minNoOfSubmissionsRequired >
            constants.common.DEFAULT_SUBMISSION_REQUIRED
        ) {
          if (!solutionData.allowMultipleAssessemts) {
            solutionData.minNoOfSubmissionsRequired =
              constants.common.DEFAULT_SUBMISSION_REQUIRED;
          }
        }

        solutionData.status = constants.common.ACTIVE;

        if (checkDate) {
          if (solutionData.hasOwnProperty("endDate")) {
            solutionData.endDate = gen.utils.getEndDate(
              solutionData.endDate,
              timeZoneDifference
            );
            if (solutionData.endDate > programData[0].endDate) {
              solutionData.endDate = programData[0].endDate;
            }
          }
          if (solutionData.hasOwnProperty("startDate")) {
            solutionData.startDate = gen.utils.getStartDate(
              solutionData.startDate,
              timeZoneDifference
            );
            if (solutionData.startDate < programData[0].startDate) {
              solutionData.startDate = programData[0].startDate;
            }
          }
        }

        let solutionCreation = await database.models.solutions.create(
          _.omit(solutionData, ["scope"])
        );

        if (!solutionCreation._id) {
          throw {
            message: constants.apiResponses.SOLUTION_NOT_CREATED,
          };
        }

        let updateProgram = await database.models.programs.updateOne(
          {
            _id: solutionData.programId,
          },
          {
            $addToSet: { components: solutionCreation._id },
          }
        );

        if (!solutionData.excludeScope && programData[0].scope) {
          let solutionScope = await this.setScope(
            solutionData.programId,
            solutionCreation._id,
            solutionData.scope ? solutionData.scope : {}
          );
        }

        return resolve({
          message: constants.apiResponses.SOLUTION_CREATED,
          data: {
            _id: solutionCreation._id,
          },
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Set scope in solution
   * @method
   * @name setScope
   * @param {String} programId - program id.
   * @param {String} solutionId - solution id.
   * @param {Object} scopeData - scope data.
   * @param {String} scopeData.entityType - scope entity type
   * @param {Array} scopeData.entities - scope entities
   * @param {Array} scopeData.roles - roles in scope
   * @returns {JSON} - scope in solution.
   */

  static setScope(programId, solutionId, scopeData) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await programsHelper.programDocuments(
          { _id: programId },
          ["_id", "scope"]
        );

        if (!programData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        let solutionData = await this.solutionDocuments({ _id: solutionId }, [
          "_id",
        ]);

        if (!solutionData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }
        if (programData[0].scope) {
          let currentSolutionScope = JSON.parse(
            JSON.stringify(programData[0].scope)
          );
          if(validateEntity !== constants.common.OFF) {
            if (Object.keys(scopeData).length > 0) {
              if (scopeData.entityType) {
                let bodyData = { type: scopeData.entityType };
                let entityTypeData = await userService.locationSearch(bodyData);
                if (entityTypeData.success) {
                  currentSolutionScope.entityType = entityTypeData.data[0].type;
                }
              }

              if (scopeData.entities && scopeData.entities.length > 0) {
                //call learners api for search
                let entityIds = [];
                let bodyData = {};
                let locationData = gen.utils.filterLocationIdandCode(
                  scopeData.entities
                );

                if (locationData.ids.length > 0) {
                  bodyData = {
                    id: locationData.ids,
                    type: currentSolutionScope.entityType,
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
                    type: currentSolutionScope.entityType,
                  };
                  let entityDetails = await userService.locationSearch(
                    filterData
                  );

                  if (entityDetails.success) {
                    entityDetails.data.forEach((entity) => {
                      entityIds.push(entity.id);
                    });
                  }
                }

                if (!entityIds.length > 0) {
                  return resolve({
                    status: httpStatusCode.bad_request.status,
                    message: constants.apiResponses.ENTITIES_NOT_FOUND,
                  });
                }

                let entitiesData = [];

                // if( currentSolutionScope.entityType !== programData[0].scope.entityType ) {
                //   let result = [];
                //   let childEntities = await userService.getSubEntitiesBasedOnEntityType(currentSolutionScope.entities, currentSolutionScope.entityType, result);
                //   if( childEntities.length > 0 ) {
                //     entitiesData = entityIds.filter(element => childEntities.includes(element));
                //   }
                // } else {
                entitiesData = entityIds;
                // }

                if (!entitiesData.length > 0) {
                  return resolve({
                    status: httpStatusCode.bad_request.status,
                    message: constants.apiResponses.SCOPE_ENTITY_INVALID,
                  });
                }

                currentSolutionScope.entities = entitiesData;
              }
            }
          

            if (scopeData.roles) {
              if (
                Array.isArray(scopeData.roles) &&
                scopeData.roles.length > 0
              ) {
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

                currentSolutionScope["roles"] = userRoles;
              } else {
                if (scopeData.roles === constants.common.ALL_ROLES) {
                  currentSolutionScope["roles"] = [
                    {
                      code: constants.common.ALL_ROLES,
                    },
                  ];
                }
              }
            }
          }else{
            currentSolutionScope = scopeData;
          }
            
          

          let updateSolution = await database.models.solutions
            .findOneAndUpdate(
              {
                _id: solutionId,
              },
              { $set: { scope: currentSolutionScope } },
              { new: true }
            )
            .lean();

          if (!updateSolution._id) {
            throw {
              status: constants.apiResponses.SOLUTION_SCOPE_NOT_ADDED,
            };
          }
          solutionData = updateSolution;
        }

        return resolve({
          success: true,
          message: constants.apiResponses.SOLUTION_UPDATED,
        });
      } catch (error) {
      return resolve({
          success: false,
        });
      }
    });
  }

  /**
   * Update solution.
   * @method
   * @name update
   * @param {String} solutionId - solution id.
   * @param {Object} solutionData - solution creation data.
   * @returns {JSON} solution creation data.
   */

  static update(solutionId, solutionData, userId, checkDate = false) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = {
          _id: solutionId,
        };

        let solutionDocument = await this.solutionDocuments(queryObject, [
          "_id",
          "programId",
        ]);

        if (!solutionDocument.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }

        if (
          checkDate &&
          (solutionData.hasOwnProperty("endDate") ||
            solutionData.hasOwnProperty("endDate"))
        ) {
          let programData = await programsHelper.programDocuments(
            {
              _id: solutionDocument[0].programId,
            },
            ["_id", "endDate", "startDate"]
          );

          if (!programData.length > 0) {
            throw {
              message: constants.apiResponses.PROGRAM_NOT_FOUND,
            };
          }
          if (solutionData.hasOwnProperty("endDate")) {
            solutionData.endDate = gen.utils.getEndDate(
              solutionData.endDate,
              timeZoneDifference
            );
            if (solutionData.endDate > programData[0].endDate) {
              solutionData.endDate = programData[0].endDate;
            }
          }
          if (solutionData.hasOwnProperty("startDate")) {
            solutionData.startDate = gen.utils.getStartDate(
              solutionData.startDate,
              timeZoneDifference
            );
            if (solutionData.startDate < programData[0].startDate) {
              solutionData.startDate = programData[0].startDate;
            }
          }
        }

        let updateObject = {
          $set: {},
        };

        if (
          solutionData.minNoOfSubmissionsRequired &&
          solutionData.minNoOfSubmissionsRequired >
            constants.common.DEFAULT_SUBMISSION_REQUIRED
        ) {
          if (!solutionData.allowMultipleAssessemts) {
            solutionData.minNoOfSubmissionsRequired =
              constants.common.DEFAULT_SUBMISSION_REQUIRED;
          }
        }

        let solutionUpdateData = solutionData;

        Object.keys(_.omit(solutionUpdateData, ["scope"])).forEach(
          (updationData) => {
            updateObject["$set"][updationData] =
              solutionUpdateData[updationData];
          }
        );

        updateObject["$set"]["updatedBy"] = userId;
        let solutionUpdatedData = await database.models.solutions
          .findOneAndUpdate(
            {
              _id: solutionDocument[0]._id,
            },
            updateObject,
            { new: true }
          )
          .lean();

        if (!solutionUpdatedData._id) {
          throw {
            message: constants.apiResponses.SOLUTION_NOT_CREATED,
          };
        }

        if (solutionData.scope && Object.keys(solutionData.scope).length > 0) {
          let solutionScope = await this.setScope(
            solutionUpdatedData.programId,
            solutionUpdatedData._id,
            solutionData.scope
          );

          if (!solutionScope.success) {
            throw {
              message: constants.apiResponses.COULD_NOT_UPDATE_SCOPE,
            };
          }
        }

        return resolve({
          success: true,
          message: constants.apiResponses.SOLUTION_UPDATED,
          data: solutionData,
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
   * List solutions.
   * @method
   * @name list
   * @param {String} type - solution type.
   * @param {String} subType - solution sub type.
   * @param {Number} pageNo - page no.
   * @param {Number} pageSize - page size.
   * @param {String} searchText - search text.
   * @param {Object} filter - Filtered data.
   * @returns {JSON} List of solutions.
   */

  static list(
    type,
    subType,
    filter = {},
    pageNo,
    pageSize,
    searchText,
    projection
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let matchQuery = {
          isDeleted: false,
        };

        if (type == constants.common.SURVEY) {
          matchQuery["status"] = {
            $in: [constants.common.ACTIVE, constants.common.INACTIVE],
          };
        } else {
          matchQuery.status = constants.common.ACTIVE;
        }

        if (type !== "") {
          matchQuery["type"] = type;
        }

        if (subType !== "") {
          matchQuery["subType"] = subType;
        }

        if (Object.keys(filter).length > 0) {
          matchQuery = _.merge(matchQuery, filter);
        }

        let searchData = [
          {
            name: new RegExp(searchText, "i"),
          },
          {
            externalId: new RegExp(searchText, "i"),
          },
          {
            description: new RegExp(searchText, "i"),
          },
        ];

        if (searchText !== "") {
          if (matchQuery["$or"]) {
            matchQuery["$and"] = [{ $or: matchQuery.$or }, { $or: searchData }];

            delete matchQuery.$or;
          } else {
            matchQuery["$or"] = searchData;
          }
        }

        let projection1 = {};

        if (projection) {
          projection.forEach((projectedData) => {
            if(projectedData === "objectType"){
              projection1[projectedData] = "solution";

            }else{
            projection1[projectedData] = 1;
            }
          });
        } else {
          projection1 = {
            description: 1,
            externalId: 1,
            name: 1,
          };
        }

        let facetQuery = {};
        facetQuery["$facet"] = {};

        facetQuery["$facet"]["totalCount"] = [{ $count: "count" }];
        
        if (pageSize === "" && pageNo === "") {
          facetQuery["$facet"]["data"] = [{ $skip: 0 }];
        }else{
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

        let solutionDocuments = await database.models.solutions.aggregate([
          { $match: matchQuery },
          {
            $sort: { updatedAt: -1 },
          },
          { $project: projection1 },
          facetQuery,
          projection2,
        ]);

        return resolve({
          success: true,
          message: constants.apiResponses.SOLUTIONS_LIST,
          data: solutionDocuments[0],
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
   * List of solutions based on role and location.
   * @method
   * @name forUserRoleAndLocation
   * @param {String} bodyData - Requested body data.
   * @param {String} type - solution type.
   * @param {String} subType - solution sub type.
   * @param {String} programId - program Id
   * @param {String} pageSize - Page size.
   * @param {String} pageNo - Page no.
   * @param {String} searchText - search text.
   * @returns {JSON} - List of solutions based on role and location.
   */

  static forUserRoleAndLocation(
    bodyData,
    type,
    subType = "",
    programId,
    pageSize,
    pageNo,
    searchText = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryData = await this.queryBasedOnRoleAndLocation(
          bodyData,
          type,
          subType,
          programId
        );

        if (!queryData.success) {
          return resolve(queryData);
        }

        let matchQuery = queryData.data;

        if (type === "" && subType === "") {
          let targetedTypes = _targetedSolutionTypes();

          matchQuery["$or"] = [];

          targetedTypes.forEach((type) => {
            let singleType = {};
            if (type === constants.common.SURVEY) {
              singleType = {
                type: type,
              };
              const currentDate = new Date();
              currentDate.setDate(currentDate.getDate() - 15);
              singleType["endDate"] = { $gte: currentDate };
            } else {
              singleType = {
                type: type,
              };
              singleType["endDate"] = { $gte: new Date() };
            }

            if (type === constants.common.IMPROVEMENT_PROJECT) {
              singleType["projectTemplateId"] = { $exists: true };
            }

            matchQuery["$or"].push(singleType);
          });
        } else {
          if (type !== "") {
            matchQuery["type"] = type;
            if (type === constants.common.SURVEY) {
              const currentDate = new Date();
              currentDate.setDate(currentDate.getDate() - 15);
              matchQuery["endDate"] = { $gte: currentDate };
            } else {
              matchQuery["endDate"] = { $gte: new Date() };
            }
          }

          if (subType !== "") {
            matchQuery["subType"] = subType;
          }
        }

        if (programId !== "") {
          matchQuery["programId"] = ObjectId(programId);
        }

        matchQuery["startDate"] = { $lte: new Date() };
        // for survey type solutions even after expiry it should be visible to user for 15 days

        let targetedSolutions = await this.list(
          type,
          subType,
          matchQuery,
          pageNo,
          pageSize,
          searchText,
          [
            "name",
            "description",
            "programName",
            "programId",
            "externalId",
            "projectTemplateId",
            "type",
            "language",
            "creator",
            "endDate",
            "link",
            "referenceFrom",
            "entityType",
            "certificateTemplateId",
          ]
        );

        return resolve({
          success: true,
          message: constants.apiResponses.TARGETED_SOLUTIONS_FETCHED,
          data: targetedSolutions.data,
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
   * Auto targeted query field.
   * @method
   * @name queryBasedOnRoleAndLocation
   * @param {String} data - Requested body data.
   * @returns {JSON} - Auto targeted solutions query.
   */

  static queryBasedOnRoleAndLocation(data, type = "") {
    return new Promise(async (resolve, reject) => {
      try {
        let registryIds = [];
        let entityTypes = [];
        let filterQuery = {
          isReusable: false,
          isDeleted: false,
        }

        if(validateEntity !== constants.common.OFF){
          Object.keys(_.omit(data, ["filter", "role"])).forEach(
            (requestedDataKey) => {
              registryIds.push(data[requestedDataKey]);
              entityTypes.push(requestedDataKey);
            }
          );
          if (!registryIds.length > 0) {
            throw {
              message: constants.apiResponses.NO_LOCATION_ID_FOUND_IN_DATA,
            };
          }

          filterQuery["scope.roles.code"] = {
              $in: [constants.common.ALL_ROLES, ...data.role.split(",")],
            }
          filterQuery["scope.entities"]= { $in: registryIds }
          filterQuery["scope.entityType"]= { $in: entityTypes }
        }else{
          let userRoleInfo = _.omit(data, ['filter'])
          let userRoleKeys = Object.keys(userRoleInfo);
          userRoleKeys.forEach(entities => {
            filterQuery["scope."+entities] = {$in:userRoleInfo[entities].split(",")}
          });
        }

        if (type === constants.common.SURVEY) {
          filterQuery["status"] = {
            $in: [constants.common.ACTIVE, constants.common.INACTIVE],
          };
          let validDate = new Date();
          validDate.setDate(
            validDate.getDate() - constants.common.DEFAULT_SURVEY_REMOVED_DAY
          );
          filterQuery["endDate"] = { $gte: validDate };
        } else {
          filterQuery.status = constants.common.ACTIVE;
        }

        if (data.filter && Object.keys(data.filter).length > 0) {
          let solutionsSkipped = [];

          if (data.filter.skipSolutions) {
            data.filter.skipSolutions.forEach((solution) => {
              solutionsSkipped.push(ObjectId(solution.toString()));
            });

            data.filter["_id"] = {
              $nin: solutionsSkipped,
            };

            delete data.filter.skipSolutions;
          }

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
   * Details of solution based on role and location.
   * @method
   * @name detailsBasedOnRoleAndLocation
   * @param {String} solutionId - solution Id.
   * @param {Object} bodyData - Requested body data.
   * @returns {JSON} - Details of solution based on role and location.
   */

  static detailsBasedOnRoleAndLocation(solutionId, bodyData, type = "") {
    return new Promise(async (resolve, reject) => {
      try {
        let queryData = await this.queryBasedOnRoleAndLocation(bodyData, type);

        if (!queryData.success) {
          return resolve(queryData);
        }

        queryData.data["_id"] = solutionId;
        let targetedSolutionDetails = await this.solutionDocuments(
          queryData.data,
          [
            "name",
            "externalId",
            "description",
            "programId",
            "programName",
            "programDescription",
            "programExternalId",
            "isAPrivateProgram",
            "projectTemplateId",
            "entityType",
            "entityTypeId",
            "language",
            "creator",
            "link",
            "certificateTemplateId",
            "endDate",
          ]
        );

        if (!targetedSolutionDetails.length > 0) {
          throw {
            status: httpStatusCode["bad_request"].status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
          };
        }

        return resolve({
          success: true,
          message: constants.apiResponses.TARGETED_SOLUTIONS_FETCHED,
          data: targetedSolutionDetails[0],
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: {},
          status: error.status,
        });
      }
    });
  }

  /**
   * Add roles in solution scope.
   * @method
   * @name addRolesInScope
   * @param {String} solutionId - Solution Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Added roles data.
   */

  static addRolesInScope(solutionId, roles) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await this.solutionDocuments(
          {
            _id: solutionId,
            scope: { $exists: true },
            isReusable: false,
            isDeleted: false,
          },
          ["_id"]
        );

        if (!solutionData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
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

          await database.models.solutions
            .findOneAndUpdate(
              {
                _id: solutionId,
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

        let updateSolution = await database.models.solutions
          .findOneAndUpdate(
            {
              _id: solutionId,
            },
            updateQuery,
            { new: true }
          )
          .lean();

        if (!updateSolution || !updateSolution._id) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        return resolve({
          message: constants.apiResponses.ROLES_ADDED_IN_SOLUTION,
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
   * Add entities in solution.
   * @method
   * @name addEntitiesInScope
   * @param {String} solutionId - solution Id.
   * @param {Array} entities - entities data.
   * @returns {JSON} - Added entities data.
   */

  static addEntitiesInScope(solutionId, entities) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await this.solutionDocuments(
          {
            _id: solutionId,
            scope: { $exists: true },
            isReusable: false,
            isDeleted: false,
          },
          ["_id", "programId", "scope.entityType"]
        );

        if (!solutionData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }
        let programData = await programsHelper.programDocuments(
          {
            _id: solutionData[0].programId,
          },
          ["scope.entities", "scope.entityType"]
        );

        if (!programData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        if (
          solutionData[0].scope.entityType !== programData[0].scope.entityType
        ) {
          let matchData = [];
          let checkEntityInParent = [];
          let childEntities = await userService.getSubEntitiesBasedOnEntityType(
            programData[0].scope.entities,
            solutionData[0].scope.entityType,
            matchData
          );

          if (!childEntities.length > 0) {
            throw {
              message: constants.apiResponses.ENTITY_NOT_EXISTS_IN_PARENT,
            };
          }
          checkEntityInParent = entities.filter((element) =>
            childEntities.includes(element)
          );
          if (!checkEntityInParent.length > 0) {
            throw {
              message: constants.apiResponses.ENTITY_NOT_EXISTS_IN_PARENT,
            };
          }
        }
        let entityIds = [];
        let bodyData = {};
        let locationData = gen.utils.filterLocationIdandCode(entities);

        if (locationData.ids.length > 0) {
          bodyData = {
            id: locationData.ids,
            type: solutionData[0].scope.entityType,
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
            type: solutionData[0].scope.entityType,
          };
          let entityDetails = await userService.locationSearch(filterData);

          if (entityDetails.success) {
            entityDetails.data.forEach((entity) => {
              entityIds.push(entity.id);
            });
          }
        }

        if (!entityIds.length > 0) {
          throw {
            message: constants.apiResponses.ENTITIES_NOT_FOUND,
          };
        }

        let updateSolution = await database.models.solutions
          .findOneAndUpdate(
            {
              _id: solutionId,
            },
            {
              $addToSet: { "scope.entities": { $each: entityIds } },
            },
            { new: true }
          )
          .lean();

        if (!updateSolution || !updateSolution._id) {
          throw {
            message: constants.apiResponses.SOLUTION_NOT_UPDATED,
          };
        }

        return resolve({
          message: constants.apiResponses.ENTITIES_ADDED_IN_SOLUTION,
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
   * remove roles from solution scope.
   * @method
   * @name removeRolesInScope
   * @param {String} solutionId - Solution Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Removed solution roles.
   */

  static removeRolesInScope(solutionId, roles) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await this.solutionDocuments(
          {
            _id: solutionId,
            scope: { $exists: true },
            isReusable: false,
            isDeleted: false,
          },
          ["_id"]
        );

        if (!solutionData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
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

        let updateSolution = await database.models.solutions
          .findOneAndUpdate(
            {
              _id: solutionId,
            },
            {
              $pull: { "scope.roles": { $in: userRoles } },
            },
            { new: true }
          )
          .lean();

        if (!updateSolution || !updateSolution._id) {
          throw {
            message: constants.apiResponses.SOLUTION_NOT_UPDATED,
          };
        }

        return resolve({
          message: constants.apiResponses.ROLES_REMOVED_IN_SOLUTION,
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
   * remove entities in solution scope.
   * @method
   * @name removeEntitiesInScope
   * @param {String} solutionId - Program Id.
   * @param {Array} entities - entities.
   * @returns {JSON} - Removed entities from solution scope.
   */

  static removeEntitiesInScope(solutionId, entities) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await this.solutionDocuments(
          {
            _id: solutionId,
            scope: { $exists: true },
            isReusable: false,
            isDeleted: false,
          },
          ["_id", "scope.entities"]
        );

        if (!solutionData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }
        let entitiesData = [];
        entitiesData = solutionData[0].scope.entities;
        if (!entitiesData.length > 0) {
          throw {
            message: constants.apiResponses.ENTITIES_NOT_FOUND,
          };
        }

        let updateSolution = await database.models.solutions
          .findOneAndUpdate(
            {
              _id: solutionId,
            },
            {
              $pull: { "scope.entities": { $in: entities } },
            },
            { new: true }
          )
          .lean();

        if (!updateSolution || !updateSolution._id) {
          throw {
            message: constants.apiResponses.SOLUTION_NOT_UPDATED,
          };
        }

        return resolve({
          message: constants.apiResponses.ENTITIES_REMOVED_IN_SOLUTION,
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
   * Solution details.
   * @method
   * @name details
   * @param {String} solutionId - Solution Id.
   * @returns {Object} - Details of the solution.
   */

  static getDetails(solutionId) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await this.solutionDocuments({
          _id: solutionId,
          isDeleted: false,
        });

        if (!solutionData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }

        return resolve({
          message: constants.apiResponses.SOLUTION_DETAILS_FETCHED,
          success: true,
          data: solutionData[0],
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
   * List of solutions and targeted ones.
   * @method
   * @name targetedSolutions
   * @param {String} solutionId - Program Id.
   * @returns {Object} - Details of the solution.
   */

  static targetedSolutions(
    requestedData,
    solutionType,
    userToken,
    pageSize,
    pageNo,
    search,
    filter,
    surveyReportPage = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let assignedSolutions = await this.assignedUserSolutions(
          solutionType,
          userToken,
          search,
          filter,
          surveyReportPage
        );

        let totalCount = 0;
        let mergedData = [];
        let solutionIds = [];
        if (assignedSolutions.success && assignedSolutions.data) {
          // Remove observation solutions which for project tasks.

          _.remove(assignedSolutions.data.data, function (solution) {
            return (
              solution.referenceFrom == constants.common.PROJECT &&
              solution.type == constants.common.OBSERVATION
            );
          });

          totalCount =
            assignedSolutions.data.data &&
            assignedSolutions.data.data.length > 0
              ? assignedSolutions.data.data.length
              : totalCount;
          mergedData = assignedSolutions.data.data;

          if (mergedData.length > 0) {
            let programIds = [];

            mergedData.forEach((mergeSolutionData) => {
              if (mergeSolutionData.solutionId) {
                solutionIds.push(mergeSolutionData.solutionId);
              }

              if (mergeSolutionData.programId) {
                programIds.push(mergeSolutionData.programId);
              }
            });

            let programsData = await programsHelper.programDocuments(
              {
                _id: { $in: programIds },
              },
              ["name"]
            );

            if (programsData.length > 0) {
              let programs = programsData.reduce(
                (ac, program) => ({ ...ac, [program._id.toString()]: program }),
                {}
              );

              mergedData = mergedData.map((data) => {
                if (data.programId && programs[data.programId.toString()]) {
                  data.programName = programs[data.programId.toString()].name;
                }
                return data;
              });
            }
          }
        }

        requestedData["filter"] = {};
        if (solutionIds.length > 0) {
          requestedData["filter"]["skipSolutions"] = solutionIds;
        }

        if (filter && filter !== "") {
          if (filter === constants.common.CREATED_BY_ME) {
            requestedData["filter"]["isAPrivateProgram"] = {
              $ne: false,
            };
          } else if (filter === constants.common.ASSIGN_TO_ME) {
            requestedData["filter"]["isAPrivateProgram"] = false;
          }
        }

        let targetedSolutions = {
          success: false,
        };

        let getTargetedSolution = true;

        if (filter === constants.common.DISCOVERED_BY_ME) {
          getTargetedSolution = false;
        } else if (
          gen.utils.convertStringToBoolean(surveyReportPage) === true
        ) {
          getTargetedSolution = false;
        }

        if (getTargetedSolution) {
          targetedSolutions = await this.forUserRoleAndLocation(
            requestedData,
            solutionType,
            "",
            "",
            constants.common.DEFAULT_PAGE_SIZE,
            constants.common.DEFAULT_PAGE_NO,
            search
          );
        }

        if (targetedSolutions.success) {
          if (
            targetedSolutions.success &&
            targetedSolutions.data.data &&
            targetedSolutions.data.data.length > 0
          ) {
            totalCount += targetedSolutions.data.count;
            targetedSolutions.data.data.forEach((targetedSolution) => {
              targetedSolution.solutionId = targetedSolution._id;
              targetedSolution._id = "";

              if (solutionType !== constants.common.COURSE) {
                targetedSolution["creator"] = targetedSolution.creator
                  ? targetedSolution.creator
                  : "";
              }

              if (solutionType === constants.common.SURVEY) {
                targetedSolution.isCreator = false;
              }

              mergedData.push(targetedSolution);
              delete targetedSolution.type;
              delete targetedSolution.externalId;
            });
          }
        }

        if (mergedData.length > 0) {
          let startIndex = pageSize * (pageNo - 1);
          let endIndex = startIndex + pageSize;
          mergedData = mergedData.slice(startIndex, endIndex);
        }

        return resolve({
          success: true,
          message: constants.apiResponses.TARGETED_OBSERVATION_FETCHED,
          data: {
            data: mergedData,
            count: totalCount,
          },
        });
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message:
            error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }
  /**
   * Solution details.
   * @method
   * @name assignedUserSolutions
   * @param {String} solutionId - Program Id.
   * @returns {Object} - Details of the solution.
   */

  static assignedUserSolutions(
    solutionType,
    userToken,
    search,
    filter,
    surveyReportPage = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let userAssignedSolutions = {};
        if (solutionType === constants.common.OBSERVATION) {
          userAssignedSolutions = await surveyService.assignedObservations(
            userToken,
            search,
            filter
          );
        } else if (solutionType === constants.common.SURVEY) {
          userAssignedSolutions = await surveyService.assignedSurveys(
            userToken,
            search,
            filter,
            surveyReportPage
          );
        } else {
          userAssignedSolutions =
            await improvementProjectService.assignedProjects(
              userToken,
              search,
              filter
            );
        }

        return resolve(userAssignedSolutions);
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
   * Get link by solution id
   * @method
   * @name fetchLink
   * @param {String} solutionId - solution Id.
   * @param {String} appName - app Name.
   * @param {String} userId - user Id.
   * @returns {Object} - Details of the solution.
   */

  static fetchLink(solutionId, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await this.solutionDocuments(
          {
            _id: solutionId,
            isReusable: false,
            isAPrivateProgram: false,
          },
          ["link", "type", "author"]
        );

        if (!Array.isArray(solutionData) || solutionData.length < 1) {
          return resolve({
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
            result: {},
          });
        }

        let prefix = constants.common.PREFIX_FOR_SOLUTION_LINK;

        let solutionLink, link;

        if (!solutionData[0].link) {
          let updateLink = await gen.utils.md5Hash(
            solutionData[0]._id + "###" + solutionData[0].author
          );

          let updateSolution = await this.update(
            solutionId,
            { link: updateLink },
            userId
          );

          solutionLink = updateLink;
        } else {
          solutionLink = solutionData[0].link;
        }

        link = _generateLink(
          appsPortalBaseUrl,
          prefix,
          solutionLink,
          solutionData[0].type
        );

        return resolve({
          success: true,
          message: constants.apiResponses.LINK_GENERATED,
          result: link,
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
   * Verify solution link
   * @method
   * @name verifyLink
   * @param {String} solutionId - solution Id.
   * @param {String} userId - user Id.
   * @param {String} userToken - user token.
   * @param {Boolean} createProject - create project.
   * @param {Object} bodyData - Req Body.
   * @param {Object} createPrivateSolutionIfNotTargeted - flag to create private program if user is non targeted
   * @returns {Object} - Details of the solution.
   */

  static verifyLink(
    link = "",
    bodyData = {},
    userId = "",
    userToken = "",
    createProject = true
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let verifySolution = await this.verifySolutionDetails(
          link,
          userId,
          userToken
        );

        let checkForTargetedSolution = await this.checkForTargetedSolution(
          link,
          bodyData,
          userId,
          userToken
        );

        if (
          !checkForTargetedSolution ||
          Object.keys(checkForTargetedSolution.result).length <= 0
        ) {
          return resolve(checkForTargetedSolution);
        }

        let solutionData = checkForTargetedSolution.result;
        let isSolutionActive =
          solutionData.status === constants.common.INACTIVE ? false : true;
        if (solutionData.type == constants.common.OBSERVATION) {
          // Targeted solution
          if (checkForTargetedSolution.result.isATargetedSolution) {
            let observationDetailFromLink =
              await surveyService.getObservationDetail(
                solutionData.solutionId,
                userToken
              );

            if (observationDetailFromLink.success) {
              checkForTargetedSolution.result["observationId"] =
                observationDetailFromLink.result._id != ""
                  ? observationDetailFromLink.result._id
                  : "";
            } else if (!isSolutionActive) {
              throw new Error(constants.apiResponses.LINK_IS_EXPIRED);
            }
          } else {
            if (!isSolutionActive) {
              throw new Error(constants.apiResponses.LINK_IS_EXPIRED);
            }
          }
        } else if (solutionData.type === constants.common.SURVEY) {
          // Get survey submissions of user
          /**
           * function userServeySubmission 
           * Request:
           * @query :SolutionId -> solutionId
           * @param {userToken} for UserId
           * @response Array of survey submissions
           * example: {
            "success":true,
            "message":"Survey submission fetched successfully",
            "data":[
                {
                    "_id":"62e228eedd8c6d0009da5084",
                    "solutionId":"627dfc6509446e00072ccf78",
                    "surveyId":"62e228eedd8c6d0009da507d",
                    "status":"completed",
                    "surveyInformation":{
                        "name":"Create a Survey (To check collated reports) for 4.9 regression -- FD 380",
                        "description":"Create a Survey (To check collated reports) for 4.9 regression -- FD 380"
                    }
                }
            ]
          }       
           */
          let surveySubmissionDetails =
            await surveyService.userSurveySubmissions(
              userToken,
              solutionData.solutionId
            );
          let surveySubmissionData = surveySubmissionDetails.result;
          if (surveySubmissionData.length > 0) {
            checkForTargetedSolution.result.submissionId =
              surveySubmissionData[0]._id ? surveySubmissionData[0]._id : "";
            checkForTargetedSolution.result.surveyId = surveySubmissionData[0]
              .surveyId
              ? surveySubmissionData[0].surveyId
              : "";
            checkForTargetedSolution.result.submissionStatus =
              surveySubmissionData[0].status;
          } else if (!isSolutionActive) {
            throw new Error(constants.apiResponses.LINK_IS_EXPIRED);
          }
        } else if (solutionData.type === constants.common.IMPROVEMENT_PROJECT) {
          // Targeted solution
          if (
            checkForTargetedSolution.result.isATargetedSolution &&
            createProject
          ) {
            //targeted user with project creation

            let projectDetailFromLink =
              await improvementProjectService.getProjectDetail(
                solutionData.solutionId,
                userToken,
                bodyData
              );

            if (!projectDetailFromLink || !projectDetailFromLink.data) {
              return resolve(projectDetailFromLink);
            }
            if (projectDetailFromLink.data.length < 1 && !isSolutionActive) {
              throw new Error(constants.apiResponses.LINK_IS_EXPIRED);
            }

            checkForTargetedSolution.result["projectId"] = projectDetailFromLink
              .data._id
              ? projectDetailFromLink.data._id
              : "";
          } else if (
            checkForTargetedSolution.result.isATargetedSolution &&
            !createProject
          ) {
            //targeted user with no project creation
            let findQuery = {
              userId: userId,
              projectTemplateId: solutionData.projectTemplateId,
              referenceFrom: {
                $ne: constants.common.LINK,
              },
              isDeleted: false,
            };

            let checkTargetedProjectExist =
              await improvementProjectService.projectDocuments(
                userToken,
                findQuery,
                ["_id"]
              );

            if (
              checkTargetedProjectExist.success &&
              checkTargetedProjectExist.data &&
              checkTargetedProjectExist.data.length > 0 &&
              checkTargetedProjectExist.data[0]._id != ""
            ) {
              checkForTargetedSolution.result["projectId"] =
                checkTargetedProjectExist.data[0]._id;
            } else if (!isSolutionActive) {
              throw new Error(constants.apiResponses.LINK_IS_EXPIRED);
            }
          } else {
            if (!isSolutionActive) {
              throw new Error(constants.apiResponses.LINK_IS_EXPIRED);
            }

            // check if private-Project already exists
            let checkIfUserProjectExistsQuery = {
              createdBy: userId,
              referenceFrom: constants.common.LINK,
              link: link,
            };
            let checkForProjectExist =
              await improvementProjectService.projectDocuments(
                userToken,
                checkIfUserProjectExistsQuery,
                ["_id"]
              );
            if (
              checkForProjectExist.success &&
              checkForProjectExist.data &&
              checkForProjectExist.data.length > 0 &&
              checkForProjectExist.data[0]._id != ""
            ) {
              checkForTargetedSolution.result["projectId"] =
                checkForProjectExist.data[0]._id;
            }
            // If project not found and createPrivateSolutionIfNotTargeted := true
            // By default will be false for old version of app
            if (
              !checkForTargetedSolution.result["projectId"] ||
              checkForTargetedSolution.result["projectId"] === ""
            ) {
              // user is not targeted and privateSolutionCreation required
              /**
               * function privateProgramAndSolutionDetails
               * Request:
               * @param {solutionData} solution data
               * @param {userToken} for UserId
               * @response private solutionId
               */
              let privateProgramAndSolutionDetails =
                await this.privateProgramAndSolutionDetails(
                  solutionData,
                  userId,
                  userToken
                );
              if (!privateProgramAndSolutionDetails.success) {
                throw {
                  status: httpStatusCode.bad_request.status,
                  message: constants.apiResponses.SOLUTION_PROGRAMS_NOT_CREATED,
                };
              }
              // Replace public solutionId with private solutionId.
              if (privateProgramAndSolutionDetails.result != "") {
                checkForTargetedSolution.result["solutionId"] =
                  privateProgramAndSolutionDetails.result;
              }
            }
          }
        }
        delete checkForTargetedSolution.result["status"];

        return resolve(checkForTargetedSolution);
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
   * privateProgramAndSolutionDetails
   * @method
   * @name PrivateProgramAndSolutionDetails
   * @param {Object} solutionData - solution data.
   * @param {String} userId - user Id.
   * @param {String} userToken - user token.
   * @returns {Object} - Details of the private solution.
   */

  static privateProgramAndSolutionDetails(
    solutionData,
    userId = "",
    userToken = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if a private program and private solution already exist or not for this user.
        let privateSolutionDetails = await this.solutionDocuments(
          {
            parentSolutionId: solutionData.solutionId,
            author: userId,
            type: solutionData.type,
            isAPrivateProgram: true,
          },
          ["_id", "programId", "programName"]
        );

        if (!privateSolutionDetails.length > 0) {
          // Data for program and solution creation
          let programAndSolutionData = {
            type: constants.common.IMPROVEMENT_PROJECT,
            subType: constants.common.IMPROVEMENT_PROJECT,
            isReusable: false,
            solutionId: solutionData.solutionId,
          };

          if (solutionData.programId && solutionData.programId !== "") {
            programAndSolutionData["programId"] = solutionData.programId;
            programAndSolutionData["programName"] = solutionData.programName;
          }
          // create private program and solution
          let solutionAndProgramCreation = await this.createProgramAndSolution(
            userId,
            programAndSolutionData,
            userToken,
            "true" // create duplicate solution
          );

          if (!solutionAndProgramCreation.success) {
            throw {
              status: httpStatusCode.bad_request.status,
              message: constants.apiResponses.SOLUTION_PROGRAMS_NOT_CREATED,
            };
          }
          return resolve({
            success: true,
            result: solutionAndProgramCreation.result.solution._id,
          });
        } else {
          return resolve({
            success: true,
            result: privateSolutionDetails[0]._id,
          });
        }
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
   * Verify solution id
   * @method
   * @name verifySolution
   * @param {String} solutionId - solution Id.
   * @param {String} userId - user Id.
   * @param {String} userToken - user token.
   * @param {Boolean} createProject - create project.
   * @param {Object} bodyData - Req Body.
   * @returns {Object} - Details of the solution.
   * Takes SolutionId and userRoleInformation as parameters.
   * @return {Object} - {
    "message": "Solution is not targeted to the role",
    "status": 200,
    "result": {
        "isATargetedSolution": false/true,
        "_id": "63987b5d26a3620009a1142d"
    }
  }
   */

  static isTargetedBasedOnUserProfile(solutionId = "", bodyData = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {
          isATargetedSolution: false,
          _id: solutionId,
        };

        let queryData = await this.queryBasedOnRoleAndLocation(bodyData);
        if (!queryData.success) {
          return resolve(queryData);
        }

        queryData.data["_id"] = solutionId;
        let matchQuery = queryData.data;
        let solutionData = await this.solutionDocuments(matchQuery, [
          "_id",
          "type",
          "programId",
          "name",
        ]);

        if (!Array.isArray(solutionData) || solutionData.length < 1) {
          return resolve({
            success: true,
            message:
              constants.apiResponses.SOLUTION_NOT_FOUND_OR_NOT_A_TARGETED,
            result: response,
          });
        }

        response.isATargetedSolution = true;
        return resolve({
          success: true,
          message: constants.apiResponses.SOLUTION_DETAILS_VERIFIED,
          result: response,
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
   * Verify Solution details.
   * @method
   * @name verifySolutionDetails
   * @param {String} solutionId - Program Id.
   * @returns {Object} - Details of the solution.
   */

  static verifySolutionDetails(link = "", userId = "", userToken = "") {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {
          verified: false,
        };

        if (userToken == "") {
          throw new Error(constants.apiResponses.REQUIRED_USER_AUTH_TOKEN);
        }

        if (userId == "") {
          throw new Error(constants.apiResponses.USER_ID_REQUIRED_CHECK);
        }

        let solutionData = await this.solutionDocuments(
          {
            link: link,
            isReusable: false,
            status: {
              $ne: constants.common.INACTIVE,
            },
          },
          ["type", "status", "endDate"]
        );

        if (!Array.isArray(solutionData) || solutionData.length < 1) {
          return resolve({
            message: constants.apiResponses.INVALID_LINK,
            result: [],
          });
        }

        if (solutionData[0].status !== constants.common.ACTIVE) {
          return resolve({
            message: constants.apiResponses.LINK_IS_EXPIRED,
            result: [],
          });
        }

        if (
          solutionData[0].endDate &&
          new Date() > new Date(solutionData[0].endDate)
        ) {
          if (solutionData[0].status === constants.common.ACTIVE) {
            let updateSolution = await this.update(
              solutionData[0]._id,
              {
                status: constants.common.INACTIVE,
              },
              userId
            );
          }

          return resolve({
            message: constants.apiResponses.LINK_IS_EXPIRED,
            result: [],
          });
        }

        response.verified = true;
        return resolve({
          message: constants.apiResponses.LINK_VERIFIED,
          result: response,
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
   * Check the user is targeted.
   * @method
   * @name checkForTargetedSolution
   * @param {String} link - Solution link.
   * @returns {Object} - Details of the solution.
   */

  static checkForTargetedSolution(
    link = "",
    bodyData = {},
    userId = "",
    userToken = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {
          isATargetedSolution: false,
          link: link,
        };

        let solutionDetails = await this.solutionDocuments({ link: link }, [
          "type",
          "_id",
          "programId",
          "name",
          "projectTemplateId",
          "programName",
          "status",
        ]);

        let queryData = await this.queryBasedOnRoleAndLocation(bodyData);
        if (!queryData.success) {
          return resolve(queryData);
        }

        queryData.data["link"] = link;
        let matchQuery = queryData.data;

        let solutionData = await this.solutionDocuments(matchQuery, [
          "_id",
          "link",
          "type",
          "programId",
          "name",
          "projectTemplateId",
        ]);

        if (!Array.isArray(solutionData) || solutionData.length < 1) {
          response.solutionId = solutionDetails[0]._id;
          response.type = solutionDetails[0].type;
          response.name = solutionDetails[0].name;
          response.programId = solutionDetails[0].programId;
          response.programName = solutionDetails[0].programName;
          response.status = solutionDetails[0].status;

          return resolve({
            success: true,
            message:
              constants.apiResponses.SOLUTION_NOT_FOUND_OR_NOT_A_TARGETED,
            result: response,
          });
        }

        response.isATargetedSolution = true;
        Object.assign(response, solutionData[0]);
        response.solutionId = solutionData[0]._id;
        response.projectTemplateId = solutionDetails[0].projectTemplateId
          ? solutionDetails[0].projectTemplateId
          : "";
        response.programName = solutionDetails[0].programName;
        delete response._id;

        return resolve({
          success: true,
          message: constants.apiResponses.SOLUTION_DETAILS_VERIFIED,
          result: response,
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
   * Fetch template observation based on solution Id.
   * @method
   * @name details
   * @param {String} solutionId - Solution Id.
   * @returns {Object} - Details of the solution.
   */

  static details(solutionId, bodyData = {}, userId = "", userToken = "") {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await this.solutionDocuments({ _id: solutionId }, [
          "type",
          "projectTemplateId",
          "programId",
        ]);

        if (!Array.isArray(solutionData) || solutionData.length < 1) {
          return resolve({
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
            result: [],
          });
        }

        solutionData = solutionData[0];
        let templateOrQuestionDetails;
        //this will get wether user is targeted to the solution or not based on user Role Information
        const isSolutionTargeted = await this.isTargetedBasedOnUserProfile(
          solutionId,
          bodyData
        );

        if (solutionData.type === constants.common.IMPROVEMENT_PROJECT) {
          if (!solutionData.projectTemplateId) {
            throw {
              message: constants.apiResponses.PROJECT_TEMPLATE_ID_NOT_FOUND,
            };
          }

          templateOrQuestionDetails =
            await improvementProjectService.getTemplateDetail(
              solutionData.projectTemplateId,
              userToken,
              isSolutionTargeted.result.isATargetedSolution ? false : true
            );
        } else if (
          solutionData.type === constants.common.OBSERVATION ||
          solutionData.type === constants.common.SURVEY
        ) {
          templateOrQuestionDetails = await surveyService.getQuestions(
            solutionData._id,
            userToken
          );
        } else {
          templateOrQuestionDetails = {
            status: httpStatusCode.ok.status,
            message: constants.apiResponses.SOLUTION_TYPE_INVALID,
            result: {},
          };
        }

        if (solutionData.programId) {
          // add ["rootOrganisations","requestForPIIConsent","programJoined"] values to response. Based on these values front end calls PII consent
          let programData = await programsHelper.programDocuments(
            {
              _id: solutionData.programId,
            },
            ["rootOrganisations", "requestForPIIConsent", "name"]
          );

          templateOrQuestionDetails.result.rootOrganisations = programData[0]
            .rootOrganisations
            ? programData[0].rootOrganisations[0]
            : "";
          if (programData[0].hasOwnProperty("requestForPIIConsent")) {
            templateOrQuestionDetails.result.requestForPIIConsent =
              programData[0].requestForPIIConsent;
          }
          // We are passing programId and programName with the response because front end require these values to show program join pop-up in case of survey link flow
          // In 6.0.0 release these values only used for solutions of  type survey in front-end side. But Backend is not adding any restrictions based on solution type.
          // If solution have programId then we will pass below values with the response, irrespective of solution type
          templateOrQuestionDetails.result.programId = solutionData.programId;
          templateOrQuestionDetails.result.programName = programData[0].name;
        }

        //Check data present in programUsers collection.
        //checkForUserJoinedProgramAndConsentShared will returns an object which contain joinProgram and consentShared status
        let programJoinStatus =
          await programUsersHelper.checkForUserJoinedProgramAndConsentShared(
            solutionData.programId,
            userId
          );
        templateOrQuestionDetails.result.programJoined =
          programJoinStatus.joinProgram;
        templateOrQuestionDetails.result.consentShared =
          programJoinStatus.consentShared;

        return resolve(templateOrQuestionDetails);
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
   * List Solutions using organization id.
   * @method
   * @name listOrganizationSolutions
   * @query {String} type - Assets type (program/solutions).
   * @returns {Object} - Details of the solution under the organization.
   */

   static listOrganizationSolutions(bodyData){

    return new Promise(async (resolve, reject) => {
      try {
        let matchQuery = {};
        let filterEmptyStringsFromArray;

        //if there is an empty string then remove from userids
        if (!bodyData.filters.userId) {
          filterEmptyStringsFromArray = [];
        } else {
          filterEmptyStringsFromArray = bodyData.filters.userId.filter(
            (str) => str !== ""
          );
        }

        if (filterEmptyStringsFromArray.length > 0) {
          matchQuery = {
            $and: [
              { createdFor: { $in: [bodyData.filters.orgId] } },
              { author: { $in: bodyData.filters.userId } },
              { isAPrivateProgram: false },
            ],
          };
        } else {
          matchQuery = { createdFor: { $in: [bodyData.filters.orgId] } };
        }
        
        let solutionDocuments = await this.list(
          "", //for type 
          "", // for subType
          matchQuery,
          "",// for pageNo
          "", // for pageSize
          "", // for searchText
          bodyData.fields
        );
        return resolve(
           solutionDocuments,
        );
      }catch(error) {
        return resolve({
          success: false,
          message: error.message,
          data: [],
        });
      }
    })

  }

  // moved this function to solutions helper to avoid circular dependency with users/helper
  /**
   * Create user program and solution
   * @method
   * @name createProgramAndSolution
   * @param {string} userId - logged in user Id.
   * @param {object} programData - data needed for creation of program.
   * @param {object} solutionData - data needed for creation of solution.
   * @returns {Array} - Created user program and solution.
   */

  static createProgramAndSolution(
    userId,
    data,
    userToken,
    createADuplicateSolution = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let userPrivateProgram = {};
        let dateFormat = gen.utils.epochTime();
        let parentSolutionInformation = {};

        createADuplicateSolution = gen.utils.convertStringToBoolean(
          createADuplicateSolution
        );
        //program part
        if (data.programId && data.programId !== "") {
          let filterQuery = {
            _id: data.programId,
          };

          if (createADuplicateSolution === false) {
            filterQuery.createdBy = userId;
          }

          let checkforProgramExist = await programsHelper.programDocuments(
            filterQuery,
            "all",
            ["__v"]
          );

          if (!checkforProgramExist.length > 0) {
            return resolve({
              status: httpStatusCode["bad_request"].status,
              message: constants.apiResponses.PROGRAM_NOT_FOUND,
              result: {},
            });
          }

          if (createADuplicateSolution === true) {
            let duplicateProgram = checkforProgramExist[0];
            duplicateProgram = await _createProgramData(
              duplicateProgram.name,
              duplicateProgram.externalId
                ? duplicateProgram.externalId + "-" + dateFormat
                : duplicateProgram.name + "-" + dateFormat,
              true,
              constants.common.ACTIVE,
              duplicateProgram.description,
              userId,
              duplicateProgram.startDate,
              duplicateProgram.endDate,
              userId
            );
            // set rootorganisation from parent program
            if (checkforProgramExist[0].hasOwnProperty("rootOrganisations")) {
              duplicateProgram.rootOrganisations =
                checkforProgramExist[0].rootOrganisations;
            }
            if (
              checkforProgramExist[0].hasOwnProperty("requestForPIIConsent")
            ) {
              duplicateProgram.requestForPIIConsent =
                checkforProgramExist[0].requestForPIIConsent;
            }
            userPrivateProgram = await programsHelper.create(
              _.omit(duplicateProgram, ["_id", "components", "scope"])
            );
          } else {
            userPrivateProgram = checkforProgramExist[0];
          }
        } else {
          /* If the programId is not passed from the front end, we will enter this else block. 
          In this block, we need to provide the necessary basic details to create a new program, Including startDate and endDate.*/
          // Current date
          let startDate = new Date();
          // Add one year to the current date
          let endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
          let programData = await _createProgramData(
            data.programName,
            data.programExternalId
              ? data.programExternalId
              : data.programName + "-" + dateFormat,
            true,
            constants.common.ACTIVE,
            data.programDescription
              ? data.programDescription
              : data.programName,
            userId,
            startDate,
            endDate
          );

          if (data.rootOrganisations) {
            programData.rootOrganisations = data.rootOrganisations;
          }
          userPrivateProgram = await programsHelper.create(programData);
        }

        let solutionDataToBeUpdated = {
          programId: userPrivateProgram._id,
          programExternalId: userPrivateProgram.externalId,
          programName: userPrivateProgram.name,
          programDescription: userPrivateProgram.description,
          isAPrivateProgram: userPrivateProgram.isAPrivateProgram,
        };

        //entities
        if (
          Array.isArray(data.entities) &&
          data.entities &&
          data.entities.length > 0
        ) {
          let entitiesData = [];
          let bodyData = {};

          let locationData = gen.utils.filterLocationIdandCode(data.entities);

          if (locationData.ids.length > 0) {
            bodyData = {
              id: locationData.ids,
            };
            let entityData = await userService.locationSearch(bodyData);

            if (!entityData.success) {
              return resolve({
                status: httpStatusCode["bad_request"].status,
                message: constants.apiResponses.ENTITY_NOT_FOUND,
                result: {},
              });
            }

            entityData.data.forEach((entity) => {
              entitiesData.push(entity.id);
            });

            solutionDataToBeUpdated["entityType"] = entityData.data[0].type;
          }

          if (locationData.codes.length > 0) {
            let filterData = {
              code: locationData.codes,
            };
            let entityDetails = await userService.locationSearch(filterData);
            let entityDocuments = entityDetails.data;
            if (!entityDetails.success || !entityDocuments.length > 0) {
              return resolve({
                status: httpStatusCode["bad_request"].status,
                message: constants.apiResponses.ENTITY_NOT_FOUND,
                result: {},
              });
            }

            entityDocuments.forEach((entity) => {
              entitiesData.push(entity.id);
            });

            solutionDataToBeUpdated["entityType"] = constants.common.SCHOOL;
          }

          if (data.type && data.type !== constants.common.IMPROVEMENT_PROJECT) {
            solutionDataToBeUpdated["entities"] = entitiesData;
          }
        }

        //solution part
        let solution = "";
        if (data.solutionId && data.solutionId !== "") {
          let solutionData = await this.solutionDocuments(
            {
              _id: data.solutionId,
            },
            [
              "name",
              "link",
              "type",
              "subType",
              "externalId",
              "description",
              "certificateTemplateId",
              "projectTemplateId",
            ]
          );

          if (!solutionData.length > 0) {
            return resolve({
              status: httpStatusCode["bad_request"].status,
              message: constants.apiResponses.SOLUTION_NOT_FOUND,
              result: {},
            });
          }

          if (createADuplicateSolution === true) {
            let duplicateSolution = solutionData[0];
            let solutionCreationData = await _createSolutionData(
              duplicateSolution.name,
              duplicateSolution.externalId
                ? duplicateSolution.externalId + "-" + dateFormat
                : duplicateSolution.name + "-" + dateFormat,
              true,
              constants.common.ACTIVE,
              duplicateSolution.description,
              userId,
              false,
              duplicateSolution._id,
              duplicateSolution.type,
              duplicateSolution.subType,
              userId,
              duplicateSolution.projectTemplateId
            );

            _.merge(duplicateSolution, solutionCreationData);
            _.merge(duplicateSolution, solutionDataToBeUpdated);

            solution = await this.create(
              _.omit(duplicateSolution, ["_id", "link"])
            );
            parentSolutionInformation.solutionId = duplicateSolution._id;
            parentSolutionInformation.link = duplicateSolution.link;
          } else {
            if (solutionData[0].isReusable === false) {
              return resolve({
                status: httpStatusCode["bad_request"].status,
                message: constants.apiResponses.SOLUTION_NOT_FOUND,
                result: {},
              });
            }

            solution = await database.models.solutions.findOneAndUpdate(
              {
                _id: solutionData[0]._id,
              },
              {
                $set: solutionDataToBeUpdated,
              },
              {
                new: true,
              }
            );
          }
        } else {
          let externalId, description;
          if (data.solutionName) {
            externalId = data.solutionExternalId
              ? data.solutionExternalId
              : data.solutionName + "-" + dateFormat;
            description = data.solutionDescription
              ? data.solutionDescription
              : data.solutionName;
          } else {
            externalId = userId + "-" + dateFormat;
            description = userPrivateProgram.programDescription;
          }

          let createSolutionData = await _createSolutionData(
            data.solutionName
              ? data.solutionName
              : userPrivateProgram.programName,
            externalId,
            userPrivateProgram.isAPrivateProgram,
            constants.common.ACTIVE,
            description,
            "",
            false,
            "",
            data.type ? data.type : constants.common.ASSESSMENT,
            data.subType ? data.subType : constants.common.INSTITUTIONAL,
            userId
          );
          _.merge(solutionDataToBeUpdated, createSolutionData);
          solution = await this.create(solutionDataToBeUpdated);
        }

        if (solution && solution._id) {
          await database.models.programs.findOneAndUpdate(
            {
              _id: userPrivateProgram._id,
            },
            {
              $addToSet: { components: ObjectId(solution._id) },
            }
          );
        }

        return resolve({
          success: true,
          message: constants.apiResponses.USER_PROGRAM_AND_SOLUTION_CREATED,
          result: {
            program: userPrivateProgram,
            solution: solution,
            parentSolutionInformation: parentSolutionInformation,
          },
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Solution Report Information.
   * @method
   * @name read
   * @param {String} solutionId - Solution Id.
   * @param {String} userId - User Id.
   * @returns {Object} - Report Information of the solution.
   */

  // static read(solutionId, userId) {
  //   return new Promise(async (resolve, reject) => {
  //     try {

  //       let userInformation = await userExtensionsHelperV2.userExtensionDocument({
  //           userId: userId,
  //           "platformRoles.code" : { $in : ["PROGRAM_MANAGER","PROGRAM_DESIGNER"]},
  //           status: constants.common.ACTIVE,
  //           isDeleted: false
  //       }, { _id: 1, "platformRoles.programs" :1});

  //       if ( !userInformation ) {
  //           return resolve({
  //               status: httpStatusCode.bad_request.status,
  //               message: constants.apiResponses.NOT_AUTHORIZED_TO_ACCESS
  //           })
  //       }

  //       let userPrograms = userInformation.platformRoles ? userInformation.platformRoles : [];
  //       let programs = [];

  //       if ( !userPrograms.length > 0 ) {
  //           return resolve({
  //               status: httpStatusCode.bad_request.status,
  //               message: constants.apiResponses.NOT_AUTHORIZED_TO_ACCESS
  //           })
  //       }

  //       userPrograms.map(eachProgram => {
  //         if ( eachProgram["programs"] && eachProgram["programs"].length > 0 ) {
  //             programs.push(...eachProgram["programs"]);
  //         }
  //       });

  //       if ( !programs.length > 0 ) {
  //           return resolve({
  //               status: httpStatusCode.bad_request.status,
  //               message: constants.apiResponses.NOT_AUTHORIZED_TO_ACCESS
  //           })
  //       }

  //       let solutionData = await this.solutionDocuments({
  //         _id: solutionId,
  //         isDeleted: false,
  //         programId : { $in : programs }
  //       },["reportInformation"]);

  //       if ( !Array.isArray(solutionData) || solutionData.length < 1 ) {
  //         return resolve({
  //           message: constants.apiResponses.SOLUTION_NOT_FOUND,
  //           result: {},
  //         });
  //       }

  //       solutionData = solutionData[0];

  //       return resolve({
  //         message: constants.apiResponses.SOLUTION_DETAILS_FETCHED,
  //         success: true,
  //         result: solutionData.reportInformation ? solutionData.reportInformation : {},
  //       });

  //     } catch (error) {
  //       return resolve({
  //         success: false,
  //         status: error.status
  //           ? error.status
  //           : httpStatusCode['internal_server_error'].status,
  //         message: error.message,
  //       });
  //     }
  //   });
  // }
};

/**
 * Targeted solutions types.
 * @method
 * @name _targetedSolutionTypes
 * @returns {Array} - Targeted solution types
 */

function _targetedSolutionTypes() {
  return [
    constants.common.OBSERVATION,
    constants.common.SURVEY,
    constants.common.IMPROVEMENT_PROJECT,
    constants.common.COURSE,
  ];
}

/**
 * Generate sharing Link.
 * @method
 * @name _targetedSolutionTypes
 * @returns {Array} - Targeted solution types
 */

function _generateLink(appsPortalBaseUrl, prefix, solutionLink, solutionType) {
  let link;

  switch (solutionType) {
    case constants.common.OBSERVATION:
      link =
        appsPortalBaseUrl +
        prefix +
        constants.common.CREATE_OBSERVATION +
        solutionLink;
      break;
    case constants.common.IMPROVEMENT_PROJECT:
      link =
        appsPortalBaseUrl +
        prefix +
        constants.common.CREATE_PROJECT +
        solutionLink;
      break;
    default:
      link =
        appsPortalBaseUrl +
        prefix +
        constants.common.CREATE_SURVEY +
        solutionLink;
  }

  return link;
}

/**
 * Generate program creation data.
 * @method
 * @name _createProgramData
 * @returns {Object} - program creation data
 */

function _createProgramData(
  name,
  externalId,
  isAPrivateProgram,
  status,
  description,
  userId,
  startDate,
  endDate,
  createdBy = ""
) {
  let programData = {};
  programData.name = name;
  programData.externalId = externalId;
  programData.isAPrivateProgram = isAPrivateProgram;
  programData.status = status;
  programData.description = description;
  programData.userId = userId;
  programData.createdBy = createdBy;
  programData.startDate = startDate;
  programData.endDate = endDate;
  return programData;
}

/**
 * Generate solution creation data.
 * @method
 * @name _createSolutionData
 * @returns {Object} - solution creation data
 */

function _createSolutionData(
  name = "",
  externalId = "",
  isAPrivateProgram = "",
  status,
  description = "",
  userId,
  isReusable = "",
  parentSolutionId = "",
  type = "",
  subType = "",
  updatedBy = "",
  projectTemplateId = ""
) {
  let solutionData = {};
  solutionData.name = name;
  solutionData.externalId = externalId;
  solutionData.isAPrivateProgram = isAPrivateProgram;
  solutionData.status = status;
  solutionData.description = description;
  solutionData.author = userId;
  if (parentSolutionId) {
    solutionData.parentSolutionId = parentSolutionId;
  }
  if (type) {
    solutionData.type = type;
  }
  if (subType) {
    solutionData.subType = subType;
  }
  if (updatedBy) {
    solutionData.updatedBy = updatedBy;
  }
  if (isReusable) {
    solutionData.isReusable = isReusable;
  }
  if (projectTemplateId) {
    solutionData.projectTemplateId = projectTemplateId;
  }

  return solutionData;
}
