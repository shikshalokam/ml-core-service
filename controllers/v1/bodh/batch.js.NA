/**
 * name : batch.js
 * author : Aman
 * created-date : 13-04-2020
 * Description : All bodh batch related functionality. 
 */

// dependencies

const bodhHelper = require(MODULES_BASE_PATH + "/bodh/helper");

/**
    * Batch
    * @class
*/

module.exports = class Batch extends Abstract {

    constructor() {
        super(schemas["user-courses"]);
    }
        

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
     * @api {post} /kendra/api/v1/bodh/batch/enrol    
     * Courses enrolled by users.
     * @apiVersion 1.0.0
     * @apiGroup Batch
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/batch/enrol
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
     * "batchId": "0129965476174233600",
     * "userIds": [
     * "235e992c-2083-469d-9e03-ba7a1db4f9a0"
     * ],
     * "courseId": "do_3129965380826972162686"
     * }
     * @apiParamExample {json} Response:
     * {
     * "message": "Courses enrolled by users",
     * "status": 200,
     * "result": [
     * {
     * "userId": "235e992c-2083-469d-9e03-ba7a1db4f9a0",
     * "success": true
     * }
     * ]
     * }
    
    /**
      * Courses enrolled by users
      * @method
      * @name enroll
      * @param  {Request} req request body.
      * @returns {json} 
     */

    async enrol(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let batchEnroll = await bodhHelper.enrol(
                    req.body,
                    req.userDetails.userToken
                );

                return resolve(batchEnroll);

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

