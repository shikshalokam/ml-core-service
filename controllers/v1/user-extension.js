/**
 * name : user-extensions.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All user extension related information.
 */

// Dependencies
const userExtensionHelper = require(ROOT_PATH+"/module/user-extension/helper");

/**
    * UserExtension
    * @class
*/
module.exports = class UserExtension extends Abstract {
  
  constructor() {
    super(schemas["user-extension"]);
  }

  static get name() {
    return "user-extension";
  }

  /**
  * @api {post} /kendra/api/v1/user-extension/getProfile/{{userId}} Get user profile
  * @apiVersion 1.0.0
  * @apiName Get user profile
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/getProfile/e97b5582-471c-4649-8401-3cc4249359bb
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
  *  "_id": "5d5e4758f89df53a1d26b454",
     "externalId": "a1",
     "roles": [
        {
         "_id": "5d5e47051f5a363a0a187029",
         "code": "HM",
         "title": "Headmaster",
         "immediateSubEntityType": "school",
         "entities": [
          {
            "_id": "5bfe53ea1d0c350d61b78d0f",
            "externalId": "1208138",
            "name": "Shri Shiv Middle School, Shiv Kutti, Teliwara, Delhi",
            "childrenCount": 0,
             "entityType": "school",
             "entityTypeId": "5ce23d633c330302e720e65f",
             "subEntityGroups": [
              "parent"
              ]
            }
          ]
       }
     ]
  * }
  */

  /**
   * Get profile of user.
   * @method
   * @name getProfile
   * @param {Object} req - request data.
   * @param {String} req.params._id - user id.
   * @returns {JSON} User profile data. 
   */

  getProfile(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let result = await userExtensionHelper.profileWithEntityDetails({
          userId: (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
          status: constants.common.ACTIVE,
          isDeleted: false
        },req.headers.appname);

        return resolve({
          message: constants.apiResponses.USER_EXTENSION_FETCHED,
          result: result
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
  * @api {post} /kendra/api/v1/user-extension/update/{{userId}} Update user profile
  * @apiVersion 1.0.0
  * @apiName Update user profile
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/update/e97b5582-471c-4649-8401-3cc4249359bb
  * @apiParamExample {json} Request-Body:
   * {
      "roles" : [ 
        {
            "roleId" : ObjectId("5d9f31ae84c47946a1f7d35e"),
            "code" : "CRP"
        }],
      "externalId" : "a1@shikshalokam",
      "status" : "active"

    }
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
  * "message": "User profile fetched successfully.",
  * "status": 200,
  *  "result": {
        "roles": [],
        "status": "active",
        "isDeleted": false,
        "devices": [
            {
                "deviceId": "eZPYAJ_thEA:APA91bHniRt_Tfax3KIi0yCqykT-w50-KFyhjgBE9derqXRcFuyu2boa8EVcYn1Yt2lan1eoSNlp2hA5h_oRT7W8YAyYKoQAiT6IuYZ9shJKhDNLnCUR2x1cebrJ3JoMwdIoO5H2Oo7T",
                "os": "android, android",
                "app": "diksha survey",
                "appType": "assessment",
                "status": "active",
                "activatedAt": "2020-08-12T10:27:10.888Z"
            },
            {
                "deviceId": "eZPYAJ_thEA:APA91bHniRt_Tfax3KIi0yCqykT-w50-KFyhjgBE9derqXRcFuyu2boa8EVcYn1Yt2lan1eoSNlp2hA5h_oRT7W8YAyYKoQAiT6IuYZ9shJKhDNLnCUR2x1cebrJ3JoMwdIoO5H2Oo7Te",
                "os": "android, android",
                "app": "diksha survey",
                "appType": "assessment",
                "status": "active",
                "activatedAt": "2020-08-12T10:28:38.706Z"
            },
            {
                "deviceId": "abc",
                "os": "android",
                "app": "diksha-survey",
                "appType": "assessment",
                "status": "active",
                "activatedAt": "2020-08-15T07:51:53.303Z"
            }
        ],
        "userProfileScreenVisitedTrack": null,
        "deleted": false,
        "_id": "5f33c3fe39a2e7766b1bef9f",
        "userId": "01c04166-a65e-4e92-a87b-a9e4194e771d",
        "externalId": "a1",
        "createdBy": "SYSTEM",
        "updatedBy": "SYSTEM",
        "updatedAt": "2020-09-07T13:24:32.170Z",
        "createdAt": "2020-08-12T10:27:10.895Z",
        "improvementProjects": [
            {
                "_id": "5f4ce55eb3b81754f08d3528",
                "name": "Test-2",
                "description": "improving school library",
                "externalId": "Test-2",
                "entityType": "school",
                "entityTypeId": "5d15a959e9185967a6d5e8a6",
                "rating": 4
            }
        ],
        "__v": 0
    }
  * }
  */

  /**
   * Update user profile.
   * @method
   * @name update
   * @param {Object} req - request data.
   * @param {String} req.params._id - user id.
   * @returns {JSON} Updated User profile data. 
   */

  update(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let result = await userExtensionHelper.update(
          (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
          req.body
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

  /**
  * @api {post} /kendra/api/v1/user-extension/updateProfileRoles/{{userId}} Update profile roles.
  * @apiVersion 1.0.0
  * @apiName Update profile roles.
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/updateProfileRoles/8f6d6fd2-c069-41f1-b94d-ad2befcc964b
  * @apiParamExample {json} Request-body:
  * {
    "stateId" : "5da829874c67d63cca1bd9d0",
    "roles" : [{
        "_id" : "5d7a2d266371783ceb11064e",
        "entities" : [
            "5da70ff64c67d63cca1b94e0"
        ]
      }
    ]
  }
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "User extension updated successfully",
    "status": 200,
    "result": {
        "_id": "5f587db299333547476e8f80",
        "externalId": "a1",
        "state": {
            "_id": "5da829874c67d63cca1bd9d0",
            "name": "Punjab"
        },
        "roles": [
            {
                "_id": "5d7a2d266371783ceb11064e",
                "code": "SPD",
                "title": "State Project Director",
                "immediateSubEntityType": "school",
                "entities": [
                    {
                        "_id": "5da70ff64c67d63cca1b94e0",
                        "externalId": "3200100201",
                        "name": "PUNJAB GPS ASPAL KHURD",
                        "childrenCount": 0,
                        "entityType": "school",
                        "entityTypeId": "5d15a959e9185967a6d5e8a6",
                        "subEntityGroups": [],
                        "relatedEntities": [
                            {
                                "_id": "5da829874c67d63cca1bd9d0",
                                "entityTypeId": "5d7a290e6371783ceb11064c",
                                "entityType": "state",
                                "metaInformation": {
                                    "externalId": "PBS",
                                    "name": "Punjab"
                                }
                            },
                            {
                                "_id": "5da829a94c67d63cca1bd9d2",
                                "entityTypeId": "5d15a959e9185967a6d5e8ac",
                                "entityType": "district",
                                "metaInformation": {
                                    "externalId": "BARNALA -3",
                                    "name": "BARNALA"
                                }
                            },
                            {
                                "_id": "5da829f64c67d63cca1bd9f1",
                                "entityTypeId": "5d15a959e9185967a6d5e8ab",
                                "entityType": "block",
                                "metaInformation": {
                                    "externalId": "PJ-BARNALA",
                                    "name": "BARNALA"
                                }
                            },
                            {
                                "_id": "5da82a1c4c67d63cca1bdae8",
                                "entityTypeId": "5d15c4ec03cbf959ccabdd2b",
                                "entityType": "cluster",
                                "metaInformation": {
                                    "externalId": "PJ-GPS KALEKE",
                                    "name": "GPS KALEKE",
                                    "city": ""
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
  */

  /**
   * Update profile roles.
   * @method
   * @name updateProfileRoles
   * @param {Object} req - request data.
   * @param {String} req.params._id - user id.
   * @returns {JSON} Update profile roles.
   */

  updateProfileRoles(req) {
    return new Promise(async (resolve, reject) => {

      try {

        const userExtensionData = 
        await userExtensionHelper.updateProfileRoles(
          req.body,
          req.params._id ? req.params._id : req.userDetails.userId,
          req.userDetails.userName
        );

        return resolve(userExtensionData);

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
  * @api {get} /kendra/api/v1/user-extension/getEntities?entityType=school&page=1&limi=10&search=govt Get user entities.
  * @apiVersion 1.0.0
  * @apiName Get user entities.
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/getEntities/?entityType=school&page=1&limi=10&search=govt
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  {
    "message": "User entities fetched successfully.",
    "status": 200,
    "result": {
     "data": [
        {
            "_id": "5beaa888af0065f0e0a10515",
            "name": "Apple School"
        },
        {
            "_id": "5bfe53ea1d0c350d61b78d0a",
            "name": "Sachdeva Convent School, Street No.-5 Sangam Vihar (Wazirabad - Jagatpur Road), Delhi"
        },
        {
            "_id": "5bfe53ea1d0c350d61b78d0c",
            "name": "Divyansh Public School, Kh.No.28/20 & 29/16/02 Sangam Vihar, Burari, Delhi"
        },
        {
            "_id": "5de6322c187dca40bbbd0aef",
            "name": "gsspachelkalan"
        }
    ],
    "count":4
}
**/
 
    /**
   * Get user entities
   * @method
   * @name getEntities
   * @param {Object} req - request data.
   * @param {String} req.params._id - user id.
   * @param {string} req.query.entityType - entity type
   * @returns {JSON} User profile data. 
   */

  getEntities(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let result = await userExtensionHelper.getEntities(
          (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId ,
          req.query.entityType ? req.query.entityType : "",
          req.pageSize,
          req.pageNo,
          req.searchText 
        );

        return resolve({
          message: constants.apiResponses.USER_ENTITIES_FOUND,
          result: result
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
  * @api {get} /kendra/api/v1/user-extension/getEntityTypes Get user entity types.
  * @apiVersion 1.0.0
  * @apiName Get user entity types
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/getEntityTypes
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  {
    "message": "User entity types fetched successfully.",
    "status": 200,
    "result": [
        "school",
        "smc",
        "district"
    ]
}
**/


  /**
   * Get user entity types.
   * @method
   * @name getEntityTypes
   * @param {Object} req - request data.
   * @param {String} req.params._id - user id.
   * @returns {JSON} User profile data. 
   */

  getEntityTypes(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let result = await userExtensionHelper.getEntityTypes({
          userId: (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
          status: constants.common.ACTIVE,
          isDeleted: false,
        });

        return resolve({
          message: constants.apiResponses.USER_ENTITY_TYPE_FOUND,
          result: result
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
  * @api {get} /kendra/api/v1/user-extension/platformRoles/:id List of user platform roles
  * @apiVersion 1.0.0
  * @apiName List of user platform roles
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/platformRoles/01c04166-a65e-4e92-a87b-a9e4194e771d
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "List of user platform roles",
    "status": 200,
    "result": [
        {
            "_id": "60a4cf511a549c634b475663",
            "code": "PM"
        }
    ]
  }
**/


  /**
   * List of user platform roles
   * @method
   * @name platformRoles
   * @returns {Array} List of user platform roles
   */

   platformRoles(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let userPlatformRoles = await userExtensionHelper.platformRoles(
          (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId
        );
        
        userPlatformRoles["result"] = userPlatformRoles.data;
        return resolve(userPlatformRoles);

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
  * @api {get} /kendra/api/v1/user-extension/programsByPlatformRoles?role=:role List of programs for platform user
  * @apiVersion 1.0.0
  * @apiName List of programs for platform user
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/programsByPlatformRoles?role=PM
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "List of programs for platform user",
    "status": 200,
    "result": [
        {
            "_id": "5f34e44681871d939950bca6",
            "externalId": "TN-Program-1597301830708",
            "name": "TN-Program",
            "description": "TN01-Mantra4Change-APSWREIS School Leader Feedback",
            "role": "PM"
        },
        {
            "_id": "5fa28620b6bd9b757dc4e932",
            "externalId": "SLDP-1604486688019",
            "name": "SLDP",
            "description": "स्कूल सुरक्षा चेकलिस्ट",
            "role": "PGM"
        }
    ]
  }
**/


  /**
   * List of programs for platform user
   * @method
   * @name programsByPlatformRoles
   * @returns {Array} List of programs for platform user
   */

   programsByPlatformRoles(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let programs = await userExtensionHelper.programsByPlatformRoles(
          req.userDetails.userId,
          req.query.role
        );
        
        programs["result"] = programs.data;
        return resolve(programs);

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
  * @api {get} /kendra/api/v1/user-extension/solutions/:programId?role=:role List of solutions for platform user program
  * @apiVersion 1.0.0
  * @apiName List of solutions for platform user program
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/solutions/5f34e44681871d939950bca6?role=PM
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Solutions lists fetched successfully",
    "status": 200,
    "result": [
        {
            "_id": "5f34e44681871d939950bca7",
            "isRubricDriven": false,
            "externalId": "dea0b95a-dd11-11ea-a3bf-000d3af02677-OBSERVATION-TEMPLATE-1597301830736",
            "name": "TN01-Mantra4Change-APSWREIS School Leader Feedback",
            "description": "TN01-Mantra4Change-APSWREIS School Leader Feedback",
            "type": "observation",
            "subType": "school"
        }
    ]
  }
**/


  /**
   * List of solutions for platform user program
   * @method
   * @name solutions
   * @returns {Array} List of solutions for platform user program
   */

  solutions(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let programs = await userExtensionHelper.solutions(
          req.userDetails.userId,
          req.params._id,
          req.query.role
        );
        
        programs["result"] = programs.data;
        return resolve(programs);

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
