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
            if ( certificateTemplateUpdated == null ) {
              throw{
                message: constants.apiResponses.CERTIFICATE_TEMPLATE_NOT_UPDATED
              }
            }
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
   * @param {String} templateId - templateId.
   * @param {String} userId - user Id.
   * @returns {JSON} Uploaded certificate template details. 
  */
  
  static uploadToCloud(fileData, templateId, userId = "") {
    return new Promise(async (resolve, reject) => {
        try {
          const now = new Date();
          const date = now.getDate() + "-"+ now.getMonth() + "-" + now.getFullYear() + "-" + now.getTime();
          const fileName = templateId + '/' + userId + "_" + date + ".svg"; 
          const requestData = {
            "templates": {
              "files": [fileName]
            }
          };

          let signedUrl =
          await filesHelpers.preSignedUrls(
            requestData, // data to upload
            constants.common.CERTIFICATE, // referenceType  
          );

          //  upload file using signed Url
          if (signedUrl.data && 
            Object.keys(signedUrl.data).length > 0 &&
            signedUrl.data.templates &&
            signedUrl.data.templates.files.length > 0 &&
            signedUrl.data.templates.files[0].url &&
            signedUrl.data.templates.files[0].url !== ""
          ) {
             
            let fileUploadUrl = signedUrl.data.templates.files[0].url;
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
                //  Update certificate template url in certificateTemplates collection
                let updateCertificateTemplate = await this.update(
                  templateId,
                  { 
                    // certificateTemplates/6343bd978f9d8980b7841e85/ba9aa220-ff1b-4717-b6ea-ace55f04fc16_2022-9-10-1665383945769.svg
                    templateUrl : signedUrl.data.templates.files[0].payload.sourcePath
                  }
                );
                
                return resolve({
                    success: true,
                    data: {
                      templateId: updateCertificateTemplate.data.id,
                      templateUrl: signedUrl.data.templates.files[0].payload.sourcePath
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
