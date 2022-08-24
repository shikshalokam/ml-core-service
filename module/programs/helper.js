/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Programs related helper functionality.
 */

// Dependencies 

const entityTypesHelper = require(MODULES_BASE_PATH + "/entityTypes/helper");
const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const userService = require(ROOT_PATH + "/generics/services/users");

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
   * @param {Array} [skipFields = "none"] - field not to include
   * @returns {Array} List of programs. 
   */
  
  static programDocuments(
    filterQuery = "all", 
    fieldsArray = "all",
    skipFields = "none"
  ) {
    return new Promise(async (resolve, reject) => {
        try {
    
            let queryObject = (filterQuery != "all") ? filterQuery : {};
    
            let projection = {}
    
            if (fieldsArray != "all") {
                fieldsArray.forEach(field => {
                    projection[field] = 1;
                });
            }

            if( skipFields !== "none" ) {
              skipFields.forEach(field=>{
                projection[field] = 0;
              })
            }
            
            let programData = await database.models.programs.find(
              queryObject, 
              projection
            ).lean();
            
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
   * @returns {JSON} - create program.
   */

  static create(data) {

    return new Promise(async (resolve, reject) => {

      try {
        
        let programData = {
          "externalId" : data.externalId,
          "name" : data.name,
          "description" : data.description ,
          "owner" : data.userId,
          "createdBy" : data.userId,
          "updatedBy" : data.userId,
          "isDeleted" : false,
          "status" : "active",
          "resourceType" : [ 
              "Program"
          ],
          "language" : [ 
              "English"
          ],
          "keywords" : [
            "keywords 1",
            "keywords 2"
          ],
          "concepts" : [],
          "imageCompression" : {
              "quality" : 10
          },
          "components" : [],
          "isAPrivateProgram" : data.isAPrivateProgram ? data.isAPrivateProgram : false  
        }
        
        let program = await database.models.programs.create(
          programData
        );
        
        if( !program._id ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_CREATED
          };
        }
        
        if( data.scope ) {
          
          let programScopeUpdated = await this.setScope(
            program._id,
            data.scope
          );

          if( !programScopeUpdated.success ) {
            throw {
              message : constants.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM
            }
          }

        }

        return resolve(program);

      } catch (error) {
        return reject(error);
      }

    })
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

        let programsData = await this.programDocuments({
          createdBy : userId,
          isAPrivateProgram : true
        },["name","externalId","description","_id","isAPrivateProgram"]);

        if( !programsData.length > 0 ) {
          return resolve({
            message : constants.apiResponses.PROGRAM_NOT_FOUND,
            result : []
          });
        }

        return resolve(programsData);

      } catch (error) {

        return reject(error);

      }

    })
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

  static setScope( programId,scopeData ) {

    return new Promise(async (resolve, reject) => {

      try {

        let programData = await this.programDocuments({ _id : programId },["_id"]);

        if( !programData.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.PROGRAM_NOT_FOUND
          });
        }

        let scope = {};

        if( scopeData.entityType ) {
          // Get entity details of type {scopeData.entityType}
          let bodyData = {
            "type" : scopeData.entityType
          }
          let entityTypeData = await userService.locationSearch( bodyData );
          
          if( !entityTypeData.success ) {
            return resolve({
              status : httpStatusCode.bad_request.status,
              message : constants.apiResponses.ENTITY_TYPES_NOT_FOUND
            });
          }

          scope["entityType"] = entityTypeData.data[0].type;
  
        }

        if( scopeData.entities && scopeData.entities.length > 0 ) {
          
          //call learners api for search
          let entityIds = [];
          let bodyData={};
          let locationData = gen.utils.filterLocationIdandCode(scopeData.entities)
          
          //locationIds contain id of location data. 
          if ( locationData.ids.length > 0 ) {
            bodyData = {
              "id" : locationData.ids
            } 
            let entityData = await userService.locationSearch( bodyData );
            if ( entityData.success ) {
              entityData.data.forEach( entity => {
                entityIds.push(entity.id)
              });
            }
          }
          // 
          if ( locationData.codes.length > 0 ) {
            let filterData = {
              "externalId" : locationData.codes
            }
            let schoolDetails = await userService.orgSchoolSearch( filterData );
            
            if ( schoolDetails.success ) {
              let schoolData = schoolDetails.data;
              schoolData.forEach( entity => {
                entityIds.push(entity.externalId) 
              });
            }
          }
          
          if( !entityIds.length > 0 ) {
              throw {
                message : constants.apiResponses.ENTITIES_NOT_FOUND
              };
          }
          scope["entities"] = entityIds;
        } 

        if( scopeData.roles ) {
          
          if( Array.isArray(scopeData.roles) && scopeData.roles.length > 0 ) {
            
            let userRoles = await userRolesHelper.roleDocuments({
              code : { $in : scopeData.roles }
            },["_id","code"]);
            
            if( !userRoles.length > 0 ) {
              return resolve({
                status : httpStatusCode.bad_request.status,
                message : constants.apiResponses.INVALID_ROLE_CODE
              });
            }
    
            scope["roles"] = userRoles;
          } else {
            if( scopeData.roles === constants.common.ALL_ROLES ) {
              scope["roles"] = [{
                "code" : constants.common.ALL_ROLES
              }]; 
            }
          }
        }

        let updateProgram = 
        await database.models.programs.findOneAndUpdate(
          {
            _id : programId
          },
          { $set : { scope : scope }},{ new: true }
        ).lean();

        if( !updateProgram._id ) {
          throw {
            status : constants.apiResponses.PROGRAM_SCOPE_NOT_ADDED
          };
        }

        return resolve({
          success : true,
          message : constants.apiResponses.PROGRAM_UPDATED_SUCCESSFULLY,
          data : updateProgram
        });

      } catch (error) {
          return reject(error);
      }

    })
  }

   /**
   * Update program
   * @method
   * @name update
   * @param {String} programId - program id.
   * @param {Array} data 
   * @param {String} userId
   * @returns {JSON} - update program.
   */

  static update(programId,data,userId) {

    return new Promise( async (resolve, reject) => {

      try {

        data.updatedBy = userId;
        data.updatedAt = new Date();

        let program = await database.models.programs.findOneAndUpdate({
          _id : programId
        },{ $set : _.omit(data,["scope"]) }, { new: true });

        if( !program ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_UPDATED
          };
        }

        if( data.scope ) {
          
          let programScopeUpdated = await this.setScope(
            programId,
            data.scope
          );

          if( !programScopeUpdated.success ) {
            throw {
              message : constants.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM
            }
          }

        }

        return resolve({
          success : true,
          message : constants.apiResponses.PROGRAMS_UPDATED,
          data : {
            _id : programId
          }
        });

      } catch (error) {
          return resolve({
            success : false,
            message : error.message,
            data : {}
          });
      }

    })
  }

  /**
   * List program
   * @method
   * @name list
   * @param {Number} pageNo - page no.
   * @param {Nmber} pageSize - page size. 
   * @param {String} searchText - text to search.
   * @returns {Object} - Programs list. 
   */

  static list(pageNo,pageSize,searchText,filter = {},projection) {

    return new Promise( async (resolve, reject) => {

      try {

        let programDocument = [];

        let matchQuery = { status : constants.common.ACTIVE };

        if( Object.keys(filter).length > 0 ) {
          matchQuery = _.merge(matchQuery,filter);
        }

        if ( searchText !== "" ) {

          matchQuery["$or"] = [];
          matchQuery["$or"].push(
            { 
              "externalId": new RegExp(searchText, 'i') 
            }, {
              "name" : new RegExp(searchText,'i')
            },{ 
            "description": new RegExp(searchText, 'i') 
          });
        } 

        let sortQuery = {
          $sort: {"createdAt": -1}
        }

        let projection1 = {};

        if( projection && projection.length > 0 ) {

          projection.forEach(projectedData => {
            projection1[projectedData] = 1;
          });

        } else {
          
          projection1 = {
            description : 1,
            externalId : 1,
            isAPrivateProgram : 1
          };
        }

        let facetQuery = {};
        facetQuery["$facet"] = {};

        facetQuery["$facet"]["totalCount"] = [
          { "$count": "count" }
        ];

        facetQuery["$facet"]["data"] = [
          { $skip: pageSize * (pageNo - 1) },
          { $limit: pageSize }
        ];

        let projection2 = {};
        projection2["$project"] = {
          "data": 1,
          "count": {
            $arrayElemAt: ["$totalCount.count", 0]
          }
        };
       
        programDocument.push({ $match : matchQuery }, sortQuery,{ $project : projection1 }, facetQuery, projection2);
       
        let programDocuments = 
        await database.models.programs.aggregate(programDocument);

        return resolve({
          success : true,
          message : constants.apiResponses.PROGRAM_LIST,
          data : programDocuments[0]
        });

      } catch (error) {
          return resolve({
            success : false,
            message : error.message,
            data : []
          });
      }

    })
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

  static forUserRoleAndLocation( bodyData, pageSize, pageNo,searchText = "" ) {

    return new Promise(async (resolve, reject) => {

      try {

        let queryData = await this.queryBasedOnRoleAndLocation(
          bodyData
        );
        
        if( !queryData.success ) {
          return resolve(queryData);
        }

        let targetedPrograms = await this.list(
          pageNo,
          pageSize,
          searchText,
          queryData.data,
          ["name", "externalId","components"]
        );
             
        if ( targetedPrograms.success && targetedPrograms.data && targetedPrograms.data.data.length > 0) {

            for ( 
              let targetedProgram = 0; 
              targetedProgram < targetedPrograms.data.data.length;
              targetedProgram ++ 
            ) {
              
              let currentTargetedProgram = targetedPrograms.data.data[targetedProgram];

              if( currentTargetedProgram.components.length > 0 ) {

                let solutions = await solutionsHelper.solutionDocuments({
                  _id : { $in : currentTargetedProgram.components },
                  isDeleted : false,
                  status : constants.common.ACTIVE
                },["_id"]); 

                if( solutions && solutions.length > 0 ) {
                  currentTargetedProgram["solutions"] = solutions.length;
                  delete currentTargetedProgram.components;
                }

              }
            }
        }

        return resolve({
          success: true,
          message: constants.apiResponses.TARGETED_PROGRAMS_FETCHED,
          data: targetedPrograms.data
        });

      } catch (error) {

        return resolve({
          success : false,
          message : error.message,
          data : {}
        });

      }

    })
  }

  /**
   * Query data based on role and location.
   * @method
   * @name queryBasedOnRoleAndLocation
   * @param {Object} data - Requested body data.
   * @returns {JSON} - Query data based on role and location.
   */

  static queryBasedOnRoleAndLocation( data ) {
    return new Promise(async (resolve, reject) => {
      try {
        
        let locationIds = 
        Object.values(_.omit(data,["role","filter"])).map(locationId => {
          return locationId;
        });
        if( !locationIds.length > 0 ) {
          throw {
            message : constants.apiResponses.NO_LOCATION_ID_FOUND_IN_DATA
          }
        }

       
        let filterQuery = {
          "scope.roles.code" : { $in : [constants.common.ALL_ROLES,...data.role.split(",")] },
          "scope.entities" : { $in : locationIds },
          "isDeleted" : false,
          status : constants.common.ACTIVE
        }

        if( data.filter && Object.keys(data.filter).length > 0 ) {

          Object.keys(data.filter).forEach( filterKey => {
            
            if( gen.utils.isValidMongoId(data.filter[filterKey]) ) {
              data.filter[filterKey] = ObjectId(data.filter[filterKey]);
            }
          });
    
          filterQuery = _.merge(filterQuery,data.filter);
        }

        return resolve({
          success : true,
          data : filterQuery
        });

      } catch(error) {
        return resolve({
          success : false,
          status : error.status ? 
          error.status : httpStatusCode['internal_server_error'].status,
          message : error.message,
          data : {}
        })
      }
    })
  } 

  /**
   * Add roles in program.
   * @method
   * @name addRolesInScope
   * @param {String} programId - Program Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Added roles data.
   */

  static addRolesInScope( programId,roles ) {
    return new Promise(async (resolve, reject) => {
      try {

        let programData = 
        await this.programDocuments({ 
          _id : programId,
          scope : { $exists : true },
          isAPrivateProgram : false 
        },["_id"]);

        if( !programData.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.PROGRAM_NOT_FOUND
          });
        }

        let updateQuery = {};

        if( Array.isArray(roles) && roles.length > 0 ) {
          
          let userRoles = await userRolesHelper.roleDocuments({
            code : { $in : roles }
          },["_id","code"]
          );
          
          if( !userRoles.length > 0 ) {
            return resolve({
              status : httpStatusCode.bad_request.status,
              message : constants.apiResponses.INVALID_ROLE_CODE
            });
          }

          await database.models.programs.findOneAndUpdate({
            _id : programId
          },{
            $pull : { "scope.roles" : { code : constants.common.ALL_ROLES } }
          },{ new : true }).lean();

          updateQuery["$addToSet"] = {
            "scope.roles" : { $each : userRoles }
          }

        } else {
          if( roles === constants.common.ALL_ROLES ) {
            
            updateQuery["$set"] = {
              "scope.roles" : [{ "code" : constants.common.ALL_ROLES }]
            }
          }
        }

        let updateProgram = await database.models.programs.findOneAndUpdate({
          _id : programId
        },updateQuery,{ new : true }).lean();

        if( !updateProgram || !updateProgram._id ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_UPDATED
          }
        }

        return resolve({
          message : constants.apiResponses.ROLES_ADDED_IN_PROGRAM,
          success : true
        });

      } catch(error) {
        return resolve({
          success : false,
          status : error.status ? 
          error.status : httpStatusCode['internal_server_error'].status,
          message : error.message
        })
      }
    })
  } 

   /**
   * Add entities in program.
   * @method
   * @name addEntitiesInScope
   * @param {String} programId - Program Id.
   * @param {Array} entities - entities data.
   * @returns {JSON} - Added entities data.
   */

  static addEntitiesInScope( programId, entities ) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = 
        await this.programDocuments({ 
          _id : programId,
          scope : { $exists : true },
          isAPrivateProgram : false 
        },["_id"]);
       
        if( !programData.length > 0 ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_FOUND
          };
        }
        
        let entityIds = [];
        let bodyData={};
        let locationData = gen.utils.filterLocationIdandCode(entities)
        
        if ( locationData.ids.length > 0 ) {
          bodyData = {
            "id" : locationData.ids
          } 
          let entityData = await userService.locationSearch( bodyData );
          if ( entityData.success ) {
            entityData.data.forEach( entity => {
              entityIds.push(entity.id)
            });
          }
        }

        if ( locationData.codes.length > 0 ) {
          let filterData = {
            "externalId" : locationData.codes
          }
          let schoolDetails = await userService.orgSchoolSearch( filterData );
          
          if ( schoolDetails.success ) {
            let schoolData = schoolDetails.data;
            schoolData.forEach( entity => {
              entityIds.push(entity.externalId)
            });
          }
        }
        
        if( !entityIds.length > 0 ) {
            throw {
              message : constants.apiResponses.ENTITIES_NOT_FOUND
            };
        }

        let updateProgram = await database.models.programs.findOneAndUpdate({
          _id : programId
        },{
          $addToSet : { "scope.entities" : { $each : entityIds } }
        },{ new : true }).lean();
        
        if( !updateProgram || !updateProgram._id ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_UPDATED
          }
        }

        return resolve({
          message : constants.apiResponses.ENTITIES_ADDED_IN_PROGRAM,
          success : true
        });

      } catch(error) {
        
        return resolve({
          success : false,
          status : error.status ? 
          error.status : httpStatusCode['internal_server_error'].status,
          message : error.message
        })
      }
    })
  } 

   /**
   * remove roles in program.
   * @method
   * @name removeRolesInScope
   * @param {String} programId - Program Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Added roles data.
   */

  static removeRolesInScope( programId,roles ) {
    return new Promise(async (resolve, reject) => {
      try {

        let programData = 
        await this.programDocuments({ 
          _id : programId,
          scope : { $exists : true },
          isAPrivateProgram : false 
        },["_id"]);

        if( !programData.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.PROGRAM_NOT_FOUND
          });
        }

        let userRoles = await userRolesHelper.roleDocuments({
          code : { $in : roles }
        },["_id","code"]
        );
        
        if( !userRoles.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.INVALID_ROLE_CODE
          });
        }

        let updateProgram = await database.models.programs.findOneAndUpdate({
          _id : programId
        },{
          $pull : { "scope.roles" : { $in : userRoles } }
        },{ new : true }).lean();

        if( !updateProgram || !updateProgram._id ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_UPDATED
          }
        }

        return resolve({
          message : constants.apiResponses.ROLES_REMOVED_IN_PROGRAM,
          success : true
        });

      } catch(error) {
        return resolve({
          success : false,
          status : error.status ? 
          error.status : httpStatusCode['internal_server_error'].status,
          message : error.message
        })
      }
    })
  } 

   /**
   * remove entities in program scope.
   * @method
   * @name removeEntitiesInScope
   * @param {String} programId - Program Id.
   * @param {Array} entities - entities.
   * @returns {JSON} - Removed entities data.
   */

  static removeEntitiesInScope( programId,entities ) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = 
        await this.programDocuments({ 
          _id : programId,
          scope : { $exists : true },
          isAPrivateProgram : false 
        },["_id","scope.entities"]);
        
        if( !programData.length > 0 ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_FOUND
          };
        }
        let entitiesData = [];
        entitiesData = programData[0].scope.entities;
       
        if( !entitiesData.length > 0 ) {
            throw {
              message : constants.apiResponses.ENTITIES_NOT_FOUND
            };
        }
        
        let updateProgram = await database.models.programs.findOneAndUpdate({
          _id : programId
        },{
          $pull : { "scope.entities" : { $in : entities} }
        },{ new : true }).lean();
        
        if( !updateProgram || !updateProgram._id ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_UPDATED
          }
        }
       
        return resolve({
          message : constants.apiResponses.ENTITIES_REMOVED_IN_PROGRAM,
          success : true
        });

      } catch(error) {
        return resolve({
          success : false,
          status : error.status ? 
          error.status : httpStatusCode['internal_server_error'].status,
          message : error.message
        })
      }
    })
  } 

};

const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");