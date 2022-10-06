/**
 * name : helper.js
 * author : Vishnu
 * created-date : 29-sep-2022
 * Description : Certificate Template related helper functionality.
*/
// dependencies
const filesHelpers = require(ROOT_PATH+"/module/cloud-services/files/helper");
const request = require("request");

const { ObjectId } = require("mongodb");

/**
    * CertificateTemplatesHelper
    * @class
*/
module.exports = class CertificateTemplatesHelper {

  /**
   * Create certificate template.
   * @method create
   * @name create
   * @param {Object} data - certificate template creation data.
   * @returns {JSON} created certificate template details. 
   */
  
  static create(data) {
    return new Promise(async (resolve, reject) => {
        try {
            data.issuer.kid = process.env.CERTIFICATE_ISSUER_KID;
            let certificateTemplateCreated = 
            await database.models.certificateTemplates.create(
              data
            );
            return resolve({
                message : constants.apiResponses.CERTIFICATE_TEMPLATE_ADDED,
                data : {
                  id : certificateTemplateCreated._id
                }
              });
            
        } catch (error) {
            return reject(error);
        }
    });
  }

  /**
   * Update certificate template.
   * @method update
   * @name update
   * @param {String} templateId - certificate template Id.
   * @param {Object} data - certificate template updation data.
   * @returns {JSON} Updated certificate template details. 
  */
  
  static update(templateId, data) {
    return new Promise(async (resolve, reject) => {
        try {
            //  Adding issuer kid from env
            if ( data.issuer ) {
                data.issuer.kid = process.env.CERTIFICATE_ISSUER_KID;
            }
            //  If templateUrl value passed as empty string. 
            if ( !data.templateUrl ) {
                delete data.templateUrl;
            }
            //  If solutionId value passed as empty string. 
            if ( !data.solutionId ) {
                delete data.solutionId;
            }
            //  If programId value passed as empty string. 
            if ( !data.programId ) {
                delete data.programId;
            }
            let updateObject = {
                "$set" : data
              };
            let certificateTemplateUpdated = 
            await database.models.certificateTemplates.findOneAndUpdate(
                {_id: templateId},
                updateObject
            );
            return resolve({
                message : constants.apiResponses.CERTIFICATE_TEMPLATE_UPDATED,
                data : {
                  id : certificateTemplateUpdated._id
                }
              });
            
        } catch (error) {
            return reject(error);
        }
    });    
  }

  /**
   * upload certificate template.
   * @method uploadToCloud
   * @name uploadToCloud
   * @param {Object} fileData - file to upload.
   *  @param {String} userId - user Id.
   * @returns {JSON} Uploaded certificate template details. 
  */
  
  static uploadToCloud(fileData, userId = "") {
    return new Promise(async (resolve, reject) => {
        try {
          const requestData = {
            "template": {
              "files": [fileData.file.name]
            }
          };
          let signedUrl =
          await filesHelpers.preSignedUrls(
              requestData,
              constants.common.CERTIFICATE,
              userId
          );
          
          //  upload file using signed Url
          if (signedUrl.data && 
            Object.keys(signedUrl.data).length > 0 &&
            signedUrl.data.template &&
            signedUrl.data.template.files.length > 0 &&
            signedUrl.data.template.files[0].url &&
            signedUrl.data.template.files[0].url !== ""
          ) {
             
            let fileUploadUrl = signedUrl.data.template.files[0].url;
            let file = fileData.file.data;
           
            try { 
                await request({
                  url: fileUploadUrl,
                  method: 'put',
                  headers: {
                      "x-ms-blob-type" : "BlockBlob",
                      "Content-Type": "multipart/form-data"
                    },
                  body: file
                })
                
                return resolve({
                    success: true,
                    data: {
                      templateUrl: signedUrl.data.template.files[0].payload.sourcePath
                    }
                })
                
            } catch (error) {
              return reject(error);
            }
          }
          else {
              return resolve({
                  success: false
              })
          }    
        } catch (error) {
            return reject(error);
        }
    });    
  }
}
