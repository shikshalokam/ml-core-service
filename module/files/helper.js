/**
 * name : files/helper.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All files related helper functionality.Including uploading file
 * to cloud service.
 */

// Dependencies
const Zip = require("adm-zip");
const fs = require("fs");
const { cloudClient } = require(ROOT_PATH + "/config/cloud-service");
let cloudStorage = process.env.CLOUD_STORAGE_PROVIDER;

/**
 * FilesHelper
 * @class
 */

module.exports = class FilesHelper {
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

  static getDownloadableUrl(
    filePath,
    bucketName,
    storageName = "",
    expireIn = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let noOfMinutes = constants.common.NO_OF_MINUTES;
        let linkExpireTime = constants.common.NO_OF_EXPIRY_TIME * noOfMinutes;

        // Override cloud storage provider name if provided explicitly.
        if (storageName !== "") {
          cloudStorage = storageName;
        }
        // Override linkExpireTime if provided explicitly.
        if (expireIn !== "") {
          linkExpireTime = expireIn;
        }

        if (Array.isArray(filePath) && filePath.length > 0) {
          let result = [];

          await Promise.all(
            filePath.map(async (element) => {
              let responseObj = {
                cloudStorage: cloudStorage,
              };
              responseObj.filePath = element;
              // Get the downloadable URL from the cloud client SDK.
              // {sample response} : https://sunbirdstagingpublic.blob.core.windows.net/sample-name/reports/uploadFile2.jpg?st=2023-08-05T07%3A11%3A25Z&se=2024-02-03T14%3A11%3A25Z&sp=r&sv=2018-03-28&sr=b&sig=k66FWCIJ9NjoZfShccLmml3vOq9Lt%2FDirSrSN55UclU%3D
              responseObj.url = await cloudClient.getDownloadableUrl(
                bucketName,
                element,
                linkExpireTime // Link ExpireIn
              );
              result.push(responseObj);
            })
          );
          return resolve({
            success: true,
            message: constants.apiResponses.URL_GENERATED,
            result: result,
          });
        } else {
          let result;
          // Get the downloadable URL from the cloud client SDK.
          result = await cloudClient.getDownloadableUrl(
            bucketName, // bucket name
            filePath, // resource file path
            linkExpireTime // Link Expire time
          );

          let responseObj = {
            filePath: filePath,
            url: result,
            cloudStorage: cloudStorage,
          };
          return resolve({
            success: true,
            message: constants.apiResponses.URL_GENERATED,
            result: responseObj,
          });
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Get all signed urls.
   * @method
   * @name preSignedUrls
   * @param {Array} [fileNames]                         - fileNames.
   * @param {String} bucket                             - name of the bucket
   * @param {Array} [storageName]                       - Storage name if provided.
   * @param {String} folderPath                         - folderPath
   * @param {Number} expireIn                           - Link expire time.
   * @param {String} permission                         - Action permission
   * @param {Boolean} addDruidFileUrlForIngestion       - Add druid injection data to response {true/false}
   * @param {Boolean} serviceUpload                     - serive Upload  {true/false}
   * @returns {Array}                                   - consists of all signed urls files.
   */

  static preSignedUrls(
    fileNames,
    bucket,
    storageName = "",
    folderPath,
    expireIn = "",
    permission = "",
    addDruidFileUrlForIngestion = false,
    serviceUpload = false
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let actionPermission = constants.common.WRITE_PERMISSION;
        if (!Array.isArray(fileNames) || fileNames.length < 1) {
          throw new Error("File names not given.");
        }
        let noOfMinutes = constants.common.NO_OF_MINUTES;
        let linkExpireTime = constants.common.NO_OF_EXPIRY_TIME * noOfMinutes;
        // Override cloud storage provider name if provided explicitly.
        if (storageName !== "") {
          cloudStorage = storageName;
        }

        // Override actionPermission if provided explicitly.
        if (permission !== "") {
          actionPermission = permission;
        }
        // Override linkExpireTime if provided explicitly.
        if (expireIn !== "") {
          linkExpireTime = expireIn;
        }

        // Create an array of promises for signed URLs
        // {sample response} : https://sunbirdstagingpublic.blob.core.windows.net/samiksha/reports/sample.pdf?sv=2020-10-02&st=2023-08-03T07%3A53%3A53Z&se=2023-08-03T08%3A53%3A53Z&sr=b&sp=w&sig=eZOHrBBH%2F55E93Sxq%2BHSrniCEmKrKc7LYnfNwz6BvWE%3D
        const signedUrlsPromises = fileNames.map(async (fileName) => {
          let file =
            folderPath && folderPath !== "" ? folderPath + fileName : fileName;
            let response = {
              file: file,
              payload: { sourcePath: file },
              cloudStorage: cloudStorage.toUpperCase(),
            };
          if (!serviceUpload) {
            response.url = await cloudClient.getSignedUrl(
              bucket, // bucket name
              file, // file path
              linkExpireTime, // expire
              actionPermission // read/write
            );
          } else {
            response.url = `${process.env.PUBLIC_BASE_URL}/${constants.common.UPLOAD_FILE}?file=${file}`;
            response.downloadableUrl = await cloudClient.getDownloadableUrl(
              bucket,
              file,
              linkExpireTime // Link ExpireIn
            );
          }

          
          if (addDruidFileUrlForIngestion) {
            // {sample response} : { type: 's3', uris: [ 's3://dev-mentoring/reports/cspSample.pdf' ] }
            let druidIngestionConfig = await cloudClient.getFileUrlForIngestion(
              bucket, // bucket name
              file // file path
            );
            response.inputSource = druidIngestionConfig;
          }
          return response;
        });

        // Wait for all signed URLs promises to resolve
        const signedUrls = await Promise.all(signedUrlsPromises);

        // Return success response with the signed URLs
        return resolve({
          success: true,
          message: constants.apiResponses.URL_GENERATED,
          result: signedUrls,
        });
      } catch (error) {
        return reject({
          success: false,
          message: constants.apiResponses.FAILED_PRE_SIGNED_URL,
          error: error,
        });
      }
    });
  }

  /**
   * Upload and get Download Url for a file.
   * @method
   * @name upload
   * @param {String} fileName                           - name of the file.
   * @param {String} folderPath                         - folderPath
   * @param {String} bucket                             - name of the bucket
   * @param {Buffer} data                                - Binary Value of file to upload.
   * @returns {JSON}                                    - Path and download Url for the file
   */
  static upload(folderPath, bucket, data) {
    return new Promise(async (resolve, reject) => {
      try {
        await cloudClient.upload(
          bucket, // bucket name
          folderPath, // file path
          data //file content
        );

        // Return success response with the upload path and download URLs
        return resolve({
          success: true,
        });
      } catch (error) {
        return reject({
          success: false,
          message: constants.apiResponses.FAILED_TO_UPLOAD,
          error: error,
        });
      }
    });
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
          fs.mkdirSync(`${ROOT_PATH}${process.env.ZIP_PATH}`);
        }

        const zip = new Zip(zipFilePath);

        zip.extractAllTo(folderToUnZip, true);

        if (deleteExistingZipFile) {
          fs.unlinkSync(zipFilePath);
        }

        return resolve({
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
        });
      }
    });
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
        const zip = new Zip();

        zip.addLocalFolder(existing);
        zip.writeZip(newFolder);

        return resolve({
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
        });
      }
    });
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
              success: false,
            });
          } else {
            return resolve({
              success: true,
            });
          }
        });
      } catch (error) {
        return reject(error);
      }
    });
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
          fs.mkdirSync(`${ROOT_PATH}${process.env.ZIP_PATH}`);
        }

        let zipFileName = `${ROOT_PATH}${process.env.ZIP_PATH}/${name}`;

        fs.writeFile(zipFileName, data, async function (err) {
          if (err) {
            return resolve({
              success: false,
            });
          } else {
            return resolve({
              success: true,
            });
          }
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Remove folder recursively
   * @function
   * @name removeFolder
   * @param path - folder path.
   * @returns {Promise}
   */

  static removeFolder(path) {
    _removeFolder(path);
    return;
  }
};

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
      var currentPath = path + "/" + file;
      if (fs.lstatSync(currentPath).isDirectory()) {
        // recurse
        _removeFolder(currentPath);
      } else {
        // delete file
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(path);
  }
}

/**
 * Remove file
 * @function
 * @name _removeFiles
 * @param filePath -  path of the file.
 * @return
 */

function _removeFiles(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return;
}
