/**
 * name : gcp.js
 * author : Deepa
 * created-date : 01-Apr-2020
 * Description :  Gcp service.
 */


// dependencies
let filesHelpers = require(ROOT_PATH+"/module/files/helper");

/**
    * Gcp service.
    * @class
*/

module.exports = class Gcp {

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

    static get name() {
        return "gcp";
    }


    /**
     * @api {post} /kendra/api/v1/cloud-services/gcp/getDownloadableUrl  
     * Get downloadable URL.
     * @apiVersion 1.0.0
     * @apiGroup Gcp
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request:
     * {
     * "filePaths": [],
     * "bucketName": ""
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/gcp/getDownloadableUrl
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     *  "status": 200,
     *  "message": "Url's generated successfully",
     *  "result": [{
     *  "filePath": "5e1c28a050452374e1cf9841/e97b5582-471c-4649-8401-3cc4249359bb/cdv_photo_117.jpg",
     *  "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/5e1c28a050452374e1cf9841%2Fe97b5582-471c-4649-8401-3cc4249359bb%2Fcdv_photo_117.jpg?generation=1579240054787924&alt=media"
     * }]
     */

    /**
      * Get Downloadable URL from aws.
      * @method
      * @name getDownloadableUrl
      * @param  {Request}  req  request body.
      * @returns {JSON} Response with status and message.
    */

    async getDownloadableUrl(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let downloadableUrl =
                await filesHelpers.getDownloadableUrl(
                     req.body.filePaths, 
                     req.body.bucketName,
                     constants.common.GOOGLE_CLOUD_SERVICE
                );

                return resolve({
                    message: constants.apiResponses.CLOUD_SERVICE_SUCCESS_MESSAGE,
                    result: downloadableUrl
                })

            } catch (error) {
                
                console.log(error);
                return reject({
                    status:
                        error.status ||
                        httpStatusCode["internal_server_error"].status,

                    message:
                        error.message
                        || httpStatusCode["internal_server_error"].message,

                    errorObject: error
                })

            }
        })

    }


    /**
     * @api {post} /kendra/api/v1/cloud-services/gcp/preSignedUrls  
     * Get signed URL.
     * @apiVersion 1.0.0
     * @apiGroup Gcp
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request:
     * {
     * "fileNames" : [
     * "R2I3A5/R2I3A5.png"
     * ],
     * "bucket":"sl-dev-storage"
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/gcp/preSignedUrls
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "Url generated successfully",
     * "status": 200,
     * "result": [
     * {
     * "fileNames": "R2I3A5/R2I3A5.png",
     * "url": "https://storage.googleapis.com/sl-dev-storage/qrcode/R2I3A5/R2I3A5.png?GoogleAccessId=sl-dev-storage%40shikshalokam.iam.gserviceaccount.com&Expires=1587437414&Signature=N7yg1ixFXPG14vOxw7zPxMSm98qDoeY7IYtB8iRnSQRYTNwWRfAT7MqvLT3HW9iXexABEhhWPEDhVQt0J42BzY1it3mFMV1C9xgCl8Q%2BhuMVY746GIdapGEJEhicMGIeEVRy%2FItfuNg9UxcZyk1M3TU%2FEabQLCjAgMthnUvQ8tCqiH%2B1t%2FcJDODAvLv96sQVbO%2Fg4aW%2Bz3GGmtx39Kq%2FRTWVgxLBWu5wPs5PuDq7Xg6HSiD9peQylb7wRStkkuRP%2FMyjIhOuQTtgzPdNFV26I5WZu2Eu2EM5Hx6vDAYjXTOHuOry8fX6od5gcHMSjo9J645nNcN8tb97BIuG%2BgKOcg%3D%3D",
     * "payload": {
     * "sourcePath": "R2I3A5/R2I3A5.png"
     * },
     * "cloudStorage": "GC"
     * }
     * ]}
     */

    /**
      * Get signed urls.
      * @method
      * @name preSignedUrls
      * @param  {Request}  req  request body.
      * @param  {Array}  req.body.fileNames - list of file names
      * @param  {String}  req.body.bucket - name of the bucket 
      * @returns {JSON} Response with status and message.
    */

   async preSignedUrls(req) {
    return new Promise(async (resolve, reject) => {

        try {

            let signedUrl =
            await filesHelpers.preSignedUrls(
                 req.body.fileNames,
                 req.body.bucket,
                 constants.common.GOOGLE_CLOUD_SERVICE
            );

            return resolve(signedUrl);

        } catch (error) {
            
            console.log(error);
            return reject({
                status:
                    error.status ||
                    httpStatusCode["internal_server_error"].status,

                message:
                    error.message
                    || httpStatusCode["internal_server_error"].message,

                errorObject: error
            })

        }
    })
   }


       /**
     * @api {post} /kendra/api/v1/cloud-services/gcp/uploadFile  
     * Upload file to GCP
     * @apiVersion 1.0.0
     * @apiGroup Gcp
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {fromData} Request:
     * {
     * "filePath" : "1230981723091723/sample.csv"
     * "bucketName":"sl-dev-storage",
     * "storage": "GC"
     *  
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/gcp/uploadFile
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "status": 200,
     * "message":"File uploaded successfully",
     *  "result": {
     *   "kind": "storage#object",
     *   "id": "sl-dev-storage/my.csv/1590132715837085",
     *   "selfLink": "https://www.googleapis.com/storage/v1/b/sl-dev-storage/o/my.csv",
     *   "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/my.csv?generation=1590132715837085&alt=media",
     *   "name": "my.csv",
     *   "bucket": "sl-dev-storage",
     *   "generation": "1590132715837085",
     *   "metageneration": "1",
     *   "contentType": "text/csv; charset=utf-8",
     *   "storageClass": "REGIONAL",
     *   "size": "137",
     *   "md5Hash": "edPW+5pdDV6cbSl1TkVwLA==",
     *   "contentEncoding": "gzip",
     *   "crc32c": "56+5+A==",
     *   "etag": "CJ2tsf35xukCEAE=",
     *   "timeCreated": "2020-05-22T07:31:55.836Z",
     *   "updated": "2020-05-22T07:31:55.836Z",
     *   "timeStorageClassUpdated": "2020-05-22T07:31:55.836Z"
     *    }
     * }
     */

    /**
      * Upload file to GCP 
      * @method
      * @name uploadFile
      * @param  {Request}  req  request body.
      * @param  {files}  req.files.file -actual file to upload
      * @param  {String}  req.body.bucketName - bucket name
      * @param  {String}  req.body.filePath - file path of where to store
      * @returns {JSON} Response with status and message.
    */
   async uploadFile(req) {
    return new Promise(async (resolve, reject) => {
        try {
            if (req.files && req.body.filePath && req.body.bucketName) {
                let response  = await filesHelpers.upload(
                    req.files.file,
                    req.body.filePath,
                    req.body.bucketName,
                    constants.common.GOOGLE_CLOUD_SERVICE
                );
                return resolve({ result:response });
            } else {
                return reject({
                    status:
                        httpStatusCode["bad_request"].status,
                        message:httpStatusCode["bad_request"].message

                });
            }
        } catch (error) {
            return reject({
                status:
                    error.status ||
                    httpStatusCode["internal_server_error"].status,

                message:
                    error.message
                    || httpStatusCode["internal_server_error"].message,

                errorObject: error
            })
        }
    })
   }

};

