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
  * @api {get} /kendra/api/v1/user-extension/programsByPlatformRoles?role=:role1,role2 List of programs for platform user
  * @apiVersion 1.0.0
  * @apiName List of programs for platform user
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/programsByPlatformRoles?role=PM,PGM
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
