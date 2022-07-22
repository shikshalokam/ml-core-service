/**
 * name : entities.js
 * author : Aman Jung Karki
 * created-date : 19-Dec-2019
 * Description : All entities related information.
 */


/**
 * dependencies
 */

const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper.js");

/**
    * Entities
    * @class
*/

module.exports = class Entities extends Abstract {

    constructor() {
        super(schemas["entities"]);
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
        return "entities";
    }

    /**
     * @api {get} /kendra/api/v1/entities/listByEntityType/:entityType 
     * List of entities based on its type
     * @apiVersion 1.0.0
     * @apiGroup Entities
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/entities/listByEntityType/state
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "List of entities fetched successfully",
     * "status": 200,
     * "result": [
     *  {
            "externalId": "AP",
            "name": "Andhra Pradesh",
            "_id": "5e26c2b0d007227fb039d993"
        },
        {
            "externalId": "WB",
            "name": "West Bengal",
            "_id": "5e26c2b0d007227fb039d9a8"
        },
        {
            "externalId": "DL",
            "name": "Delhi",
            "_id": "5db173598a8e070bedca6ba1"
        }
    ]
  }

    */

    /**
      * List of entities based on its type.
      * @method
      * @name listByEntityType
      * @param  {Request} req request body.
      * @param {String} req.params._id - entityType
      * @returns {JSON} Returns list of entities
     */

    listByEntityType(req) {
        
      return new Promise(async (resolve, reject) => {
    
          try {

            let entityDocuments = await entitiesHelper.listByEntityType(
              req.params._id,
              req.pageSize,
              req.pageNo
            );

            return resolve(entityDocuments);
    
          } catch (error) {
    
            return reject({
              status: error.status || httpStatusCode.internal_server_error.status,
              message: error.message || httpStatusCode.internal_server_error.message,
              errorObject: error
            })
    
          }
    
    
        })
    }


    /**
     * @api {post} /kendra/api/v1/entities/subEntityList/:entityId?type=:type&search=:search&page=:page&limit=:limit
     * Get sub entity list for the given entity. 
     * @apiVersion 1.0.0
     * @apiGroup Entities
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/entities/subEntityList/5db173598a8e070bedca6ba1?type=school&search=r&page=1&limit=1
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     "message": "List of entities fetched successfully",
     "status": 200,
     "result": {
        "data": [
            {
                "_id": "5db1dd3e8a8e070bedca6bef",
                "entityType": "school",
                "name": "Sachdeva Convent School, Street No.-5 Sangam Vihar (Wazirabad - Jagatpur Road), Delhi",
                "externalId": "1207229",
                "addressLine1": "Street No.-5 Sangam Vihar (Wazirabad - Jagatpur Road)",
                "label": "Sachdeva Convent School, Street No.-5 Sangam Vihar (Wazirabad - Jagatpur Road), Delhi",
                "value": "5db1dd3e8a8e070bedca6bef"
            }
        ],
        "count": 6005
    }
  }
  }

    /**
      * Get the immediate entities .
      * @method
      * @name subEntityList
      * @param  {Request} req request body.
      * @param {String} req.params._id - entityId
      * @returns {JSON} Returns list of immediate entities
     */

    subEntityList(req) {
      return new Promise(async (resolve, reject) => {
      
        if( !(req.params._id || req.body.entities) ) {
          return resolve({
            status :  httpStatusCode.bad_request.status,
            message : constants.apiResponses.ENTITY_ID_NOT_FOUND
          })
        }
    
        try {
          
          let entityDocuments = await entitiesHelper.subEntityList(
            req.body.entities ? req.body.entities : "",
            req.params._id ? req.params._id : "",
            req.query.type ? req.query.type : "",
            req.searchText,
            req.pageSize,
            req.pageNo
          );
          
          if(entityDocuments.result && entityDocuments.result.data && Array.isArray(entityDocuments.result.data) && entityDocuments.result.data.length > 0) {
            for (let pointerToEntitiesArray = 0; pointerToEntitiesArray < entityDocuments.result.data.length; pointerToEntitiesArray++) {
              if(entityDocuments.result.data[pointerToEntitiesArray].entityType == "school") {
                entityDocuments.result.data[pointerToEntitiesArray].label += " - " + entityDocuments.result.data[pointerToEntitiesArray].externalId;
              }
            }
          }

          return resolve(entityDocuments);
  
        } catch (error) {
  
          return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error
          })
  
        }
      })
    }

     /**
  * @api {get} /kendra/api/v1/entities/listByIds
  * List entities.
  * @apiVersion 1.0.0
  * @apiName List entities
  * @apiGroup Entities
  * @apiSampleRequest /kendra/api/v1/entities/listByIds
  * @param {json} Request-Body:
  * {
  * "entities" : ["5beaa888af0065f0e0a10515"],
    "fields" : ["entityType"]
    }
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message" : "List of entities fetched successfully",
    "status" : 200,
    "result" : [
        {
            "_id" : "5beaa888af0065f0e0a10515",
            "entityType": "school"
        }
    ]
  }
  */

    /**
   * List of entities.
   * @method
   * @name listByIds
   * @param {Object} req - requested data.
   * @param {String} req.params._id - requested entity type.         
   * @returns {JSON} - Array of entities.
   */

  listByIds(req) {
    return new Promise(async (resolve, reject) => {

      try {

        const entities = await entitiesHelper.listByEntityIds(req.body.entities,req.body.fields);
        return resolve(entities);

      } catch (error) {

        return reject({
          status : error.status || httpStatusCode.internal_server_error.status,
          message : error.message || httpStatusCode.internal_server_error.message,
          errorObject : error
        })

      }


    })
  }

    /**
  * @api {get} /kendra/api/v1/entities/getUsersByEntityAndRole/:entityId?role=""
  * @apiVersion 1.0.0
  * @apiName Get users by entityId and role.
  * @apiGroup Entities
  * @apiHeader {String} internal-access-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/entities/getUsersByEntityAndRole/5da829874c67d63cca1bd9d0?role=HM
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Users and entities fetched successfully",
    "status": 200,
    "result": [
        {
          "entityId": "5c5694be52600a1ce8d24d99",
          "entityExternalId" : "17869",
          "userId": "65ce67e1-40ae-40e8-8c02-961571cd3b46"
        }
      ]
  * }
  */

   /**
   * Get users by entityId and role.
   * @method
   * @name getUsersByEntityAndRole
   * @param {Object} req - request data.
   * @param {String} req.params.entityId - entity id.
   * @param {String} req.query.role - role code.
   * @returns {JSON} Array of entities and users.
   */

  getUsersByEntityAndRole(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let result = 
        await entitiesHelper.getUsersByEntityAndRole(
          req.params._id,
          req.query.role
        );

        return resolve({
          message: result.message,
          result: result.data
        });

      } catch (error) {

        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }


    /**
    * @api {get} /kendra/api/v1/entities/subEntityListBasedOnRoleAndLocation/:locationId?role=:role
    * Get list of sub entity based on role and location.
    * @apiVersion 1.0.0
    * @apiGroup Entities
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/entities/subEntityListBasedOnRoleAndLocation/236f5cff-c9af-4366-b0b6-253a1789766a?role=DEO,HM
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Entities child hierarchy path fetched successfully",
    "status": 200,
    "result": [
        "district",
        "block",
        "cluster",
        "school"
    ]
  }
    */

    /**
   * Entities child hierarchy path
   * @method
   * @name subEntitiesRoles
   * @param {String} req.params._id - entityId.         
   * @returns {JSON} - Entities child hierarchy path
   */

  subEntityListBasedOnRoleAndLocation(req) {
    return new Promise(async (resolve, reject) => {

      try {


        let currentMaximumCountOfRequiredEntities = 0;
        let subEntityTypeListData = new Array;
        // Calculate required entity type for each of the role and send the output of the role which has maximum length.
        for (let roleCount = 0; roleCount < req.query.role.split(",").length; roleCount++) {
            const eachRole = req.query.role.split(",")[roleCount];
            const entityTypeMappingData = 
            await entitiesHelper.subEntityListBasedOnRoleAndLocation(
              req.params._id,
              eachRole
            );
 
            if(entityTypeMappingData.result && entityTypeMappingData.result.length > currentMaximumCountOfRequiredEntities) {
                currentMaximumCountOfRequiredEntities = entityTypeMappingData.result.length;
                subEntityTypeListData = entityTypeMappingData;
                subEntityTypeListData.result = entityTypeMappingData.result;
            }
        }
       
        resolve(subEntityTypeListData);

      } catch (error) {

        return reject({
          status:
            error.status ||
            httpStatusCode["internal_server_error"].status,

          message:
            error.message ||
            httpStatusCode["internal_server_error"].message
        });
      }
    });
  }

  /**
     * @api {get} /kendra/api/v1/entities/details/:entityId
     * Get entities details information
     * @apiVersion 1.0.0
     * @apiGroup Entities
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/entities/details/5db173598a8e070bedca6ba1
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "Entity information fetched successfully",
     * "status": 200,
     * "result": {
        "_id": "5db173598a8e070bedca6ba1",
        "entityTypeId": "5d7a290e6371783ceb11064c",
        "entityType": "state",
        "metaInformation": {
            "externalId": "DL",
            "name": "Delhi",
            "region": "NORTH",
            "capital": "NEW DELHI"
        },
        "updatedBy": "2be2fd94-f25e-4402-8e36-20907b45c650",
        "createdBy": "2be2fd94-f25e-4402-8e36-20907b45c650",
        "updatedAt": "2019-10-24T10:16:44.833Z",
        "createdAt": "2019-10-24T09:48:09.005Z"
      }
    }
     /**
      * Entity details.
      * @method
      * @name details
      * @param {Object} req - requested entity information.
      * @param {String} req.params._id - entity id
      * @returns {JSON} - Entity details information.
    */

      details(req) {
      
        return new Promise(async (resolve, reject) => {
          
          try {
            
            let result = await entitiesHelper.details(
              req.params._id ? req.params._id :"",req.body ? req.body : {}
            );
            
            return resolve(result);
          
          } catch (error) {
            
            return reject({
              status: error.status || httpStatusCode.internal_server_error.status,
              message: error.message || httpStatusCode.internal_server_error.message,
              errorObject: error
            })
          }
        })
      }
  
};
