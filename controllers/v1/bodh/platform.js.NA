/**
 * name : platform.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All bodh platform related information
*/

// Dependencies
const bodhHelpers = require(ROOT_PATH+"/module/bodh/helper");

module.exports = class Platform {

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
     * @api {post} /kendra/api/v1/bodh/platform/generate 
     * Generate qr code information.
     * @apiVersion 1.0.0
     * @apiGroup bodhPlatform
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/platform/generate
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
     * "contentData":[
     * {
     * "lastPublishedBy":"",
     * "identifier":"do_2127512157406167041194",
     * "name": "BTextbook"
     * }]}
     * */

    
    /**
      * Generate qr code for bodh.
      * @method
      * @name generate
      * @param  {req}  - requested data.
      * @returns {json} Response consists of all generated qr codes data.
    */

    async generate(req) {
        
        return new Promise(async (resolve, reject) => {
            
            try {
                
                let codes = 
                await bodhHelpers.generateQrCode(
                    req.body.contentData,
                    req.userDetails.userId,
                    req.userDetails.userToken
                );
  
                return resolve(codes);
            } catch(error) {
                
                return reject({
                    status: error.status || 
                    httpStatusCode["internal_server_error"].status,
                    
                    message: error.message || 
                    httpStatusCode["internal_server_error"].message
                });
            }
        });
    }

    /**
     * @api {post} /kendra/api/v1/bodh/platform/uploadScromContent?name=:name 
     * Upload scrom content data for bodh platform.
     * @apiVersion 1.0.0
     * @apiGroup bodhPlatform
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/platform/uploadScromContent?name=TEST-BODH-SCROM
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParam {File} contentData Mandatory contentData file of type csv.
     * @apiParamExample {json} Response:
     * {
     "message": "Successfully uploaded content",
     "status": 200,
     "result": {
        "contentId": "do_31301019283286425621481",
        "contentUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/do_31301019283286425621481/artifact/nvc-part-1_1588158308898.zip"
      }
     }
     * */

    
    /**
      * Upload scrom content in bodh platform.
      * @method
      * @name uploadScromContent
      * @param  {req}  - requested data.
      * @returns {json} Response consists of created content id.
    */

   async uploadScromContent(req) {
        
    return new Promise(async (resolve, reject) => {
        
        try {

            if ( !req.files || !req.files.contentData ) {
                throw { 
                    status: httpStatusCode["bad_request"].status, 
                    message: constants.apiResponses.CONTENT_FILE_REQUIRED 
                };
            }

            let contentData = 
            await bodhHelpers.uploadScromContent(
                req.files.contentData,
                req.query.name,
                req.userDetails.userToken,
                req.userDetails.userId
            );

            return resolve(contentData);
        } catch(error) {
            
            return reject({
                status: error.status || 
                httpStatusCode["internal_server_error"].status,
                
                message: error.message || 
                httpStatusCode["internal_server_error"].message
            });
        }
    });
   }
}