/**
 * name : request.js
 * author : Aman
 * created-date : 06-04-2020
 * Description :  Bodh request data
 */

// dependencies

const bodhHelper = require(MODULES_BASE_PATH + "/bodh/helper");

/**
    * Request
    * @class
*/

module.exports = class Request {

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
     * @api {post} /kendra/api/v1/bodh/request/middleware  
     * Middleware for Bodh requests
     * @apiVersion 1.0.0
     * @apiGroup Bodh-Request 
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/request/middleware
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
     * "url": "",
     * "method": "GET/POST/PUT",
     * "headers": { 
     * "X-Channel-Id": "",
     * "Content-Type": "application/json"
     * },
     * "body":{
     * "request": {
     * "filters": {
     * "compatibilityLevel": {
     * "min": "",
     * "max": ""
     * },
     * "createdFor":[""]    			
     * },
     * "mode": "",
     * "name": "",
     * "source": ""
     * }
     * }
     * }
     * }
     * @apiParamExample {json} Response:
     * "message" : "Successfully fetched bodh request data",
     * "status": 200,
     * "result" : {
     * "id": "",
     * "ver": "",
     * "ts": "",
     * "params": {
     * "resmsgid": "",
     * "msgid": "",
     * "status": "successful",
     * "err": null,
     * "errmsg": null
     * },
     * "responseCode":"OK",
     * "result" : {"Bodh api data"}
     */

    /**
      * Middleware for bodh request.
      * @method
      * @name middleware
      * @param  {Request}  req  request body.
      * @returns {json} Response consists of resulted data from bodh api.
     */


    async middleware(req) {

        return new Promise(async (resolve, reject) => {

            try {
                
                let request = req.body;

                let getBodhServiceResponse = 
                await bodhHelper.getBodhResult(request);
                
                if( !getBodhServiceResponse.result ) {
                    throw { 
                        message: 
                        constants.apiResponses.BODH_REQUEST_MIDDLEWARE_FAILED 
                    }
                }
                
                return resolve(getBodhServiceResponse);

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

