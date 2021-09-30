/**
 * name : programs.js
 * author : Aman
 * created-date : 03-Sep-2020
 * Description : Solution related information.
 */

// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");

module.exports = class Programs extends Abstract {
    
    constructor() {
        super(schemas["programs"]);
    }

    /**
   * @api {post} /kendra/api/v1/programs/list?page=:page&limit=:limit&search=:search
   * programs lists.
   * @apiVersion 0.0.1
   * @apiName programs lists.
   * @apiGroup Programs
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /kendra/api/v1/programs/list?page=1&limit=5&search=Apple
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
    "message": "Program lists fetched successfully",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "5beaaaa6af0065f0e0a10605",
                "externalId": "APPLE-ASSESSMENT-PROGRAM",
                "description": "Apple Program 2018",
                "isAPrivateProgram": false
            }
        ],
        "count": 1
    }
  }
   */

  /**
   * List programs.
   * @method
   * @name list
   * @param {Object} req - Requested data.
   * @param {Array} req.query.page - Page number.
   * @param {Array} req.query.limit - Page Limit.
   * @param {Array} req.query.search - Search text.
   * @returns {JSON} List programs data.
  */

 async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
  
        let listOfPrograms = await programsHelper.list(
          req.pageNo,
          req.pageSize,
          req.searchText
        );

        listOfPrograms["result"] = listOfPrograms.data;
  
        return resolve(listOfPrograms);
  
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
  * @api {post} /kendra/api/v1/programs/create Create Program
  * @apiVersion 1.0.0
  * @apiName create
  * @apiGroup Programs
  * @apiSampleRequest /kendra/api/v1/programs/create
  * @apiHeader {String} internal-access-token internal access token  
  * @apiHeader {String} X-authenticated-user-token Authenticity token 
  * @apiParamExample {json} Request-Body:
  * {
      "externalId" : "PROGID01",
      "name" : "DCPCR School Development Index 2018-19",
      "description" : "DCPCR School Development Index 2018-19",
      "isDeleted" : false,
      "resourceType" : [ 
          "program"
      ],
      "language" : [ 
          "English"
      ],
      "keywords" : [],
      "concepts" : [],
      "createdFor" : [ 
          "0126427034137395203", 
          "0124487522476933120"
      ],
      "userId":"a082787f-8f8f-42f2-a706-35457ca6f1fd",
      "imageCompression" : {
          "quality" : 10
      },
      "components" : [ 
          "5b98fa069f664f7e1ae7498c"
      ],
      "scope" : {
          "entityType" : "state",
          "entities" : ["5d6609ef81a57a6173a79e78"],
          "roles" : ["HM"]
      }
    }
  * @apiParamExample {json} Response:
   {
    "message": "Program created successfully",
    "status": 200,
    "result": {
        "_id": "5ff09aa4a43c952a32279234"
    }
   } 
  * @apiUse successBody
  * @apiUse errorBody
  */

   /**
   * Create program.
   * @method
   * @name create
   * @param {Object} req - requested data.
   * @returns {JSON} - created program document.
   */

  async create(req) {
    return new Promise(async (resolve, reject) => {
      try {

        req.body.userId = req.userDetails.userId;
        let programCreationData = await programsHelper.create(
          req.body
        );
        
        return resolve({
          message : constants.apiResponses.PROGRAMS_CREATED,
          result : _.pick(programCreationData,["_id"])
        });

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
  * @api {post} /kendra/api/v1/programs/update/:programId Update Program
  * @apiVersion 1.0.0
  * @apiName Update
  * @apiGroup Programs
  * @apiSampleRequest /kendra/api/v1/programs/update/5ff09aa4a43c952a32279234
  * @apiHeader {String} internal-access-token internal access token  
  * @apiHeader {String} X-authenticated-user-token Authenticity token 
  * @apiParamExample {json} Request-Body:
  * {
      "externalId" : "PROGID01",
      "name" : "DCPCR School Development Index 2018-19",
      "description" : "DCPCR School Development Index 2018-19",
      "isDeleted" : false,
      "resourceType" : [ 
          "program"
      ],
      "language" : [ 
          "English"
      ],
      "keywords" : [],
      "concepts" : [],
      "createdFor" : [ 
          "0126427034137395203", 
          "0124487522476933120"
      ],
      "userId":"a082787f-8f8f-42f2-a706-35457ca6f1fd",
      "imageCompression" : {
          "quality" : 10
      },
      "components" : [ 
          "5b98fa069f664f7e1ae7498c"
      ],
      "scope" : {
          "entityType" : "state",
          "entities" : ["5d6609ef81a57a6173a79e78"],
          "roles" : ["HM"]
      }
    }
  * @apiParamExample {json} Response:
  {
    "message": "Program updated successfully",
    "status": 200,
    "result": {
        "_id": "5ff09aa4a43c952a32279234"
    }
   } 
  * @apiUse successBody
  * @apiUse errorBody
  */

   /**
   * Update program.
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @param {Object} 
   * @returns {JSON} - 
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let programUpdationData = await programsHelper.update(
          req.params._id,
          req.body,
          req.userDetails.userId
        );
        
        programUpdationData.result = programUpdationData.data;
        return resolve(programUpdationData);

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
    * @api {post} /assessment/api/v1/programs/addRolesInScope/:programId Add roles in programs
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["DEO","SPD"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /assessment/api/v1/programs/addRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added roles in program scope",
        "status": 200
      }
    */

     /**
   * Add roles in program scope
   * @method
   * @name addRolesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - program id.
   * @param {Array} req.body.roles - Roles to be added.
   * @returns {Array} Program scope roles.
   */

  async addRolesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let programUpdated = await programsHelper.addRolesInScope(
          req.params._id,
          req.body.roles
        );
    
        return resolve(programUpdated);

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
    * @api {post} /assessment/api/v1/programs/addEntitiesInScope/:programId Add roles in programs
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
      "entities" : ["5f33c3d85f637784791cd830"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /assessment/api/v1/programs/addEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added entities in program scope",
        "status": 200
      }
    */

     /**
   * Add entities in program scope
   * @method
   * @name addEntitiesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - program id.
   * @param {Array} req.body.entities - Entities to be added.
   * @returns {Array} Program scope roles.
   */

  async addEntitiesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let programUpdated = await programsHelper.addEntitiesInScope(
          req.params._id,
          req.body.entities
        );
    
        return resolve(programUpdated);

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
    * @api {post} /assessment/api/v1/programs/removeRolesInScope/:programId Add roles in programs
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["DEO","SPD"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /assessment/api/v1/programs/removeRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed roles in program scope",
        "status": 200
      }
    */

     /**
   * Remove roles in program scope
   * @method
   * @name removeRolesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - program id.
   * @param {Array} req.body.roles - Roles to be added.
   * @returns {Array} Program scope roles.
   */

  async removeRolesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let programUpdated = await programsHelper.removeRolesInScope(
          req.params._id,
          req.body.roles
        );
    
        return resolve(programUpdated);

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
    * @api {post} /assessment/api/v1/programs/removeEntitiesInScope/:programId Add roles in programs
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
      "entities" : ["5f33c3d85f637784791cd830"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /assessment/api/v1/programs/removeEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed entities in program scope",
        "status": 200
      }
    */

     /**
   * Remove entities in program scope
   * @method
   * @name removeEntitiesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - program id.
   * @param {Array} req.body.entities - Entities to be added.
   * @returns {Array} Program scope roles.
   */

  async removeEntitiesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let programUpdated = await programsHelper.removeEntitiesInScope(
          req.params._id,
          req.body.entities
        );
    
        return resolve(programUpdated);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

}