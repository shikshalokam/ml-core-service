/**
 * name             : storage.js
 * author           : Vishnu
 * created-date     : 10-Aug-2023
 * Description      : Storage service.
 */

// dependencies
let filesHelpers = require(ROOT_PATH+"/module/cloud-services/storage/helper");

/**
    * Storage service.
    * @class
*/

module.exports = class Storage {

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

    constructor() { }

    static get name() {
        return "storage";
    }

    // Internal API for Data Team As part of CSP implementation
    /**
     * @api                 {post} /kendra/api/v1/cloud-services/storage/actions
     * @description         Do storage action
     * @apiVersion          1.0.0
     * @apiGroup            Files
     * @apiHeader           {String} Internal access token
     * @apiParamExample     {json} Request:
     * {
            "request" : {     
                "files": ["uploadFile.jpg", "uploadFile2.jpg"]
             }
            "ref" : "datateam",
            "bucketName" : "sample_bucket_name",
            "expiresIn": 262500 ,
            "action" : "signedUrl",
            "operation" : "read/write"
        }
     * @apiSampleRequest     {post} /kendra/api/v1/cloud-services/storage/actions
     * @apiUse               successBody
     * @apiUse               errorBody
     * @apiParamExample      {json} Response:
     * * {
        "message": "File upload urls generated successfully.",
        "status": 200,
        "result": {
            "files": [
                    {
                        "file": "uploadFile.jpg",
                        "url": "https://storage.googleapis.com/sl-dev-storage/01c04166-a65e-4e92-a87b-a9e4194e771d/5f72f9998925ec7c60f79a91/cd6763c9-a64a-4241-9907-4365970e8d11_uploadFile.jpg?GoogleAccessId=sl-dev-storage%40shikshalokam.iam.gserviceaccount.com&Expires=1605698490&Signature=ej6WHNOyx6EvUbAi81pDcYb3YqM7dkAhNT1Ktsf%2FTiRhwL%2ByhS89E1zRspIYlVOutlzoZXgRAl%2Fd0y%2BQcdryWYgfVAKAZmJVZtK3oVisLxhkFCKYeHAbzZ%2FadkCXdU3e1AVJGyRvKoN04Yr84%2BIa%2F1ApszOYDmVT%2Fn%2FOi4JSScbvzhe82bSe5xEr%2FPDwDq48%2FKgUhAc0faP%2FlAA2Wf7V1Ifuxc3quw9OpzvND8CKuugXZ%2FDZ6mhF0O80IXwP%2BFJOn4u9ydHqwXM3zDRDOO0WMh6VBLuvRFBRwJsrJG3v5zZMw0r5cYOIvkW4Tqo%2FefpXUDsvCVBTlZ9zBEdwx2Jshw%3D%3D",
                        "payload": {
                            "sourcePath": "01c04166-a65e-4e92-a87b-a9e4194e771d/5f72f9998925ec7c60f79a91/cd6763c9-a64a-4241-9907-4365970e8d11_uploadFile.jpg"
                        },
                        "cloudStorage": "azure"
                    },
                    {
                        "file": "uploadFile2.jpg",
                        "url": "https://storage.googleapis.com/sl-dev-storage/01c04166-a65e-4e92-a87b-a9e4194e771d/5f72f9998925ec7c60f79a91/1626ec00-f890-4f8b-9594-4342868e8703_uploadFile2.jpg?GoogleAccessId=sl-dev-storage%40shikshalokam.iam.gserviceaccount.com&Expires=1605698490&Signature=RucBanx70czWdcqNb5R3wTtATUCGl7BH6vUbx6GJqJJnxvVF179XLCgPHUcsv9eXNv9o0ptueFwA%2BHTAOA4d7g6tx2G7BYqua1zMsGIw5%2B57dUaIRfgXQgO%2Br5voQvKMDmSUJMx9nVY0Dfe5xce3xbcn4XjtQKopb%2Fjh1YqnCmnK7EujbU2tfk0ENBKHtEyd%2FdZlpCtQ7IqnZ%2FZJ73OZgX%2FjnFd18iJ2ce7%2FJ%2FwjUBUQnTBLPk7n%2FMFDkLfNMeSYlutwkwcApLj9cuLO%2FbmuEfT%2Fa%2BxzJz1xF639piOpTW6vAFHgXJz%2FLtR9nMUidMTOnhZdhTjjr%2BFiokqK03SGNw%3D%3D",
                        "payload": {
                            "sourcePath": "01c04166-a65e-4e92-a87b-a9e4194e771d/5f72f9998925ec7c60f79a91/1626ec00-f890-4f8b-9594-4342868e8703_uploadFile2.jpg"
                        },
                        "cloudStorage": "azure"
                    }
                ]
            }
        }
    */

    /**
      * @description                - Get downloadable and presigned urls.
      * @method
      * @name                       - actions
      * @param  {Request}  req      - request body.
      * @returns {JSON}             - Response with status and message.
    */

    async actions(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let customBucketUrl =
                await filesHelpers.actions(
                    req.body,
                );
                customBucketUrl["result"] = customBucketUrl["data"];
                return resolve(customBucketUrl);

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