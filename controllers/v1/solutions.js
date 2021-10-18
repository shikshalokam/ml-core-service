/**
 * name : solutions.js
 * author : Aman
 * created-date : 03-Sep-2020
 * Description : Solution related information.
 */
// Dependencies
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
module.exports = class Solutions extends Abstract {
    
    constructor() {
        super(schemas["solutions"]);
    }

      /**
    * @api {post} /kendra/api/v1/solutions/create Create solution
    * @apiVersion 1.0.0
    * @apiName Create solution
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
    * "resourceType" : [],
    * "language" : [],
    * "keywords" : [],
    * "concepts" : [],
    "themes" : [],
    "flattenedThemes" : [],
    "entities" : [ 
        "5beaa888af0065f0e0a10515"
    ],
    "registry" : [],
    "isRubricDriven" : false,
    "enableQuestionReadOut" : false,
    "allowMultipleAssessemts" : false,
    "isDeleted" : false,
    "programExternalId" : "AMAN_TEST_123-1607937244986",
    "entityType" : "school",
    "type" : "improvementProject",
    "subType" : "improvementProject",
    "isReusable" : false,
    "externalId" : "01c04166-a65e-4e92-a87b-a9e4194e771d-1607936956167"
    }
    * @apiHeader {String} internal-access-token internal access token  
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/create
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Solution created successfully",
    "status": 200,
    "result": {
        "_id": "5ff447e127ef425953bd8306"
    }}
    */

     /**
   * Create solution.
   * @method
   * @name create
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @returns {JSON} Created solution data.
   */

  async create(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.createSolution(
          req.body
        );

        solutionData["result"] = solutionData.data;

        return resolve(solutionData);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

  /**
  * @api {post} /kendra/api/v1/solutions/update/:solutionId Update Solution
  * @apiVersion 1.0.0
  * @apiName Update Solution
  * @apiGroup Solutions
  * @apiSampleRequest /kendra/api/v1/solutions/update/6006b5cca1a95727dbcdf648
  * @apiHeader {String} internal-access-token internal access token 
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
  *  "status": 200,
    "message": "Solution updated successfully"
  }
  */

   /**
   * Update solution.
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @param {String} req.params._id -  solution external id.
   * @returns {JSON}
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.update(
          req.params._id, 
          req.body, 
          req.userDetails.id
        );

        return resolve(solutionData);
      }
      catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  } 

   /**
  * @api {post} /kendra/api/v1/solutions/list?type=:type&subType=:subType&page=:page&limit=:limit&search=:search List Solutions
  * @apiVersion 1.0.0
  * @apiName List solutions
  * @apiGroup Solutions
  * @apiParamExample {json} Request-Body:
  * {
      "isReusable" : false
    }
  * @apiSampleRequest /kendra/api/v1/solutions/list?type=improvementProject&page=1&limit=5
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Solutions lists fetched successfully",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "5d15b0d7463d3a6961f91748",
                "externalId": "LSAS-Dream A Dream-2019-TEMPLATE",
                "name": "Life Skills Assessment Survey",
                "description": "Life Skills Assessment Survey"
            }
        ],
        "count": 71
    }}
  */

   /**
   * List solutions.
   * @method
   * @name list
   * @param {Object} req - requested data.
   * @param {String} req.query.type - solution type.
   * @returns {JSON}
   */

  async list(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.list(
          req.query.type,
          req.query.subType ? req.query.subType : "",
          req.body,
          req.pageNo,
          req.pageSize,
          req.searchText
        );

        solutionData["result"] = solutionData.data;

        return resolve(solutionData);
      }
      catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }
  
  /**
    * @api {post} /kendra/api/v1/solutions/forUserRoleAndLocation?programId=:programId&type=:type&subType=:subType&page=:page&limit=:limit Auto targeted solutions
    * @apiVersion 1.0.0
    * @apiName Auto targeted solution
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
        "role" : "HM",
   		  "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824",
        "filter" : {}
      }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/forUserRoleAndLocation?type=assessment&page=1&limit=5
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully targeted solutions fetched",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "5ff447e127ef425953bd8306",
                "programId": "5ff438b04698083dbfab7284",
                "programName": "TEST scope in program"
            }
        ],
        "count": 1
    }
    }
    */

     /**
   * Auto targeted solution.
   * @method
   * @name forUserRoleAndLocation
   * @param {Object} req - requested data.
   * @returns {JSON} Created solution data.
   */

  async forUserRoleAndLocation(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let targetedSolutions = await solutionsHelper.forUserRoleAndLocation(
          req.body,
          req.query.type ? req.query.type : "",
          req.query.subType ? req.query.subType : "",
          req.query.programId ? req.query.programId : "",
          req.pageSize,
          req.pageNo,
          req.searchText
        );
          
        targetedSolutions["result"] = targetedSolutions.data;
        return resolve(targetedSolutions);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

  /**
    * @api {post} /kendra/api/v1/solutions/detailsBasedOnRoleAndLocation/:solutionId Solution details based on role and location.
    * @apiVersion 1.0.0
    * @apiName Targeted solution details
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
        "role" : "HM",
   		  "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
      }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/detailsBasedOnRoleAndLocation/5fc3dff14ea9b44f3340afe2
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully targeted solutions fetched",
    "status": 200,
    "result": {
        "_id": "5fc3dff14ea9b44f3340afe2",
        "isAPrivateProgram": true,
        "programId": "5ff438b04698083dbfab7284",
        "programExternalId": "TEST_SCOPE_PROGRAM",
        "programName": "TEST_SCOPE_PROGRAM",
        "programDescription": "TEST_SCOPE_PROGRAM",
        "entityType": "school",
        "entityTypeId": "5d15a959e9185967a6d5e8a6",
        "externalId": "f449823a-06bb-4a3f-9d49-edbe1524ebbb-1606672337956",
        "projectTemplateId": "5ff4a46aa87a5c721f9eb664"
    }}
    */

     /**
   * Solution details based on role and location.
   * @method
   * @name detailsBasedOnRoleAndLocation
   * @param {Object} req - requested data.
   * @returns {JSON} Created solution data.
   */

  async detailsBasedOnRoleAndLocation(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionDetails = 
        await solutionsHelper.detailsBasedOnRoleAndLocation(
          req.params._id,
          req.body
        );
          
        solutionDetails.result = solutionDetails.data;
        return resolve(solutionDetails);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

      /**
    * @api {post} /kendra/api/v1/solutions/addRolesInScope/:solutionId Add roles in solutions
    * @apiVersion 1.0.0
    * @apiName Add roles in solutions
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["DEO","SPD"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/addRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added roles in solutions scope",
        "status": 200
      }
    */

     /**
   * Add roles in solution scope
   * @method
   * @name addRolesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @param {Array} req.body.roles - Roles to be added.
   * @returns {Array} solution scope roles.
   */

  async addRolesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionUpdated = await solutionsHelper.addRolesInScope(
          req.params._id,
          req.body.roles
        );
    
        return resolve(solutionUpdated);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

  /**
    * @api {post} /kendra/api/v1/solutions/addEntitiesInScope/:solutionId Add entities in solutions
    * @apiVersion 1.0.0
    * @apiName Add entities in solutions
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
      "entities" : ["5f33c3d85f637784791cd830"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/addEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added entities in solution scope",
        "status": 200
      }
    */

     /**
   * Add entities in solution scope
   * @method
   * @name addEntitiesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @param {Array} req.body.entities - Entities to be added.
   * @returns {Array} Solution scope entities updation.
   */

  async addEntitiesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionUpdated = await solutionsHelper.addEntitiesInScope(
          req.params._id,
          req.body.entities
        );
    
        return resolve(solutionUpdated);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

       /**
    * @api {post} /kendra/api/v1/solutions/removeRolesInScope/:solutionId Remove roles from solutions scope
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["DEO","SPD"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/removeRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed roles in solution scope",
        "status": 200
      }
    */

     /**
   * Remove roles in solution scope
   * @method
   * @name removeRolesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @param {Array} req.body.roles - Roles to be added.
   * @returns {Array} Removed solution scope roles.
   */

  async removeRolesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionUpdated = await solutionsHelper.removeRolesInScope(
          req.params._id,
          req.body.roles
        );
    
        return resolve(solutionUpdated);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

    /**
    * @api {post} /kendra/api/v1/solutions/removeEntitiesInScope/:solutionId Remove entities from solution scope.
    * @apiVersion 1.0.0
    * @apiName Remove entities from solution scope.
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
      "entities" : ["5f33c3d85f637784791cd830"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/removeEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed entities in solution scope",
        "status": 200
      }
    */

     /**
   * Remove entities in slution scope
   * @method
   * @name removeEntitiesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @param {Array} req.body.entities - Entities to be added.
   * @returns {Array} Program scope roles.
   */

  async removeEntitiesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionUpdated = await solutionsHelper.removeEntitiesInScope(
          req.params._id,
          req.body.entities
        );
    
        return resolve(solutionUpdated);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

      /**
    * @api {get} /kendra/api/v1/solutions/getDetails/:solutionId Solution details
    * @apiVersion 1.0.0
    * @apiName Details of the solution.
    * @apiGroup Solutions
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/getDetails/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Solution details fetched successfully",
    "status": 200,
    "result": {
        "_id": "601bc17489149727d7d70bbd",
        "resourceType": [
            "Observations Framework"
        ],
        "language": [
            "English"
        ],
        "keywords": [
            "Framework",
            "Observation",
            "Challenges",
            " Enrollment",
            " Parents",
            " Courses "
        ],
        "concepts": [],
        "themes": [
            {
                "type": "theme",
                "label": "theme",
                "name": "Observation Theme",
                "externalId": "OB",
                "weightage": 100,
                "criteria": [
                    {
                        "criteriaId": "601bc17489149727d7d70bbb",
                        "weightage": 50
                    },
                    {
                        "criteriaId": "601bc17489149727d7d70bbc",
                        "weightage": 50
                    }
                ]
            }
        ],
        "flattenedThemes": [],
        "entities": [],
        "registry": [],
        "isRubricDriven": false,
        "enableQuestionReadOut": false,
        "captureGpsLocationAtQuestionLevel": false,
        "isAPrivateProgram": false,
        "allowMultipleAssessemts": false,
        "isDeleted": false,
        "deleted": false,
        "externalId": "99199aec-66b8-11eb-b81d-a08cfd79f8b7-OBSERVATION-TEMPLATE",
        "name": "Enrollment challenges in DIKSHA Courses",
        "description": "Survey Form to understand the challenges that the parents are facing in getting their children enrolled in DIKSHA courses ",
        "author": "",
        "levelToScoreMapping": {
            "L1": {
                "points": 100,
                "label": "Good"
            }
        },
        "scoringSystem": null,
        "noOfRatingLevels": 1,
        "entityTypeId": "5f32d8228e0dc83124040567",
        "entityType": "school",
        "updatedBy": "INITIALIZE",
        "createdAt": "2021-02-04T07:14:19.353Z",
        "updatedAt": "2021-02-04T09:42:12.853Z",
        "__v": 0,
        "type": "observation",
        "subType": "school",
        "frameworkId": "601bbed689149727d7d70bba",
        "frameworkExternalId": "99199aec-66b8-11eb-b81d-a08cfd79f8b7",
        "isReusable": true,
        "evidenceMethods": {
            "OB": {
                "externalId": "OB",
                "tip": "",
                "name": "Observation",
                "description": "",
                "modeOfCollection": "onfield",
                "canBeNotApplicable": 0,
                "notApplicable": 0,
                "canBeNotAllowed": 0,
                "remarks": ""
            }
        },
        "sections": {
            "S1": "Start Survey"
        }
    }}
    */

     /**
   * Details of the solution.
   * @method
   * @name getDetails
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @returns {Object} Solution details 
   */

  async getDetails(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.getDetails(
          req.params._id
        );

        solutionData["result"] = solutionData.data;
    
        return resolve(solutionData);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

    /**
    * @api {post} /kendra/api/v1/solutions/targetedSolutions?type=:solutionType&page=:page&limit=:limit&search=:search&filter=:filter
    * List of assigned solutions and targetted ones.
    * @apiVersion 1.0.0
    * @apiGroup Solutions
    * @apiSampleRequest /kendra/api/v1/solutions/targetedSolutions?type=observation&page=1&limit=10&search=a&filter=assignedToMe
    * @apiParamExample {json} Request:
    * {
    *   "role" : "HM",
   		  "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
    }
    * @apiParamExample {json} Response:
    {
    "message": "Solutions fetched successfully",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "5f9288fd5e25636ce6dcad66",
                "name": "obs1",
                "description": "observation1",
                "solutionId": "5f9288fd5e25636ce6dcad65",
                "programId": "5d287326652f311044f41dbb"
            },
            {
                "_id": "5fc7aa9e73434430731f6a10",
                "solutionId": "5fb4fce4c7439a3412ff013b",
                "programId": "5f5b216a9c70bd2973aee29f",
                "name": "My Solution",
                "description": "My Solution Description"
            }
        ],
        "count": 2
    }}
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * List of solutions and targetted ones.
      * @method
      * @name targetedSolutions
      * @param {Object} req - request data.
      * @returns {JSON} List of solutions with targetted ones.
     */

  async targetedSolutions(req) {
      return new Promise(async (resolve, reject) => {
          try {

              let observations = await solutionsHelper.targetedSolutions(
                  req.body,
                  req.query.type,
                  req.userDetails.userToken,
                  req.pageSize,
                  req.pageNo,
                  req.searchText,
                  req.query.filter,
                  req.query.surveyReportPage ? req.query.surveyReportPage : ""
              );

              observations["result"] = observations.data;

              return resolve(observations);

          } catch (error) {
              return reject({
                  status: error.status || httpStatusCode.internal_server_error.status,
                  message: error.message || httpStatusCode.internal_server_error.message,
                  errorObject: error
              });
          }
      })
  }

   /**
  * @api {get} /kendra/api/v1/solutions/fetchLink/:solutionId
  * @apiVersion 1.0.0
  * @apiName Get link by solution id
  * @apiGroup Solutions
  * @apiSampleRequest /kendra/api/v1/solutions/fetchLink/5fa28620b6bd9b757dc4e932
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Solution Link generated successfully",
    "status": 200,
    "result": "https://dev.sunbirded.org/manage-learn/create-observation/38cd93bdb87489c3890fe0ab00e7d406"
    }
  */

   /**
   * Get link by solution id.
   * @method
   * @name fetchLink
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution Id
   * @returns {Array}
   */

  async fetchLink(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.fetchLink(
          req.params._id,
          req.userDetails.userId
        );

        return resolve(solutionData);

      }
      catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }

   /**
  * @api {post} /kendra/api/v1/solutions/verifyLink/:link
  * @apiVersion 1.0.0
  * @apiName verify Link
  * @apiGroup Solutions
  * @apiSampleRequest /kendra/api/v1/solutions/verifyLink/6f8d395f674dcb3146ade10f972da9d0
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Request:
  * {
  *   "role" : "HM",
      "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
      "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
      "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
    }
  * @apiParamExample {json} Response:
  * {
      "message": "Solution Link verified successfully",
      "status": 200,
      "result": {
          isATargetedSolution : true/false,
          type: improvementProject,
          solutionId : “5f6853f293734140ccce90cf”,
          projectId : “”,
          obervationId: “”,
          surveyId: “”
      }
    }
  */

   /**
   * verify Link
   * @method
   * @name verifyLink
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution Id
   * @returns {Array}
   */

  async verifyLink(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.verifyLink(
          req.params._id,
          req.body,
          req.userDetails.userId,
          req.userDetails.userToken
        );

        return resolve(solutionData);

      }
      catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }

  /**
  * @api {post} /kendra/api/v1/solutions/details/:solutionId
  * @apiVersion 1.0.0
  * @apiName Get Project Template or Solution Questions
  * @apiGroup Solutions
  * @apiSampleRequest /kendra/api/v1/solutions/details/5ff9d50f9259097d48017bbb
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Request:
  * {
  *   "role" : "HM",
      "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
      "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
      "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
    }
  * @apiParamExample {json} Response:
  * {
    "message": "Successfully fetched details",
    "status": 200,
    "result": {
        "_id": "5f97d2f6bf3a3b1c0116c80a",
        "status": "published",
        "isDeleted": false,
        "categories": [
            {
                "_id": "5f102331665bee6a740714e8",
                "name": "Teachers",
                "externalId": "teachers"
            },
            {
                "name": "newCategory",
                "externalId": "",
                "_id": ""
            }
        ],
        "tasks": [
            {
                "_id": "289d9558-b98f-41cf-81d3-92486f114a49",
                "name": "Task 1",
                "description": "Task 1 description",
                "status": "notStarted",
                "isACustomTask": false,
                "startDate": "2020-09-29T09:08:41.667Z",
                "endDate": "2020-09-29T09:08:41.667Z",
                "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                "type": "single",
                "isDeleted": false,
                "attachments": [
                    {
                        "name": "download(2).jpeg",
                        "type": "image/jpeg",
                        "sourcePath": "projectId/userId/imageName"
                    }
                ],
                "remarks": "Tasks completed",
                "assignee": "Aman",
                "children": [
                    {
                        "_id": "289d9558-b98f-41cf-81d3-92486f114a50",
                        "name": "Task 2",
                        "description": "Task 2 description",
                        "status": "notStarted",
                        "children": [],
                        "isACustomTask": false,
                        "startDate": "2020-09-29T09:08:41.667Z",
                        "endDate": "2020-09-29T09:08:41.667Z",
                        "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                        "type": "single",
                        "isDeleted": false,
                        "externalId": "task 2",
                        "isDeleteable": false,
                        "createdAt": "2020-10-28T05:58:24.907Z",
                        "updatedAt": "2020-10-28T05:58:24.907Z",
                        "isImportedFromLibrary": false
                    }
                ],
                "externalId": "task 1",
                "isDeleteable": false,
                "createdAt": "2020-10-28T05:58:24.907Z",
                "updatedAt": "2020-10-28T05:58:24.907Z",
                "isImportedFromLibrary": false
            }
        ],
        "resources": [],
        "deleted": false,
        "__v": 0,
        "description": "Project 1 description"
    }
}
  */

   /**
   * get solution details
   * @method
   * @name details
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution Id
   * @returns {Array}
   */

  async details(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.details(
          req.params._id,
          req.body,
          req.userDetails.userId,
          req.userDetails.userToken
        );

        return resolve(solutionData);

      }
      catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }

}