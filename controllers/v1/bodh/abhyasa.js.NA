/**
 * name : abhyasa.js
 * author : Aman
 * created-date : 07-04-2020
 * Description : All abhyasa app related apis. Abhyasa is an app for AP users. 
 */

// dependencies

const bodhHelper = require(MODULES_BASE_PATH + "/bodh/helper");

/**
    * Abhyasa
    * @class
*/

module.exports = class Abhyasa {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     * @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */


    /**
     * @api {get} /kendra/api/v1/bodh/abhyasa/userIsAllowed/:userId  
     * Check whether user belongs to AP organisations or not.
     * @apiVersion 1.0.0
     * @apiGroup Abhyasa
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/abhyasa/userIsAllowed/c828382f-89d4-4dc6-ae14-47a6d0337364
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message" : "Check if user belongs to AP organisation",
     * "status" : 200,
     * "result" : {
     * "isAllowed" : true,
     * "organisationId" : "0125747659358699520"
     * }
     * }

    /**
      * Check whether user belongs to AP organisations or not.
      * @method
      * @name userIsAllowed
      * @param  {Request}  req  request body.
      * @returns {json} If user belongs to AP organisations then user is allowed 
      * else user is not allowed.
     */

    async userIsAllowed(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let abhyasaUser = await bodhHelper.userIsAllowed(
                    req.userDetails.userToken,
                    req.params._id ? req.params._id : req.userDetails.userId,
                    process.env.AP_USERS_ORGANISATION_ID
                );
                
                if(!abhyasaUser.data) {
                    throw new Error(abhyasaUser.message)
                }

                abhyasaUser.message = constants.apiResponses.AP_USER_ALLOWED;
                if(!abhyasaUser.data.isAllowed) {
                    abhyasaUser.data.validationMessage  = "You are not authorized to access the app. Please re-login with valid user credentials.";
                }

                
                return resolve({
                    message : abhyasaUser.message,
                    result : abhyasaUser.data
                });

            } catch (error) {

                return reject({
                    status: 
                    error.status || httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || httpStatusCode["internal_server_error"].message,

                    errorObject: error
                });

            }
        })

    }

};

