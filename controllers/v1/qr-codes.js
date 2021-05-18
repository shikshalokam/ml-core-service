/**
 * name : qr-code.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : Create qr code.
 */

// Dependencies
let qrCodeHelper = require(ROOT_PATH+"/module/qr-codes/helper");

/**
    * QrCode
    * @class
*/

module.exports = class QrCodes extends Abstract {
  
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

    constructor() {
        super(schemas["qr-codes"]);
    }
    
    static get name() {
        return "qr-codes";
    }


  /**
     * @api {get} /kendra/api/v1/qr-code/image/:uniquecode 
     * Get the image link of the qr code
     * @apiVersion 1.0.0
     * @apiGroup qrCodes
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/qr-code/image/N7W8L4
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "Qr code image generated successfully",
     * "status": 200,
     * "result":
     * {
     * "url" : "https://sl-bodh-storage.s3.amazonaws.com/courses/courseId"    
     * } 
    }
  */

   /**
   * Get qr code image url based on unicode provided.
   * @method
   * @name image
   * @param  {req}  - requested data.
   * @returns {json} Response consists of qr code image url.
   */

  image(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let imageUrl = await qrCodeHelper.image(req.params._id);
        return resolve(imageUrl);

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

  /**
     * @api {Post} /kendra/api/v1/qr-code/pdf
     * Get qr code pdfs.
     * @apiVersion 1.0.0
     * @apiGroup qrCodes
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/qr-code/pdf
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
     * "codes" : [
     * "N7W8L4"
     * ]    
    }

     * @apiParamExample {json} Request:
     * {
     * "message": "Qr code pdfs generated successfully",
     * "status": 200,
     * "result":[{
     * code : "N7W8L4"
     * "url": "https://sl-bodh-storage.s3.amazonaws.com/courses/courseId/a.pdf"
     * }]
     * }
    }
  }
  */

   /**
   * All pdf urls.
   * @method
   * @name pdf
   * @param  {req}  - requested data.
   * @returns {json} Response consists of qr code image url.
   */

  pdf(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let pdfDocuments = await qrCodeHelper.pdfs(
          req.body.codes
        );

        return resolve(pdfDocuments);

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