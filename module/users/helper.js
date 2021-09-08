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


/**
    * UsersHelper
    * @class
*/

module.exports = class UsersHelper {

    /**
     * create user.
     * @method
     * @name create
     * @param {Object} userData user data.
     * @param {String} userData.email email id of the user.
     * @param {String} userData.userName  name of the user.
     * @param {String} userData.role  role of the user.
     * @returns {Promise} returns a promise.
    */

    static create(userData) {
        return new Promise(async (resolve, reject) => {
            try {

                let checkUserExistence =
                    await database.models.users.findOne({
                        email: userData.email
                    }).lean();

                if (checkUserExistence) {
                    throw {
                        message: "User already exists"
                    }
                }

                let createUser =
                    await database.models.users.create(userData)

                let response = {
                    success: true,
                    message: "User created successfully"
                }

                if (!createUser) {
                    response["success"] = false;
                    response["message"] = "User could not be created";
                }

                return resolve(response);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * check if the provided email is sys admin or not.
      * @method
      * @name isSystemAdmin
      * @param {String} userEmail user email address.
      * @returns {Promise} returns a promise.
     */

    static isSystemAdmin(userEmail) {
        return new Promise(async (resolve, reject) => {
            try {

                let userDocument =
                    await database.models.users.findOne({
                        email: userEmail,
                        role: "SYS_ADMIN"
                    }).lean();

                let response = {
                    success: true
                }

                if (!userDocument) {
                    response["success"] = false;
                }

                return resolve(response);

            } catch (error) {
                return reject(error);
            }
        })
    }

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

    static createProgramAndSolution(userId, data) {
        return new Promise(async (resolve, reject) => {
            try {

                let userPrivateProgram = {};
                let dateFormat = gen.utils.epochTime();

                if (data.programId && data.programId !== "") {

                    userPrivateProgram = await programsHelper.programDocuments(
                        {
                            _id: data.programId,
                            createdBy: userId
                        }
                    );

                    if (!userPrivateProgram.length > 0) {
                        return resolve({
                            status: httpStatusCode['bad_request'].status,
                            message: constants.apiResponses.PROGRAM_NOT_FOUND,
                            result: {}
                        })
                    }

                    userPrivateProgram = userPrivateProgram[0];

                } else {

                    let programData = {
                        name: data.programName,
                        isAPrivateProgram: true,
                        status: constants.common.ACTIVE_STATUS,
                        externalId:
                            data.programExternalId ?
                                data.programExternalId :
                                data.programName + "-" + dateFormat,
                        description:
                            data.programDescription ?
                                data.programDescription :
                                data.programName,
                        userId: userId
                    }

                    userPrivateProgram =
                        await programsHelper.create(
                            programData
                        );
                }

                let solutionDataToBeUpdated = {
                    programId: userPrivateProgram._id,
                    programExternalId: userPrivateProgram.externalId,
                    programName: userPrivateProgram.name,
                    programDescription: userPrivateProgram.description,
                    isAPrivateProgram: userPrivateProgram.isAPrivateProgram
                };

                if ( Array.isArray(data.entities) && data.entities && data.entities.length > 0) {

                    let entityData = await entitiesHelper.entityDocuments(
                        {
                            _id: { $in: data.entities }
                        }, ["entityType", "entityTypeId"]
                    );

                    if (!entityData.length > 0) {
                        return resolve({
                            status: httpStatusCode['bad_request'].status,
                            message: constants.apiResponses.ENTITY_NOT_FOUND,
                            result: {}
                        })
                    }

                    if( data.type && data.type !== constants.common.IMPROVEMENT_PROJECT ) {
                        solutionDataToBeUpdated["entities"] = entityData.map(entity => entity._id);
                    }

                    solutionDataToBeUpdated["entityType"] = entityData[0].entityType;
                    solutionDataToBeUpdated["entityTypeId"] = entityData[0].entityTypeId;
                }

                let solution = ""

                if (data.solutionId && data.solutionId !== "") {

                    let solutionData =
                        await solutionsHelper.solutionDocuments({
                            _id: data.solutionId,
                            isReusable: false
                        }, ["_id"]);

                    if (!solutionData.length > 0) {

                        return resolve({
                            status: httpStatusCode['bad_request'].status,
                            message: constants.apiResponses.SOLUTION_NOT_FOUND,
                            result: {}
                        })
                    }

                    solution =
                        await database.models.solutions.findOneAndUpdate({
                            _id: solutionData[0]._id
                        }, {
                            $set: solutionDataToBeUpdated
                        }, {
                            new: true
                        });


                } else {

                    solutionDataToBeUpdated["type"] =
                        data.type ? data.type : constants.common.ASSESSMENT;
                    solutionDataToBeUpdated["subType"] =
                        data.subType ? data.subType : constants.common.INSTITUTIONAL;

                    solutionDataToBeUpdated["isReusable"] = false;

                    if (data.solutionName) {
                        solutionDataToBeUpdated["name"] = data.solutionName;
                        solutionDataToBeUpdated["externalId"] =
                            data.solutionExternalId ?
                                data.solutionExternalId : data.solutionName + "-" + dateFormat;
                        solutionDataToBeUpdated["description"] =
                            data.solutionDescription ? data.solutionDescription : data.solutionName;
                    } else {
                        solutionDataToBeUpdated["name"] = userPrivateProgram.programName,
                            solutionDataToBeUpdated["externalId"] = userId + "-" + dateFormat;
                        solutionDataToBeUpdated["description"] = userPrivateProgram.programDescription;
                    }

                    solutionDataToBeUpdated.updatedBy = userId;

                    solution = await solutionsHelper.create(solutionDataToBeUpdated);
                }

                if (solution._id) {

                    await database.models.programs.findOneAndUpdate(
                        {
                            _id: userPrivateProgram._id
                        }, {
                        $addToSet: { components: ObjectId(solution._id) }
                    });
                }

                return resolve({
                    message: constants.apiResponses.USER_PROGRAM_AND_SOLUTION_CREATED,
                    result: {
                        program: userPrivateProgram,
                        solution: solution
                    }
                });

            } catch (error) {
                console.log(error);
                return reject(error);
            }
        })
    }

    /**
      * Entities mapping form data.
      * @method
      * @name entitiesMappingForm
      * @param {String} stateId - state id.
      * @param {String} roleId - role id.
      * @returns {Object} returns a list of entitiesMappingForm.
     */

    static entitiesMappingForm(stateId, roleId) {
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

                const entitiesData = await entitiesHelper.entityDocuments(
                    {
                        _id: stateId,
                    }, ["childHierarchyPath"]
                );

                if (!entitiesData.length > 0) {
                    return resolve({
                        message: constants.apiResponses.ENTITY_NOT_FOUND,
                        result: []
                    })
                }

                let roleEntityType = "";

                rolesData[0].entityTypes.forEach(roleData => {
                    if (entitiesData[0].childHierarchyPath.includes(roleData.entityType)) {
                        roleEntityType = roleData.entityType;
                    }
                })

                let entityTypeIndex =
                entitiesData[0].childHierarchyPath.findIndex(path => path === roleEntityType);

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
                    let pointerToChildHierarchy = 0;
                    pointerToChildHierarchy < entityTypeIndex + 1;
                    pointerToChildHierarchy++
                ) {
                    let cloneForm = JSON.parse(JSON.stringify(form));
                    let entityType = entitiesData[0].childHierarchyPath[pointerToChildHierarchy];
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

    static solutions( programId,requestedData,pageSize,pageNo,search,token ) {
        return new Promise(async (resolve, reject) => {
            try {

                let programData = await programsHelper.programDocuments({
                    _id : programId
                },["name"]);

                if( !programData.length > 0 ) {
                    return resolve({
                        status : httpStatusCode["bad_request"].status,
                        message : constants.apiResponses.PROGRAM_NOT_FOUND
                    })
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

                if( autoTargetedSolutions.data.data && autoTargetedSolutions.data.data.length > 0 ) {
                    
                    totalCount = autoTargetedSolutions.data.count;

                    mergedData = autoTargetedSolutions.data.data;

                    mergedData = 
                    mergedData.map( targetedData => {
                        delete targetedData.programId;
                        delete targetedData.programName;
                        if( !targetedData.link ){
                            targetedData.link = "";
                        }
                        return targetedData;
                    });
                }
                    
                let importedProjects = 
                await improvementProjectService.importedProjects(
                    token,
                    programId
                );

                if( importedProjects.success ) {
                    
                    if( importedProjects.data && importedProjects.data.length > 0 ) {
                        
                        totalCount += importedProjects.data.length;


                        importedProjects.data.forEach(importedProject => {
                            let data = importedProject.solutionInformation;
                            data["projectTemplateId"] = importedProject.projectTemplateId;
                            data["type"] = constants.common.IMPROVEMENT_PROJECT;
                            mergedData.push(data);
                        });

                    }
                }

                if( mergedData.length > 0 ) {
                    let startIndex = pageSize * (pageNo - 1);
                    let endIndex = startIndex + pageSize;
                    mergedData = mergedData.slice(startIndex,endIndex) 
                }

                let result = {
                    programName : programData[0].name,
                    programId : programId,
                    description : constants.common.TARGETED_SOLUTION_TEXT,
                    data : mergedData,
                    count : totalCount
                }

                return resolve({
                    message : constants.apiResponses.PROGRAM_SOLUTIONS_FETCHED,
                    success : true,
                    data : result
                })
            } catch (error) {
                return resolve({
                    success : false,
                    data : {
                        description : constants.common.TARGETED_SOLUTION_TEXT,
                        data : [],
                        count : 0
                    }
                })
            }
        })
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

   static programs(bodyData, pageNo, pageSize,searchText) {
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
                        message : constants.apiResponses.PROGRAM_NOT_FOUND
                    }
                }
                    
                targetedProgrms.data["description"] = constants.apiResponses.PROGRAM_DESCRIPTION;

                return resolve({
                    success: true,
                    message: constants.apiResponses.USER_TARGETED_PROGRAMS_FETCHED,
                    data : targetedProgrms.data
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data : {
                        description : constants.common.TARGETED_SOLUTION_TEXT,
                        data : [],
                        count : 0
                    }
                });
            }
        })
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

                let filterQuery = {
                    "registryDetails.code" : stateLocationId
                  };
          
                if( gen.utils.checkValidUUID( stateLocationId ) ) {
                    filterQuery = {
                      "registryDetails.locationId" : stateLocationId
                    };
                } 

                const entitiesData = await entitiesHelper.entityDocuments(filterQuery, ["_id"]);

                if (!entitiesData.length > 0) {
                    throw {
                        message: constants.apiResponses.ENTITIES_NOT_EXIST_IN_LOCATION
                    }
                }

                const rolesDocument = await userRolesHelper.roleDocuments({
                    code : role.toUpperCase()
                },["_id","entityTypes.entityType"]);

                if (!rolesDocument.length > 0) {
                    throw {
                        message: constants.apiResponses.USER_ROLES_NOT_FOUND
                    }
                }

                let entityTypes = [];
                let stateEntityExists = false;

                rolesDocument[0].entityTypes.forEach( roleDocument => {
                    if( roleDocument.entityType === constants.common.STATE_ENTITY_TYPE ) {
                        stateEntityExists = true;
                    }
                });

                if( stateEntityExists ) {
                    entityTypes = [constants.common.STATE_ENTITY_TYPE]
                } else {
                    
                    let entitiesMappingForm = 
                    await this.entitiesMappingForm(
                        entitiesData[0]._id,
                        rolesDocument[0]._id
                    );

                    entitiesMappingForm.result.forEach( entitiesMappingData => {
                        entityTypes.push(entitiesMappingData.field)
                    });
                }

                return resolve({
                    success : true,
                    message : constants.apiResponses.ENTITY_TYPES_FETCHED,
                    data : entityTypes
                });

            } catch (error) {
                return resolve({
                    success : false,
                    message : error.message
                });
            }
        })
    }

      /**
   * User Targeted entity.
   * @method
   * @name targetedEntity
   * @param {String} solutionId - solution id
   * @param {Object} requestedData - requested data
   * @returns {Object} - Details of the solution.
   */

   static targetedEntity( solutionId,requestedData ) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = 
        await solutionsHelper.solutionDocuments({ 
          _id : solutionId,
          isDeleted : false 
        },["entityType","type"]);

        if( !solutionData.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.SOLUTION_NOT_FOUND
          });
        }
          
        let rolesDocument = await userRolesHelper.roleDocuments({
            code : requestedData.role
        },["entityTypes.entityType"]);
        
        if( !rolesDocument.length > 0 ) {
            throw {
                status : httpStatusCode["bad_request"].status,
                message: constants.apiResponses.USER_ROLES_NOT_FOUND
            }
        }

        let requestedEntityTypes = Object.keys(_.omit(requestedData,["role"]));
        let targetedEntityType = "";

        rolesDocument[0].entityTypes.forEach(singleEntityType => {
            if( requestedEntityTypes.includes(singleEntityType.entityType) ) {
                targetedEntityType = singleEntityType.entityType;
            }
        });

        if( !requestedData[targetedEntityType] ) {
            throw {
                status : httpStatusCode["bad_request"].status,
                message: constants.apiResponses.ENTITIES_NOT_ALLOWED_IN_ROLE
            }
        }


        if( solutionData[0].entityType === targetedEntityType ) {

            let filterQuery = {
                "registryDetails.code" : requestedData[targetedEntityType]
              };
      
            if( gen.utils.checkValidUUID( requestedData[targetedEntityType] ) ) {
                filterQuery = {
                  "registryDetails.locationId" : requestedData[targetedEntityType]
                };
            } 
            
            let entities = await entitiesHelper.entityDocuments(filterQuery,["groups"]);

            if( !entities.length > 0 ) {
                throw {
                    message : constants.apiResponses.ENTITY_NOT_FOUND
                }
            }

            if( entities[0] && entities[0].groups && Object.keys(entities[0].groups).length > 0 ) {
                targetedEntityType = constants.common.STATE_ENTITY_TYPE;
            }
        }

        let filterData = {
            "registryDetails.code" : requestedData[targetedEntityType]
          };
  
        if( gen.utils.checkValidUUID( requestedData[targetedEntityType] ) ) {
            filterData = {
              "registryDetails.locationId" : requestedData[targetedEntityType]
            };
        } 

        let entities = await entitiesHelper.entityDocuments(filterData,["metaInformation.name","entityType"])

        if( !entities.length > 0 ) {
          throw {
            message : constants.apiResponses.ENTITY_NOT_FOUND
          }
        }

        if( entities[0].metaInformation && entities[0].metaInformation.name ) {
          entities[0]["entityName"] = entities[0].metaInformation.name;
          delete entities[0].metaInformation;
        }

        return resolve({
          message : constants.apiResponses.SOLUTION_TARGETED_ENTITY,
          success : true,
          data : entities[0]
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