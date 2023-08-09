/**
 * name : files/helper.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All files related helper functionality.Including uploading file
 * to cloud service.
 */

// Dependencies
const Zip = require('adm-zip');
const fs = require('fs');
// const request = require('request');
// const awsServices = require(ROOT_PATH + '/generics/services/aws');
// const googleCloudServices = require(ROOT_PATH +'/generics/services/google-cloud');
// const azureService = require(ROOT_PATH + '/generics/services/azure');
// const oracleSerices = require(ROOT_PATH + '/generics/services/oracle-cloud');
const {cloudClient} = require(ROOT_PATH + '/config/cloud-service');

/**
 * FilesHelper
 * @class
 */

module.exports = class FilesHelper {
  // /**
  //  * Upload file in different services based on cloud storage provide.
  //  * @method
  //  * @name upload
  //  * @param  {file}  - file to upload.
  //  * @param  {filePathForBucket}  - file path where the file should upload.
  //  * @param {String} - bucketName
  //  * @param {String} - storage - name of the cloud storage 
  //  * @returns {json} Response consists of links of uploaded file.
  //  */

  // static upload(file, filePathForBucket, bucketName, storage = "") {
  //   return new Promise(async (resolve, reject) => {
  //     try {

  //       let deleteFile = false;
  //       let filePath;
  //       if (file && file.data && file.name) {
  //         deleteFile = true;
  //         let tempPath = constants.common.UPLOAD_FOLDER_PATH;
  //         if (!fs.existsSync(`${ROOT_PATH}${tempPath}`)) {
  //           fs.mkdirSync(`${ROOT_PATH}${tempPath}`)
  //         }

  //         let uniqueId = gen.utils.generateUniqueId();
  //         let fileName = uniqueId + file.name;
  //         filePath = `${ROOT_PATH}${tempPath}` + '/' + fileName;
  //         fs.writeFileSync(filePath, file.data);
  //         file = filePath;

  //       }

  //       let cloudStorage = process.env.CLOUD_STORAGE;
  //       let result
  //       if (storage) {
  //         cloudStorage = storage;
  //       }

  //       if (cloudStorage === constants.common.AWS_SERVICE) {
  //         result = await awsServices.uploadFile(
  //           file,
  //           filePathForBucket,
  //           bucketName
  //         )
  //       } else if (
  //         cloudStorage === constants.common.GOOGLE_CLOUD_SERVICE
  //       ) {
  //         result = await googleCloudServices.uploadFile(
  //           file,
  //           filePathForBucket,
  //           bucketName
  //         )
  //       } else if (
  //         cloudStorage === constants.common.AZURE_SERVICE
  //       ) {
  //         result = await azureService.uploadFile(
  //           file,
  //           filePathForBucket,
  //           bucketName
  //         )
  //       } else if (cloudStorage === constants.common.ORACLE_CLOUD_SERVICE) {
  //         result = await oracleSerices.uploadFile(
  //           file,
  //           filePathForBucket,
  //           bucketName
  //         )
  //       }
  //       if (deleteFile) {
  //         _removeFiles(filePath);
  //       }
  //       return resolve(result)
  //     } catch (error) {
  //       return reject(error)
  //     }
  //   })
  // }

  /**
   * Get downloadable url
   * @method
   * @name                        - getDownloadableUrl
   * @param {filePath}            - File path.
   * @param {String}              - Bucket name
   * @param {Array} storageName   - Storage name if provided.
   * @param {Number} expireIn     - Link expire time.
   * @return {String}             - Downloadable url link
   */

  static getDownloadableUrl(filePath, bucketName, storageName = '',expireIn = '') {
    return new Promise(async (resolve, reject) => {
      try {
       
        // Get cloud storage provider value from the environment.
        let cloudStorage = process.env.SUNBIRD_CLOUD_STORAGE_PROVIDER;
        let noOfMinutes = constants.common.NO_OF_MINUTES;
        let linkExpireTime = constants.common.NO_OF_EXPIRY_TIME * noOfMinutes;
       
        // Override cloud storage provider name if provided explicitly.
        if (storageName !== '') {
          cloudStorage = storageName;
        }
        // Override linkExpireTime if provided explicitly.
        if (expireIn !== '') {
          linkExpireTime = expireIn;
        }

        if (Array.isArray(filePath) && filePath.length > 0) {
          let result = []

          await Promise.all(
            filePath.map(async element => {
              let responseObj = {
                cloudStorage : cloudStorage
              }
              responseObj.filePath = element
              // Get the downloadable URL from the cloud client SDK.
              responseObj.url = await cloudClient.getDownloadableUrl(
                bucketName,
                element,
                linkExpireTime // Link ExpireIn 
              )
              result.push(responseObj)
            })
          )
          return resolve({
            success: true,
            message: constants.apiResponses.URL_GENERATED,
            result: result
          })
        } else {
          let result
          // Get the downloadable URL from the cloud client SDK.
          result = await cloudClient.getDownloadableUrl(
            bucketName,
            filePath,
            linkExpireTime // Link ExpireIn 
          )
      
          let responseObj = {
            filePath: filePath,
            url: result,
            cloudStorage : cloudStorage
          }
          return resolve({
            success: true,
            message: constants.apiResponses.URL_GENERATED,
            result: responseObj
          })
    
        }
      } catch (error) {
        return reject(error)
      }
    })
  }

  /**
   * Get all signed urls.
   * @method
   * @name preSignedUrls
   * @param {Array} [fileNames]       - fileNames.
   * @param {String} bucket           - name of the bucket
   * @param {Array} [storageName]     - Storage name if provided.
   * @param {String} folderPath       - folderPath
   * @param {Number} expireIn         - Link expire time.
   * @returns {Array}                 - consists of all signed urls files.
   */

  static preSignedUrls(fileNames, bucket, storageName = '',folderPath, expireIn = '') {
    return new Promise(async (resolve, reject) => {
      try {
        if (!Array.isArray(fileNames) || fileNames.length < 1) {
          throw new Error('File names not given.')
        }

        // Get cloud storage provider value from the environment.
        let cloudStorage = process.env.SUNBIRD_CLOUD_STORAGE_PROVIDER;
        let noOfMinutes = constants.common.NO_OF_MINUTES;
        let linkExpireTime = constants.common.NO_OF_EXPIRY_TIME * noOfMinutes;
        // Override cloud storage provider name if provided explicitly.
        if (storageName !== '') {
          cloudStorage = storageName;
        }

        // Override linkExpireTime if provided explicitly.
        if (expireIn !== '') {
          linkExpireTime = expireIn;
        }

        // Create an array of promises for signed URLs
        const signedUrlsPromises = fileNames.map(async (fileName) => {
          let file = folderPath && folderPath !== '' ? folderPath + fileName : fileName;
          
          let signedUrlResponse = await cloudClient.getSignedUrl(
              bucket,
              file,
              linkExpireTime,
              constants.common.WRITE_PERMISSION
          );

          return {
              file: file,
              url: signedUrlResponse,
              payload: { sourcePath: file },
              cloudStorage: cloudStorage
          };
        });

        // Wait for all signed URLs promises to resolve
        const signedUrls = await Promise.all(signedUrlsPromises);

        // Return success response with the signed URLs
        return resolve({
            success: true,
            message: constants.apiResponses.URL_GENERATED,
            result: signedUrls
        });
        
      } catch (error) {
        return reject({
          success: false,
          message: constants.apiResponses.FAILED_PRE_SIGNED_URL,
          error: error
        })
      }
    })
  }
  /**
   * Unzip file
   * @method
   * @name unzip
   * @param  {String} zipFilePath - Path of zip file.
   * @param  {String} folderToUnZip - Path where file should be unziped.
   * @param  {String} deleteExistingZipFile - delete the existing zip file.
   * @return {Object} - Save unzipped file
   */

  static unzip(zipFilePath, folderToUnZip, deleteExistingZipFile) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!fs.existsSync(`${ROOT_PATH}${process.env.ZIP_PATH}`)) {
          fs.mkdirSync(`${ROOT_PATH}${process.env.ZIP_PATH}`)
        }

        const zip = new Zip(zipFilePath)

        zip.extractAllTo(folderToUnZip, true)

        if (deleteExistingZipFile) {
          fs.unlinkSync(zipFilePath)
        }

        return resolve({
          success: true
        })
      } catch (error) {
        return resolve({
          success: false
        })
      }
    })
  }

  /**
   * zip a folder
   * @method
   * @name zip
   * @param  {String} existingName - existing file name.
   * @param  {String} newFileName - new file name to set
   * @return {Object} - Save unzipped file
   */

  static zip(existing, newFolder) {
    return new Promise(async (resolve, reject) => {
      try {
        const zip = new Zip()

        zip.addLocalFolder(existing)
        zip.writeZip(newFolder)

        return resolve({
          success: true
        })
      } catch (error) {
        return resolve({
          success: false
        })
      }
    })
  }

  /**
   * Rename file name
   * @method
   * @name rename
   * @param  {String} existingName - existing file name.
   * @param  {String} newFileName - new file name to set
   * @return {Object} - Save unzipped file
   */

  static rename(existingName, newFileName) {
    return new Promise(async (resolve, reject) => {
      try {
        fs.rename(existingName, newFileName, function (err) {
          if (err) {
            return resolve({
              success: false
            })
          } else {
            return resolve({
              success: true
            })
          }
        })
      } catch (error) {
        return reject(error)
      }
    })
  }

  /**
   * Save zip file in public zip folder
   * @method
   * @name saveZipFile
   * @param  {String} zipFileName  - name of zip file.
   * @param  {String}  zipFileData
   * @return {Object} - Save zip file data.
   */

  static saveZipFile(name, data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!fs.existsSync(`${ROOT_PATH}${process.env.ZIP_PATH}`)) {
          fs.mkdirSync(`${ROOT_PATH}${process.env.ZIP_PATH}`)
        }

        let zipFileName = `${ROOT_PATH}${process.env.ZIP_PATH}/${name}`

        fs.writeFile(zipFileName, data, async function (err) {
          if (err) {
            return resolve({
              success: false
            })
          } else {
            return resolve({
              success: true
            })
          }
        })
      } catch (error) {
        return reject(error)
      }
    })
  }

  /**
   * Remove folder recursively
   * @function
   * @name removeFolder
   * @param path - folder path.
   * @returns {Promise}
   */

  static removeFolder(path) {
    _removeFolder(path)
    return
  }

}

/**
 * Remove folder recursively
 * @function
 * @name _removeFolder
 * @param path - folder path.
 * @return
 */

function _removeFolder(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var currentPath = path + '/' + file
      if (fs.lstatSync(currentPath).isDirectory()) {
        // recurse
        _removeFolder(currentPath)
      } else {
        // delete file
        fs.unlinkSync(currentPath)
      }
    })
    fs.rmdirSync(path)
  }
}


/**
 * Remove file
 * @function
 * @name _removeFiles
 * @param filePath -  path of the file.
 * @return
 */

function _removeFiles(filePath){

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return;
}
