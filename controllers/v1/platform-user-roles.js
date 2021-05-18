/**
 * name : platform-user-roles.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All Platform user roles related information.
 */

const platformUserRolesHelper = require(MODULES_BASE_PATH + "/platform-user-roles/helper.js");

/**
    * PlatformUserRoles
    * @class
*/

module.exports = class PlatformUserRoles {
  
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

  constructor() {}

  static get name() {
    return "platform-user-roless";
  }

   /**
     * @api {post} /kendra/api/v1/platform-user-roles/getProfile 
     * Get platform user profile information.
     * @apiVersion 1.0.0
     * @apiGroup Email
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/platform-user-roles/jenkins
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "Platform user profile fetched successfully.",
     * "status": 200,
     * "result": {
     * "_id": "5da84a7641a40f1392162b8d",
     * "roles": [
     * "OBS_DESIGNER",
     * "OBS_REVIEWER"
      ],
      "username": "a2"
    }
  }
  */

   /**
   * Get platform users information.
   * @method
   * @name getProfile
   * @param  {req}  - requested data.
   * @returns {json} Response consists of platform user roles information
   */

  getProfile(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let getUserProfile = await platformUserRolesHelper.getProfile(
          (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
          req.userDetails.userToken
        );

        return resolve(getUserProfile);

      } catch(error) {
        
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

};