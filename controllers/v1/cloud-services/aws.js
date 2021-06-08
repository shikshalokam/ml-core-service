/**
 * name : aws.js
 * author : Deepa
 * created-date : 01-Apr-2020
 * Description :  Aws service.
 */


// dependencies
let filesHelpers = require(ROOT_PATH+"/module/files/helper");

/**
    * Aws service.
    * @class
*/

module.exports = class Aws {

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
        return "aws";
    }


    /**
     * @api {post} /kendra/api/v1/cloud-services/aws/getDownloadableUrl  
     * Get downloadable URL.
     * @apiVersion 1.0.0
     * @apiGroup Aws
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request:
     * {
     * "filePaths": [],
     * "bucketName": ""
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/aws/getDownloadableUrl
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
                     constants.common.AWS_SERVICE
                );

                return resolve({
                    message: constants.apiResponses.CLOUD_SERVICE_SUCCESS_MESSAGE,
                    result: downloadableUrl
                })

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


    /**
     * @api {post} /kendra/api/v1/cloud-services/aws/preSignedUrls  
     * Get signed URL.
     * @apiVersion 1.0.0
     * @apiGroup Aws
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request:
     * {
     * "fileNames" : [
     * "N4X6E2/N4X6E2.png"
     * ],
     * "bucket":"sl-unnati-storage"
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/aws/preSignedUrls
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "Url generated successfully",
     * "status": 200,
     * "result": [
     * {
     * "file": "T9R6Y8/T9R6Y8.png",
     * "url": "https://sl-unnati-storage.s3.ap-south-1.amazonaws.com/qrcode/T9R6Y8/T9R6Y8.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJW4YWQMTNBKD2KTQ%2F20200421%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20200421T024629Z&X-Amz-Expires=1800&X-Amz-Signature=81d593329c96b318f2924b876854e534bf80aef1f10ca80083d74188b46e69de&X-Amz-SignedHeaders=host",
     * "payload": {
     * "sourcePath": "T9R6Y8/T9R6Y8.png"
     * },
     * "cloudStorage": "AWS"
     * }
     * ]
     * }
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
                 constants.common.AWS_SERVICE
            );

            return resolve(signedUrl);

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

 /**
     * @api {post} /kendra/api/v1/cloud-services/aws/uploadFile  
     * Upload file to AWS
     * @apiVersion 1.0.0
     * @apiGroup Aws
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {fromData} Request:
     * {
     * "filePath" : "1230981723091723/sample.csv"
     * "bucketName":"sl-dev-storage",
     * "storage": "GC"
     *  
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/aws/uploadFile
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "status": 200,
     *  "message":"File uploaded successfully",
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
      * Upload file to AWS
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
                    constants.common.AWS_SERVICE
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

