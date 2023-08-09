/**
 * name : files/helper.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All files related helper functionality.Including uploading file
 * to cloud service.
 */

// Dependencies

let filesHelpers = require(ROOT_PATH+"/module/files/helper");

/**
 * FilesHelper
 * @class
 */

module.exports = class FilesHelper {

  /**
   * Get all signed urls.
   * @method
   * @name preSignedUrls
   * @param {Array} payloadData       - payload for files data.
   * @param {String} referenceType    - reference type
   * @param {String} userId           - Logged in user id.
   * @param {String} templateId       - certificateTemplateId.
   * @returns {Array}                 - consists of all signed urls files.
   */

  static preSignedUrls(payloadData, referenceType, userId = "") {
    return new Promise(async (resolve, reject) => {
      try {
          
          let payloadIds = Object.keys(payloadData);
          let cloudStorage = process.env.SUNBIRD_CLOUD_STORAGE_PROVIDER;
          let bucketName = process.env.CLOUD_STORAGE_PRIVATEREPORTS_BUCKETNAME;

          let result = {
              [payloadIds[0]] : {}
          };

          if( referenceType === constants.common.PROJECT ) {
              
                for( let pointerToPayload = 0; pointerToPayload < payloadIds.length; pointerToPayload++ ) {
                    
                    let payloadId = payloadIds[pointerToPayload];
                    let folderPath = "project/" + payloadId + "/" + userId + "/" + gen.utils.generateUniqueId() + "/";
                    let imagePayload = 
                    await filesHelpers.preSignedUrls(
                        payloadData[payloadId].files,
                        bucketName,
                        cloudStorage,
                        folderPath
                    );

                    if( !imagePayload.success ) {
                        return resolve({
                            status : httpStatusCode['bad_request'].status,
                            message : constants.apiResponses.FAILED_PRE_SIGNED_URL,
                            result : {}
                        });
                    }

                    if( !result[payloadId] ) {
                        result[payloadId] = {};
                    }

                    result[payloadId]["files"] = imagePayload.result;
                }

          } else {
           
            let folderPath = "";

            if (referenceType == constants.common.DHITI) {
              folderPath = "reports/"
            } else if (referenceType == constants.common.CERTIFICATE) {
              //  Folder path specifically for project certificates
              folderPath = "certificateTemplates/";
            } else if (referenceType == "baseTemplates") {
              //  Folder path specifically for project certificates
              folderPath = "certificateBaseTemplates/";
            } else {
              folderPath = "survey/" + payloadIds[0] + "/" + userId + "/" + gen.utils.generateUniqueId() + "/";
            }
            
            let imagePayload = await filesHelpers.preSignedUrls(
                payloadData[payloadIds[0]].files,
                bucketName,
                cloudStorage,
                folderPath
            );

            if( !imagePayload.success ) {
                return resolve({
                    status : httpStatusCode['bad_request'].status,
                    message : constants.apiResponses.FAILED_PRE_SIGNED_URL,
                    result : {}
                });
            }

            result[payloadIds[0]]["files"] = imagePayload.result;
          }

          return resolve({
              message : constants.apiResponses.URL_GENERATED,
              data : result
          })
      } catch (error) {
        return reject(error)
      }
    })
  }

  /**
   * Get Downloadable URL from cloud.
   * @method
   * @name getDownloadableUrl
   * @param {Array} payloadData       - payload for files data.
   * @returns {JSON}                  - Response with status and message.
 */

  static getDownloadableUrl(payloadData) {
    return new Promise(async (resolve, reject) => {

      try {

        let cloudStorage = process.env.SUNBIRD_CLOUD_STORAGE_PROVIDER;
        let bucketName = process.env.CLOUD_STORAGE_PRIVATEREPORTS_BUCKETNAME;
        
        let downloadableUrl = await filesHelpers.getDownloadableUrl(
          payloadData,
          bucketName,
          cloudStorage
        );
        if( !downloadableUrl.success ) {
          return resolve({
              status : httpStatusCode['bad_request'].status,
              message : constants.apiResponses.FAILED_TO_CREATE_DOWNLOADABLEURL,
              result : {}
          });
        }
  
        return resolve({
          message: constants.apiResponses.CLOUD_SERVICE_SUCCESS_MESSAGE,
          result: downloadableUrl.result
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
   * Get bucket specific signedUrls or downloadable Urls.
   * @method
   * @name bucketSpecificUrl
   * @param {String} urlType        - Type of url should be return as response, presigned or downloadable URLs.
   * @param {Object} request        - Request body.
   * @returns {Array}               - consists of all urls  for files.
   */

  static bucketSpecificUrl(urlType, request) {
    return new Promise(async (resolve, reject) => {
      try {
        // Extract required data from the request object
        let files = request.request.files;
        let cloudStorage = process.env.SUNBIRD_CLOUD_STORAGE_PROVIDER;
        let bucketName = request.bucketName;
        let customBucketUrlsData;

        // Generate custom bucket URLs based on the URL type
        if (urlType === constants.common.PRESIGNEDURL) {
          let folderPath = request.folderPath;
          customBucketUrlsData = await filesHelpers.preSignedUrls(
            files,
            bucketName,
            cloudStorage,
            folderPath,
            request.expiresIn
          );
        } else {
          customBucketUrlsData = await filesHelpers.getDownloadableUrl(
            files,
            bucketName,
            cloudStorage,
            request.expiresIn
          );
          
        }

        // Check if customBucketUrlsData is successful
        if( !customBucketUrlsData.success ) {
          return resolve({
              status : httpStatusCode['bad_request'].status,
              message : constants.apiResponses.FAILED_CUSTOM_BUCKER_URL,
              result : {}
          });
        }
        // Prepare the response data with custom bucket URLs
        const result = { files: customBucketUrlsData.result };
        return resolve({
          message : constants.apiResponses.URL_GENERATED,
          data : result
        })
      } catch (error) {
        return reject(error)
      }
    })
  }
}



