/**
 * load modules.
 */

const appConfigHelper = require(MODULES_BASE_PATH + "/application-config/helper.js");
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");
const fs = require("fs");
/**
    * Languages
    * @class
*/
module.exports = class Languages {
     
    /**
    * @api {get} /kendra/api/v1/application-config/uploadConfigurations
    * config List
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiSampleRequest /kendra/api/v1/application-config/uploadConfigurations
    * @apiParam {File} configFile Mandatory configFile file of type CSV.
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Upload configurations via csv.
      * @method
      * @name uploadConfigurations
      * @param  {Request} req request body.
      * Req consists of configurations csv to upload.
      * @returns {JSON} Response consists of message and result.Result consists of language data uploaded.
    */

    uploadConfigurations(req) {

        return new Promise(async (resolve, reject) => {
            try {

                if (!req.files || !req.files.configFile) {
                    throw { 
                        status: httpStatusCode["bad_request"].status, 
                        message: httpStatusCode["bad_request"].message 
                    };
                }

                let data = await appConfigHelper.uploadConfigurations(req);

                return resolve({
                    message: "App config Uploaded succesfully",
                    result: data
                })

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                })

            }


        })
    }
        /**
    * @api {get} /kendra/api/v1/application-config/listConfigurations 
    * config List
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiSampleRequest /kendra/api/v1/application-config/listConfigurations
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Details of the specific application config.
      * @method
      * @name listConfigurations
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of details of a application config.
     */

    listConfigurations(req) {
        return new Promise(async (resolve, reject) => {

            try {
                let applicationConfig = 
                await appConfigHelper.listConfigurations();
                
                return resolve({
                    result: applicationConfig,
                    message: "configaration retrived succesfully"
                });

            } catch (error) {
                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                });
            }
        })
    }


    /**
    * @api {post} /kendra/api/v1/application-config/uploadLanguages 
    * Upload Languages
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/application-config/uploadLanguages
    * @apiParam {File} language Mandatory language file of type CSV.
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Upload languages via csv.
      * @method
      * @name uploadLanguages
      * @param  {Request} req request body.Req consists of languages csv to upload.
      * @returns {JSON} Response consists of message and result.Result consists of language data uploaded.
     */

    uploadLanguages(req) {

        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.language) {
                    throw { 
                        status: httpStatusCode["bad_request"].status, 
                        message: httpStatusCode["bad_request"].message 
                    };
                }

                let languageUploadedData = await appConfigHelper.uploadLanguages
                (req.files,req.headers.appname?req.headers.appname:"");

                return resolve({
                    message: "Language uploaded successfully",
                    result: languageUploadedData
                })

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                })

            }


        })
    }

    /**
    * @api {get} /kendra/api/v1/application-config/listLanguage/:languageId 
    * Upload Language
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/application-config/listLanguage/en
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * List details of the language.
      * @method
      * @name listLanguage
      * @param  {Request} req request body.
      * Params consists of languageId and
      * appname - name of the app (as headers if provided).
      * @returns {JSON} Response consists of message and result.
      * Result consists of details of the language.
     */

    listLanguage(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let languageLists = 
                await appConfigHelper.listLanguage(
                    req.params._id,
                    req.headers.appname?req.headers.appname:""
                    );

                return resolve({
                    result: languageLists.data,
                    message: languageLists.message
                });

            } catch (error) {
                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                });
            }
        })
    }

    /**
    * @api {post} /kendra/api/v1/application-config/listAllLanguages 
    * Upload Language
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/application-config/listAllLanguages
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * List of all languages.
      * @method
      * @name listAllLanguages
      * @param  {Request} req request body.
      * appname - name of the app. (as headers if provided).
      * @returns {JSON} Response consists of message and result.
      * Result consists of of all languages.
     */

    listAllLanguages(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let languageLists = 
                await appConfigHelper.listAllLanguages(
                    req.headers.appname?req.headers.appname:""
                );

                return resolve({
                    result: languageLists.result,
                    message: languageLists.message
                });

            } catch (error) {
                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                });
            }
        })
    }

    // Dirty fix - Till the time product team gives the csv. 
    // We can change JSON into csv we want.

    translateIntoCsv(req) {
        return new Promise(async (resolve, reject) => {

            try {

                const fileName = `translate-language-to-csv`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let jsonKey = Object.keys(req.body);

                for (let pointer = 0; pointer < jsonKey.length; pointer++) {

                    let eachJsonKey = Object.keys(req.body[jsonKey[pointer]]);

                    for (let pointerToEachJson = 0; 
                        pointerToEachJson < eachJsonKey.length; 
                        pointerToEachJson++) {

                            let language = {};

                            language["key"] = 
                            jsonKey[pointer] + "_" + eachJsonKey[pointerToEachJson];

                            language["en"] = 
                            req.body[jsonKey[pointer]][eachJsonKey[pointerToEachJson]];

                            input.push(language);
                    }

                }

                input.push(null);
            }
            catch (error) {
                return reject(error);
            }
        })
    }

}