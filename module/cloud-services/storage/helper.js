/**
 * name             : storage/helper.js
 * author           : Vishnu
 * created-date     : 10-Aug-2023
 * Description      : All storage related helper functionality.
 */

// Dependencies

let filesHelpers = require(ROOT_PATH+"/module/files/helper");

/**
 * FilesHelper
 * @class
 */

module.exports = class StorageHelper {

  /**
   * @description                   - Get signedUrls or downloadable Urls.
   * @name                          - actions
   * @param {Object} request        - Request body.
   * @returns {Array}               - consists of all urls  for files.
   */

  static actions(request) {
    return new Promise(async (resolve, reject) => {
      try {
        // Extract required data from the request object
        let files = request.request.files;
        let cloudStorage = process.env.CLOUD_STORAGE_PROVIDER;
        let bucketName = request.bucketName;
        let customBucketUrlsData;
        

        // Generate custom bucket URLs based on the URL type
        if (request.action === constants.common.SIGNEDURL) {
            let permission;
            if (request.operation === constants.common.READ) {
                permission = constants.common.READ_PERMISSION;
            } else if (request.operation === constants.common.WRITE) {
                permission = constants.common.WRITE_PERMISSION;
            }
            let folderPath = request.folderPath;
            customBucketUrlsData = await filesHelpers.preSignedUrls(
                files,              // files
                bucketName,         // bucket name
                cloudStorage,       // cloud storage name
                folderPath,         // folder path
                request.expiresIn,  // link expiry time
                permission          // action permission
            );
        } else { 
            customBucketUrlsData = await filesHelpers.getDownloadableUrl(
                files,              // files 
                bucketName,         // bucket name 
                cloudStorage,       // cloud storage name
                request.expiresIn   // link expiry
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



