/**
 * name : user.js
 * author : Aman Jung Karki
 * created-date : 19-Dec-2019
 * Description : All user related information.
 */


/**
 * dependencies
 */

const usersHelper = require(MODULES_BASE_PATH + "/users/helper.js");

/**
    * User
    * @class
*/

module.exports = class Users extends Abstract {

    constructor() {
        super(schemas["users"]);
    }

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     *  @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */


    static get name() {
        return "users";
    }

    /**
     * @api {get} /kendra/api/v1/users/privatePrograms/:userId List of user private programs
     * @apiVersion 2.0.0
     * @apiName List of user private programs
     * @apiGroup Programs
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/privatePrograms/e97b5582-471c-4649-8401-3cc4249359bb
     * @apiParamExample {json} Response:
     * {
     "message": "List of private programs",
     "status": 200,
     "result": [
        {
            "_id": "5edf0d14c57dab7f639f3e0d",
            "externalId": "EF-DCPCR-2018-001-TEMPLATE-2020-06-09 09:46:20",
            "name": "My program",
            "description": "DCPCR Assessment Frramework 2018",
            "isAPrivateProgram" : false
        }
     ]}
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
    * Private Programs .
    * @method
    * @name privatePrograms
    * @param {Object} req -request Data.
    * @param {String} req.params._id - user id
    * @returns {JSON} - List of programs created by user.
    */

    privatePrograms(req) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let programsData = 
                await usersHelper.privatePrograms(
                    (req.params._id && req.params._id != "") ? 
                    req.params._id : 
                    req.userDetails.userId
                );
                
                return resolve(programsData);
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
     * @api {post} /kendra/api/v1/users/createProgram/:userId?programId=:programId Users created program and solution.
     * @apiVersion 2.0.0
     * @apiName Users created program and solution.
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/createProgram/e97b5582-471c-4649-8401-3cc4249359bb?programId=5f44b08cdbe917732246149f
     * @apiParamExample {json} Request-Body:
     * {
     * "programName" : "Test project program",
     * "solutionName" : "Test project solution"
     }
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
    "status": 200,
    "result": {
        "program": {
            "resourceType": [
                "Program"
            ],
            "language": [
                "English"
            ],
            "keywords": [
                "keywords 1",
                "keywords 2"
            ],
            "concepts": [],
            "components": [],
            "isAPrivateProgram": true,
            "_id": "5f44b08cdbe917732246149f",
            "deleted": false,
            "externalId": "Test project program-1598337164794",
            "name": "Test project program",
            "description": "Test project program",
            "status": "active",
            "imageCompression": {
                "quality": 10
            },
            "updatedAt": "2020-08-25T06:32:44.796Z",
            "createdAt": "2020-08-25T06:32:44.796Z",
            "__v": 0
        },
        "solution": {
            "resourceType": [],
            "language": [],
            "keywords": [],
            "concepts": [],
            "themes": [],
            "flattenedThemes": [],
            "entities": [],
            "registry": [],
            "isRubricDriven": false,
            "enableQuestionReadOut": false,
            "captureGpsLocationAtQuestionLevel": false,
            "isAPrivateProgram": false,
            "allowMultipleAssessemts": false,
            "isDeleted": false,
            "_id": "5f44b08cdbe91773224614a0",
            "deleted": false,
            "name": "Test project solution",
            "externalId": "Test project solution-1598337164794",
            "description": "Test project solution",
            "programId": "5f44b08cdbe917732246149f",
            "programExternalId": "Test project program-1598337164794",
            "programName": "Test project program",
            "programDescription": "Test project program",
            "updatedAt": "2020-08-25T06:32:44.801Z",
            "createdAt": "2020-08-25T06:32:44.801Z",
            "__v": 0
        }
    }}
     */

    /**
    * Create user program and solution.
    * @method
    * @name createProgramAndSolution
    * @param {Object} req -request Data.
    * @param {String} req.params._id - user id
    * @returns {JSON} - Created user program and solution.
    */

   createProgramAndSolution(req) {
    return new Promise(async (resolve, reject) => {

        try {

            let createdProgramAndSolution = 
            await usersHelper.createProgramAndSolution(
                (req.params._id && req.params._id != "") ? 
                req.params._id : 
                req.userDetails.userId,
                req.body,
                req.userDetails.userToken,
                req.query.createADuplicateSolution ? req.query.createADuplicateSolution : ""
            );

            return resolve(createdProgramAndSolution);

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
  * @api {post} /kendra/api/v1/users/solutions/:programId?page=:page&limit=:limit&search=:searchText
  * @apiVersion 1.0.0
  * @apiName User solutions
  * @apiGroup Users
  * @apiHeader {String} internal-access-token Internal access token
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/users/solutions/5ff438b04698083dbfab7284?page=1&limit=10
  * @apiParamExample {json} Request-Body:
  * {
        "role" : "HM,DEO",
   		"state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
    }
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Program solutions fetched successfully",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "5fc3dff14ea9b44f3340afe2",
                "type": "improvementProject",
                "externalId": "f449823a-06bb-4a3f-9d49-edbe1524ebbb-1606672337956",
                "projectTemplateId": "5ff4a46aa87a5c721f9eb664"
            },
            {
                "_id": "5ff482737f768d2de902e912",
                "externalId": "SCOPE_OBSERVATION_TEST",
                "name": "observation testing",
                "description": "Testing observation",
                "type": "observation"
            },
            {
                "_id": "5f7dc24543b6eb39bb0c6b95",
                "type": "survey",
                "name": "survey and feedback solution",
                "externalId": "d499f27c-08a0-11eb-b97f-4201ac1f0004-1602077253905",
                "description": "test survey and feedback solution"
            }
        ],
        "count": 3,
        "programName": "TEST_SCOPE_PROGRAM",
        "programId": "5ff438b04698083dbfab7284",
        "description": "View and participate in educational programs active in your location and designed for your role."
    }}
  **/

  /**
  * User targeted solutions.
  * @method
  * @name solutions
  * @param  {req}  - requested data.
  * @returns {json} List of targeted solutions.
  */

 solutions(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let targetedSolutions = await usersHelper.solutions(
            req.params._id,
            req.body,
            req.pageSize,
            req.pageNo,
            req.searchText,
            req.userDetails.userToken
        );

        targetedSolutions["result"] = targetedSolutions.data;
        return resolve(targetedSolutions);

      } catch (error) {

        return reject({
            status: 
            error.status || 
            httpStatusCode["internal_server_error"].status,

            message: 
            error.message || 
            httpStatusCode["internal_server_error"].message
        })

      }
    });
  }

/**
     * @api {post} /kendra/api/v1/users/programs?page=:page&limit=:limit&search=:search 
     * Program List
     * @apiVersion 1.0.0
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/programs?isAPrivateProgram=true&page=:page&limit=:limit&search=:search 
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
        "role" : "HM,DEO",
        "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
      }
      * @apiParamExample {json} Response:
      * {
      * "message": "Users programs fetched successfully",
        "status": 200,
        "result": {
            "data": [
                {
                    "_id": "5ff438b04698083dbfab7284",
                    "externalId": "TEST_SCOPE_PROGRAM",
                    "name": "TEST scope in program",
                    "solutions": 16
                }
            ],
            "count": 1,
            "description": "View and participate in educational programs active in your location and designed for your role"
        }
    }
    */

    /**
      * List of targeted user programs
      * @method
      * @name programs
      * @param  {Request} req request body.
      * @param {String} req.pageNo - pageNo
      * @param {String} req.pageSize - pageSize
      * @param {String} req.searchText - searchText
      * @param {String} req.query.isAPrivateProgram - isAPrivateProgram
      * @returns {Object} list of targeted user programs. 
     */

    programs(req) {
      return new Promise(async (resolve, reject) => {

        try {

          let isAPrivateProgram = gen.utils.convertStringToBoolean(req.query.isAPrivateProgram);

          if(isAPrivateProgram){

            let programsData = await usersHelper.privatePrograms(req.userDetails.userId);
            return resolve(programsData);

          } else {
            
            let programs = 
              await usersHelper.programs( 
                  req.body,
                  req.pageNo,
                  req.pageSize,
                  req.searchText
              );

              programs.result = programs.data;
              return resolve(programs);

          }
          
        } catch (error) {

            return reject({
                status: 
                error.status || 
                httpStatusCode["internal_server_error"].status,

                message: 
                error.message || 
                httpStatusCode["internal_server_error"].message
            })

        }

      })
    }

       /**
     * @api {get} /kendra/api/v1/users/entityTypesByLocationAndRole/:stateLocationId?role=:role
     * List of entity type by location and role.
     * @apiVersion 1.0.0
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/entityTypesByLocationAndRole/5ca3abc3-7a0b-4d36-a090-37509903c96d?role=DEO
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "Entity types fetched successfully",
     * "status": 200,
     * "result": [
        "district",
        "block",
        "cluster"
    ]}
    */

    /**
      * Lists of entity types based on location and role.
      * @method
      * @name entityTypesByLocationAndRole
      * @param  {Request} req request body.
      * @returns {JSON} List of entiites mapping form.
     */

    entityTypesByLocationAndRole(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let currentMaximumCountOfRequiredEntities = 0;
                let requiredEntities = new Array;

                // Calculate required entities for each of the role and send the output of the role which has maximum length.
                for (let roleCount = 0; roleCount < req.query.role.split(",").length; roleCount++) {
                    const eachRole = req.query.role.split(",")[roleCount];
                    const entitiesMappingData = 
                    await usersHelper.entityTypesByLocationAndRole(
                        req.params._id,
                        eachRole
                    );
                    if(entitiesMappingData.data && entitiesMappingData.data.length > currentMaximumCountOfRequiredEntities) {
                        currentMaximumCountOfRequiredEntities = entitiesMappingData.data.length;
                        requiredEntities = entitiesMappingData;
                        requiredEntities.result = entitiesMappingData.data;
                    }
                }

                // entitiesMappingData["result"] = requiredEntities;
                resolve(requiredEntities);

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                })

            }


        })
    }
    
     /**
    * @api {post} /kendra/api/v1/users/targetedEntity/:solutionId Targeted entity.
    * @apiVersion 1.0.0
    * @apiName Targeted entity.
    * @apiGroup Users
    * @apiParamExample {json} Request-Body:
    * {
        "state" : "bc75cc99-9205-463e-a722-5326857838f8",
        "district" : "b54a5c6d-98be-4313-af1c-33040b1703aa",
        "school" : "2a128c91-a5a2-4e25-aa21-3d9196ad8203",
        "role" : "DEO,HM"
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/users/targetedEntity/601d41607d4c835cf8b724ad
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Targeted entity fetched successfully",
    "status": 200,
    "result": {
        "_id": "5fd098e2e049735a86b748ad",
        "entityType": "district",
        "entityName": "VIZIANAGARAM"
    }}
    */

     /**
   * Targeted entity
   * @method
   * @name targetedEntity
   * @param {Object} req - requested data.
   * @param {Object} req.body - requested bidy data.
   * @returns {Array} Details entity.
   */

    async targetedEntity(req) {
        return new Promise(async (resolve, reject) => {
          try {

            let roleArray = req.body.role.split(",");
            let targetedEntities = {};

            if ( roleArray.length === 1 ) {

                const detailEntity = 
                await usersHelper.targetedEntity(
                    req.params._id,
                    req.body
                );

                detailEntity["result"] = detailEntity.data;
    
                return resolve(detailEntity);

            } else {

                let roleWiseTargetedEntities = new Array();

                for ( let roleCount = 0; roleCount < roleArray.length; roleCount++ ) {

                    const eachRole = roleArray[roleCount];
                    let bodyData = _.omit(req.body, ['role']);
                    bodyData.role = eachRole;
                    
                    const detailEntity = 
                    await usersHelper.targetedEntity(
                        req.params._id,
                        bodyData
                    );

                    if ( detailEntity.data && Object.keys(detailEntity.data).length > 0 ) {
                        roleWiseTargetedEntities.push(detailEntity.data);
                    }
                }

                //no targeted entity
                if ( roleWiseTargetedEntities.length  == 0 ) {
                    throw {
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.ENTITIES_NOT_ALLOWED_IN_ROLE
                    };
                } 
                //one targeted entity 
                else if ( roleWiseTargetedEntities && roleWiseTargetedEntities.length == 1 ) {
                    
                    targetedEntities.result = roleWiseTargetedEntities[0];

                } 
                // multiple targeted entity
                else if ( roleWiseTargetedEntities && roleWiseTargetedEntities.length > 1 ) {
                    
                    let targetedEntity = await usersHelper.getHighestTargetedEntity(
                        roleWiseTargetedEntities
                    );
           
                    if ( !targetedEntity.data ) {
                        throw {
                            status: httpStatusCode["bad_request"].status,
                            message: constants.apiResponses.ENTITIES_NOT_ALLOWED_IN_ROLE
                        };
                    }

                    targetedEntities.result = targetedEntity.data;
                }
            }

            return resolve(targetedEntities);
    
          } catch (error) {
            return reject({
              status: error.status || httpStatusCode.internal_server_error.status,
              message: error.message || httpStatusCode.internal_server_error.message,
              errorObject: error
            });
          }
        });
    }
};

