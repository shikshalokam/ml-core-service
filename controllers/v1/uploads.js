const fileUploadHelper = require(MODULES_BASE_PATH + "/fileUpload/helper.js");



module.exports = class Uploads {
      /**
    * Upload a image to azure cloud.
    * @name cloudUpload
    * @api {post} v1/uploads/cloudUpload
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParamExample {File} Req;
    * @apiResponse {JSON} 
    * 
    **/
     async cloudUpload(req) {
      return new Promise(async (resolve, reject) => {
        try {
            let assestsData = await fileUploadHelper.uploadFiles(
              req
            );
            return resolve(assestsData);
          } catch (error) {
            return reject({
              status: error.status || httpStatusCode.internal_server_error.status,
              message:
                error.message || httpStatusCode.internal_server_error.message,
              errorObject: error,
            });
          }
      
      });
    }
  };