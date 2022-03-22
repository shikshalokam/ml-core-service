/**
 * name : users/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : All User related information including sys_admin.
 */

// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper");
const improvementProjectService = require(ROOT_PATH + "/generics/services/improvement-project");
const userService = require(ROOT_PATH + "/generics/services/users");
const sunbirdService = require(ROOT_PATH + '/generics/services/sunbird');
let cache = require(ROOT_PATH+"/generics/helpers/cache");
const formService = require(ROOT_PATH + '/generics/services/form');


/**
    * UsersHelper
    * @class
*/

module.exports = class UsersHelper {

    /**
  * List of all private programs created by user
  * @method
  * @name privatePrograms
  * @param {string} userId - logged in user Id.
  * @returns {Array} - List of all private programs created by user.
  */

     static privatePrograms(userId) {
      return new Promise(async (resolve, reject) => {
          try {
            
              let userPrivatePrograms =
                  await programsHelper.userPrivatePrograms(
                      userId
                  );

              return resolve({
                  message: constants.apiResponses.PRIVATE_PROGRAMS_LIST,
                  result: userPrivatePrograms
              })

          } catch (error) {
              return reject(error);
          }
      })
  }

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
        if ( data.programId && data.programId !== "" ) {

          let filterQuery = {
            _id: data.programId
          }

          if ( createADuplicateSolution === false ) {
            filterQuery.createdBy = userId;
          }

          let checkforProgramExist = await programsHelper.programDocuments(
            filterQuery,
            "all",
            ["__v"]
          );
          
          if ( !checkforProgramExist.length > 0 ) {
            return resolve({
              status: httpStatusCode["bad_request"].status,
              message: constants.apiResponses.PROGRAM_NOT_FOUND,
              result: {}
            });
          }

          if ( createADuplicateSolution === true ) {

            let duplicateProgram = checkforProgramExist[0];
            duplicateProgram = await _createProgramData(
              duplicateProgram.name,
              duplicateProgram.externalId ? duplicateProgram.externalId + "-" + dateFormat : duplicateProgram.name + "-" + dateFormat,
              true,
              constants.common.ACTIVE,
              duplicateProgram.description,
              userId,
              userId
            );

            userPrivateProgram = await programsHelper.create(
              _.omit(duplicateProgram, ["_id", "components", "scope"])
            );

          } else {
            userPrivateProgram = checkforProgramExist[0];
          }
        } else {

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
            userId
          );
          
          userPrivateProgram = await programsHelper.create(programData);
          
        }

        let solutionDataToBeUpdated = {
          programId: userPrivateProgram._id,
          programExternalId: userPrivateProgram.externalId,
          programName: userPrivateProgram.name,
          programDescription: userPrivateProgram.description,
          isAPrivateProgram: userPrivateProgram.isAPrivateProgram
        };

        //entities
        if (
          Array.isArray(data.entities) &&
          data.entities &&
          data.entities.length > 0
        ) {
          

          let locationIds = [];
          let bodyData={};
          

          data.entities.forEach(entity=>{
            if (gen.utils.checkValidUUID(entity)) {
              locationIds.push(entity);
            }
          });
        
          bodyData = {
            "id" : locationIds
          } 
          let entityData = await sunbirdService.learnerLocationSearch( bodyData );
          
          if ( !entityData.data.count > 0 ) {
            return resolve({
              status: httpStatusCode["bad_request"].status,
              message: constants.apiResponses.ENTITY_NOT_FOUND,
              result: {}
            });
          }

          if ( data.type && data.type !== constants.common.IMPROVEMENT_PROJECT ) {
            solutionDataToBeUpdated["entities"] = entityData.data.response.map(
              
              (entity) => entity.id
            );
          }

          solutionDataToBeUpdated["entityType"] = entityData.data.response[0].type;
          
        }

        //solution part
        let solution = "";
        if ( data.solutionId && data.solutionId !== "" ) {
          let solutionData = await solutionsHelper.solutionDocuments(
            {
              _id: data.solutionId,
            },
            ["name", "link", "type", "subType", "externalId", "description"]
          );

          if ( !solutionData.length > 0 ) {
            return resolve({
              status: httpStatusCode["bad_request"].status,
              message: constants.apiResponses.SOLUTION_NOT_FOUND,
              result: {}
            });
          }

          if ( createADuplicateSolution === true ) {

            let duplicateSolution = solutionData[0];
            let solutionCreationData = await _createSolutionData(
              duplicateSolution.name,
              duplicateSolution.externalId ? duplicateSolution.externalId + "-" + dateFormat : duplicateSolution.name + "-" + dateFormat,
              true,
              constants.common.ACTIVE,
              duplicateSolution.description,
              userId,
              false,
              duplicateSolution._id
            );

            _.merge(duplicateSolution, solutionCreationData);
            _.merge(duplicateSolution, solutionDataToBeUpdated);

            solution = await solutionsHelper.create(
              _.omit(duplicateSolution, ["_id", "link"])
            );

            parentSolutionInformation.solutionId = duplicateSolution._id;
            parentSolutionInformation.link = duplicateSolution.link;

          } else {

              if ( solutionData[0].isReusable === false ) {
                return resolve({
                  status: httpStatusCode["bad_request"].status,
                  message: constants.apiResponses.SOLUTION_NOT_FOUND,
                  result: {}
                });
              }

            solution = await database.models.solutions.findOneAndUpdate({
                  _id: solutionData[0]._id
                },
                {
                  $set: solutionDataToBeUpdated
                },
                {
                  new: true
                }
            );
            }
        } else {

            let externalId, description;
            if ( data.solutionName ) {
              
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

            solution = await solutionsHelper.create(solutionDataToBeUpdated);
        }

        if ( solution && solution._id ) {
          await database.models.programs.findOneAndUpdate(
            {
              _id: userPrivateProgram._id
            },
            {
              $addToSet: { components: ObjectId(solution._id) }
            }
          );
        }

        return resolve({
          message: constants.apiResponses.USER_PROGRAM_AND_SOLUTION_CREATED,
          result: {
            program: userPrivateProgram,
            solution: solution,
            parentSolutionInformation: parentSolutionInformation
          }
        });

      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
      * Entities mapping form data.
      * @method
      * @name entitiesMappingForm
      * @param {String} stateCode - state code.
      * @param {String} roleId - role id.
      * @returns {Object} returns a list of entitiesMappingForm.
     */

    static entitiesMappingForm(stateCode, roleId, entityKey) {
        return new Promise(async (resolve, reject) => {
            try {
                
                const rolesData = await userRolesHelper.roleDocuments({
                    _id: roleId
                }, ["entityTypes.entityType"]);

                if (!rolesData.length > 0) {
                    return resolve({
                        message: constants.apiResponses.USER_ROLES_NOT_FOUND,
                        result: []
                    })
                }
                
                let subEntities = await cache.getValue(entityKey);
                
                if( !subEntities.length > 0 ) {
                  subEntities = await formService.formData( stateCode,entityKey );
                  if( !subEntities.length > 0 ) {
                      return resolve({
                          message : constants.apiResponses.ENTITY_NOT_FOUND,
                          result : []
                      })
                  }
                }
                
                
                let roleEntityType = "";

                rolesData[0].entityTypes.forEach(roleData => {
                    if (subEntities.includes(roleData.entityType)) {
                        roleEntityType = roleData.entityType;
                    }
                })
                
                let entityTypeIndex =
                subEntities.findIndex(path => path === roleEntityType);
                
                let form = {
                    "field": "",
                    "label": "",
                    "value": "",
                    "visible": true,
                    "editable": true,
                    "input": "text",
                    "validation": {
                        "required": false
                    }
                };

                let forms = [];

                for (
                    let pointerToChildHierarchy = 1;
                    pointerToChildHierarchy < entityTypeIndex + 1;
                    pointerToChildHierarchy++
                ) {
                    let cloneForm = JSON.parse(JSON.stringify(form));
                    let entityType = subEntities[pointerToChildHierarchy];
                    cloneForm["field"] = entityType;
                    cloneForm["label"] = `Select ${gen.utils.camelCaseToTitleCase(entityType)}`;

                    if (roleEntityType === entityType) {
                        cloneForm.validation.required = true;
                    }

                    forms.push(cloneForm);
                }

                return resolve({
                    message: constants.apiResponses.ENTITIES_MAPPING_FORM_FETCHED,
                    result: forms
                });
            } catch (error) {
                return reject(error);
            }
        })
    }

  /**
   * User targeted solutions.
   * @method
   * @name solutions
   * @param {String} programId - program id.
   * @param {Object} requestedData requested data.
   * @param {String} pageSize page size.
   * @param {String} pageNo page no.
   * @param {String} search search text.
   * @returns {Object} targeted user solutions.
   */

  static solutions(programId, requestedData, pageSize, pageNo, search, token) {
    return new Promise(async (resolve, reject) => {
      
      try {
        let programData = await programsHelper.programDocuments(
          {
            _id: programId
          },
          ["name"]
        );
        
        if (!programData.length > 0) {
          return resolve({
            status: httpStatusCode["bad_request"].status,
            message: constants.apiResponses.PROGRAM_NOT_FOUND
          });
        }

        let autoTargetedSolutions =
          await solutionsHelper.forUserRoleAndLocation(
            requestedData,
            "",
            "",
            programId,
            constants.common.DEFAULT_PAGE_SIZE,
            constants.common.DEFAULT_PAGE_NO,
            search
          );

        let totalCount = 0;
        let mergedData = [];

        if (
          autoTargetedSolutions.data.data &&
          autoTargetedSolutions.data.data.length > 0
        ) {

          // Remove observation solutions which for project tasks.
          
          _.remove(autoTargetedSolutions.data.data, function(solution) {
              return solution.referenceFrom == constants.common.PROJECT && solution.type == constants.common.OBSERVATION;
            });

          totalCount = autoTargetedSolutions.data.data.count;

          mergedData = autoTargetedSolutions.data.data;

          mergedData = mergedData.map((targetedData) => {
            delete targetedData.programId;
            delete targetedData.programName;
            return targetedData;
          });

          
        }
        
        let importedProjects = await improvementProjectService.importedProjects(
          token,
          programId
        );
        
        if (importedProjects.success) {
          if (importedProjects.data && importedProjects.data.length > 0) {
            totalCount += importedProjects.data.length;

            importedProjects.data.forEach((importedProject) => {
              let data = importedProject.solutionInformation;
              data['projectTemplateId'] = importedProject.projectTemplateId;
              data["type"] = constants.common.IMPROVEMENT_PROJECT;
              mergedData.push(data);
            });
          }
        }

        if (mergedData.length > 0) {
          let startIndex = pageSize * (pageNo - 1);
          let endIndex = startIndex + pageSize;
          mergedData = mergedData.slice(startIndex, endIndex);
        }

        let result = {
          programName: programData[0].name,
          programId: programId,
          description: constants.common.TARGETED_SOLUTION_TEXT,
          data: mergedData,
          count: totalCount
        };

        return resolve({
          message: constants.apiResponses.PROGRAM_SOLUTIONS_FETCHED,
          success: true,
          data: result
        });
      } catch (error) {
        return resolve({
          success: false,
          data: {
            description: constants.common.TARGETED_SOLUTION_TEXT,
            data: [],
            count: 0
          },
        });
      }
    });
  }

  /**
   * User targeted programs.
   * @method
   * @name programs
   * @param {Object} bodyData - request body data.
   * @param {String} pageNo - Page number.
   * @param {String} pageSize - Page size.
   * @param {String} searchText - Search text.
   * @returns {Array} - Get user targeted programs.
   */

  static programs(bodyData, pageNo, pageSize, searchText) {
    return new Promise(async (resolve, reject) => {
      try {
        let targetedProgrms = await programsHelper.forUserRoleAndLocation(
          bodyData,
          pageSize,
          pageNo,
          searchText
        );

        if (!targetedProgrms.success) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          };
        }

        targetedProgrms.data["description"] =
          constants.apiResponses.PROGRAM_DESCRIPTION;

        return resolve({
          success: true,
          message: constants.apiResponses.USER_TARGETED_PROGRAMS_FETCHED,
          data: targetedProgrms.data
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: {
            description: constants.common.TARGETED_SOLUTION_TEXT,
            data: [],
            count: 0,
          },
        });
      }
    });
  }

  /**
   * List of entity types by location and role.
   * @method
   * @name entityTypesByLocationAndRole
   * @param {String} stateLocationId - state location id.
   * @param {String} role - role.
   * @returns {Object} returns a list of entity type by location and role.
   */
   static entityTypesByLocationAndRole(stateLocationId, role) {
    return new Promise(async (resolve, reject) => {
      try {
        let entityKey = constants.common.SUBENTITY + stateLocationId;
        const rolesDocument = await userRolesHelper.roleDocuments(
          {
            code: role.toUpperCase(),
          },
          ["_id", "entityTypes.entityType"]
        );
        
        if (!rolesDocument.length > 0) {
          throw {
            message: constants.apiResponses.USER_ROLES_NOT_FOUND
          };
        }
        


        let bodyData={};    
        if (gen.utils.checkValidUUID(stateLocationId)) {
          bodyData = {
            "id" : stateLocationId
          };
        } else {
          bodyData = {
            "code" : stateLocationId
          };
        }
        
        let entityData = await sunbirdService.learnerLocationSearch( bodyData );
        
        if ( !entityData.data.response.length > 0) {
          throw {
            message: constants.apiResponses.ENTITIES_NOT_EXIST_IN_LOCATION,
          };
        }
        
      
        let entityTypes = [];
        let stateEntityExists = false;

        rolesDocument[0].entityTypes.forEach((roleDocument) => {
         
          if (roleDocument.entityType === constants.common.STATE_ENTITY_TYPE) {
            stateEntityExists = true;
          }
        });
        
        if (stateEntityExists) {
          entityTypes = [constants.common.STATE_ENTITY_TYPE];
        } else {
          let entitiesMappingForm = await this.entitiesMappingForm(
            entityData.data.response[0].code,
            rolesDocument[0]._id,
            entityKey
          );

          entitiesMappingForm.result.forEach((entitiesMappingData) => {
            entityTypes.push(entitiesMappingData.field);
          });
        }

        return resolve({
          success: true,
          message: constants.apiResponses.ENTITY_TYPES_FETCHED,
          data: entityTypes
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message
        });
      }
    });
  }
  

  /**
   * User Targeted entity.
   * @method
   * @name targetedEntity
   * @param {String} solutionId - solution id
   * @param {Object} requestedData - requested data
   * @returns {Object} - Details of the solution.
   */

  static targetedEntity(solutionId, requestedData) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsHelper.solutionDocuments(
          {
            _id: solutionId,
            isDeleted: false
          },
          ["entityType", "type"]
        );

        if (!solutionData.length > 0) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND
          });
        }
        let rolesDocument = await userRolesHelper.roleDocuments(
          {
            code: requestedData.role
          },
          ["entityTypes.entityType"]
        );

        if (!rolesDocument.length > 0) {
          throw {
            status: httpStatusCode["bad_request"].status,
            message: constants.apiResponses.USER_ROLES_NOT_FOUND
          };
        }

        let requestedEntityTypes = Object.keys(_.omit(requestedData, ['role']));
        let targetedEntityType = "";
        
        rolesDocument[0].entityTypes.forEach((singleEntityType) => {
          if (requestedEntityTypes.includes(singleEntityType.entityType)) {
            targetedEntityType = singleEntityType.entityType;
          }
        });
        
        if (!requestedData[targetedEntityType]) {
          throw {
            status: httpStatusCode["bad_request"].status,
            message: constants.apiResponses.ENTITIES_NOT_ALLOWED_IN_ROLE
          };
        }
        let filterData ={};
        if (solutionData[0].entityType === targetedEntityType) {
  
          if (gen.utils.checkValidUUID(requestedData[targetedEntityType])) {
            filterData = {
              "parentId" : requestedData[targetedEntityType]
            }
          }
          let entitiesData = await sunbirdService.learnerLocationSearch( filterData );
          if( entitiesData.count > 0 ){
            targetedEntityType = constants.common.STATE_ENTITY_TYPE;
          }          
        }
       
        if (gen.utils.checkValidUUID(requestedData[targetedEntityType])) {
          filterData = {
            "id" : requestedData[targetedEntityType]
          };
          } else {
          filterData = {
            "code" : requestedData[targetedEntityType]
          };
        }
        let entitiesDocument = await sunbirdService.learnerLocationSearch( filterData );
        if (!entitiesDocument.data.count > 0) {
          throw {
            message: constants.apiResponses.ENTITY_NOT_FOUND
          };
        }

        let entityData = entitiesDocument.data.response;
        let entityDataFormated = {
          "_id" : entityData[0].id,
          "entityType" : entityData[0].type,
          "entityName" : entityData[0].name
        }
        return resolve({
          message: constants.apiResponses.SOLUTION_TARGETED_ENTITY,
          success: true,
          data: entityDataFormated
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode['internal_server_error'].status,
          message: error.message
        });
      }
    });
  }

  /**
   * Highest Targeted entity.
   * @method
   * @name getHighestTargetedEntity
   * @param {Object} requestedData - requested data
   * @returns {Object} - Entity.
   */

  static getHighestTargetedEntity( roleWiseTargetedEntities,requestedData ) {
    return new Promise(async (resolve, reject) => {
      try {
        let entityKey = constants.common.SUBENTITY + requestedData.state;
        let subEntities = await cache.getValue(entityKey);
        if( !subEntities.length > 0 ) {
            let filterData = {
              "id" : requestedData.state
            };

            let entitiesData = await sunbirdService.learnerLocationSearch( filterData );

            if( !entitiesData.data.response.length > 0 ) {
                return resolve({
                    message : constants.apiResponses.ENTITY_NOT_FOUND,
                    result : []
                })
            }
            let stateLocationCode = entitiesData.data.response[0].code;
            subEntities = await formService.formData( stateLocationCode,entityKey );
            if( !subEntities.length > 0 ) {
                return resolve({
                    message : constants.apiResponses.ENTITY_NOT_FOUND,
                    result : []
                })
            }
        }        
        let targetedIndex = subEntities.length;
        let roleWiseTarget;
        for( let roleWiseEntityIndex = 0; roleWiseEntityIndex < roleWiseTargetedEntities.length; roleWiseEntityIndex++ ) {
          for( let subEntitiesIndex = 0; subEntitiesIndex < subEntities.length; subEntitiesIndex++ ) {
            if( roleWiseTargetedEntities[roleWiseEntityIndex].entityType == subEntities[subEntitiesIndex] ) {
                if( subEntitiesIndex < targetedIndex) {
                  targetedIndex = subEntitiesIndex;
                  roleWiseTarget = roleWiseEntityIndex;
                }
            }
          }
        }
        
        let targetedEntity = roleWiseTargetedEntities[roleWiseTarget];
        return resolve({
          message: constants.apiResponses.SOLUTION_TARGETED_ENTITY,
          success: true,
          data: targetedEntity
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode['internal_server_error'].status,
          message: error.message
        });
      }
    });
  }


  
};

/**
   * Generate program creation data.
   * @method
   * @name _createProgramData
   * @returns {Object} - program creation data
   */

function _createProgramData(name, externalId, isAPrivateProgram, status, description, userId, createdBy = "") {

    let programData = {};
    programData.name = name;
    programData.externalId = externalId;
    programData.isAPrivateProgram = isAPrivateProgram;
    programData.status = status;
    programData.description = description;
    programData.userId = userId;
    programData.createdBy = createdBy;
    return programData;

}

/**
   * Generate solution creation data.
   * @method
   * @name _createSolutionData
   * @returns {Object} - solution creation data
   */

function _createSolutionData(name = "", externalId = "", isAPrivateProgram = "", status, description = "", userId, isReusable = "", parentSolutionId = "", type = "", subType = "", updatedBy="") {

    let solutionData = {};
    solutionData.name = name;
    solutionData.externalId = externalId;
    solutionData.isAPrivateProgram = isAPrivateProgram;
    solutionData.status = status;
    solutionData.description = description;
    solutionData.userId = userId;
    if( parentSolutionId ) {
        solutionData.parentSolutionId = parentSolutionId;
    }
    if( type){
        solutionData.type = type;
    }
    if( subType){
        solutionData.subType = subType;
    }
    if( updatedBy){
        solutionData.updatedBy = updatedBy;
    }
    if( isReusable){
        solutionData.isReusable = isReusable;
    }

    return solutionData;

}

