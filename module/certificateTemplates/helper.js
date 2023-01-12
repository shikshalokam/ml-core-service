/**
 * name : helper.js
 * author : Vishnu
 * created-date : 29-sep-2022
 * Description : Certificate Template related helper functionality.
*/
// dependencies
const request = require("request");
let fs = require('fs');
const cheerio = require('cheerio');
const filesHelpers = require(ROOT_PATH+"/module/cloud-services/files/helper");

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

          // in case support team pass below values as empty string (not valid) we cant check it with validator. So adding it here
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
   * @method 
   * @name uploadToCloud
   * @param {Object} fileData - file to upload.
   * @param {String} templateId - templateId.
   * @param {String} userId - user Id.
   * @returns {JSON} Uploaded certificate template details. 
  */
  
  static uploadToCloud(fileData, templateId, userId = "", updateTemplate) {
    return new Promise(async (resolve, reject) => {
        try {
          let fileName;
          const now = new Date();
          const date = now.getDate() + "-"+ now.getMonth() + "-" + now.getFullYear() + "-" + now.getTime();
          if ( updateTemplate == false ) {
            fileName = userId + "_" + date + ".svg"; 
          } else {
            fileName = templateId + '/' + userId + "_" + date + ".svg"; 
          }
          
          const requestData = {
            "templates": {
              "files": [fileName]
            }
          };

          let referenceType;
          if ( updateTemplate == false ) {
            referenceType = "baseTemplates"
          } else {
            referenceType = constants.common.CERTIFICATE
          }

          let signedUrl =
          await filesHelpers.preSignedUrls(
            requestData, // data to upload
            referenceType, // referenceType  
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
              let updateCertificateTemplate = {};
              if (updateTemplate === true) {
                //  Update certificate template url in certificateTemplates collection
                updateCertificateTemplate = await this.update(
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
              }
              return resolve({
                success: true,
                data: {
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

  /**
   * create svg template by editing base template.
   * @method 
   * @name createSvg
   * @param {Object} files - file to replace.
   * @param {Object} textData - texts to edit.
   * @param {String} baseTemplateId - Base template Id.
   * @returns {JSON} Uploaded certificate template details. 
  */
  static createSvg( files, textData, baseTemplateId ) {
    return new Promise(async (resolve, reject) => {
        try {
          let baseTemplateData = await database.models.certificateBaseTemplates.find({
            _id: baseTemplateId
          },["url"]).lean();
          
          if ( !baseTemplateData.length > 0 || !baseTemplateData[0].url || baseTemplateData[0].url == "" ) {
            throw {
              message: constants.apiResponses.BASE_CERTIFICATE_TEMPLATE_NOT_FOUND
            }
          }
          let templateUrl = baseTemplateData[0].url;
          // getDownloadable url of svg file that we are using as template
          let baseTemplateDownloadableUrl = await filesHelpers.getDownloadableUrl([templateUrl]);
          let baseTemplate = await getBaseTemplate( baseTemplateDownloadableUrl.result[0].url)
          if ( !baseTemplate.success ) {
            throw {
              message: constants.apiResponses.BASE_CERTIFICATE_TEMPLATE_NOT_FOUND
            }
          }
          // load Base template svg elements
          const $ = cheerio.load(baseTemplate.result);
          let htmltags = ["<html>","</html>","<head>","</head>","<body>","</body>"];
          let imageNames = ["stateLogo1","stateLogo2","signatureImg1","signatureImg2"];
          let textKeys = ["stateTitle","signatureTitle1a","signatureTitle2a"];

          // edit image elements
          for ( let imageNamesIndex = 0; imageNamesIndex < imageNames.length; imageNamesIndex++ ) {

            if ( files[imageNames[imageNamesIndex]] && files[imageNames[imageNamesIndex]]['data'] && files[imageNames[imageNamesIndex]]['data'] != "" ) {
              let data = files[imageNames[imageNamesIndex]]['data'];
              let imageData = 'data:image/png;base64,' + data.toString('base64');
              const element = $('#' + imageNames[imageNamesIndex]);
              element.attr('href',imageData);
            }

          }

          // edit text elements
          for ( let textKeysIndex = 0; textKeysIndex < textKeys.length; textKeysIndex++ ) {

            if ( textData[textKeys[textKeysIndex]] ) {
              let updateText = textData[textKeys[textKeysIndex]];
              const element = $('#' + textKeys[textKeysIndex]);
              element.text(updateText);
            }
          }
          let updatedSvg = $.html();

          // remove html tags- svg file does not require these tags 
          for ( let index = 0; index < htmltags.length; index++ ) {
              updatedSvg = updatedSvg.replace( htmltags[index], "" );
          }

          // file data to upload to cloud
          let fileData = {
            file : {
              data: updatedSvg
            }
          };
          // upload new svg created from base template to cloud
          const uploadTemplate = await this.uploadToCloud(fileData, "BASE_TEMPLATE", "", false )
          if ( !uploadTemplate.success ) {
            throw {
              message : constants.apiResponses.COULD_NOT_UPLOAD_CONTENT
            }
          }

          // getDownloadable url of uploaded template
          let downloadableUrl = await filesHelpers.getDownloadableUrl([uploadTemplate.data.templateUrl]);
          return resolve({
            message: "Template edited successfully",
            result: {
              url: downloadableUrl.result[0].url
            }
          });
        } catch (error) {
            return reject(error);
        }
    })
  }

}

// Function to fetch data information from cloud using downloadable Url
const getBaseTemplate = function ( templateUrl ) {
  return new Promise(async (resolve, reject) => {
      try {
        request.get(templateUrl, function (error, response, body) {
          if (!error && response.statusCode == 200) {
              
            return resolve({
              success: true,
              result: body
            });
          } else {
            throw {
              success: false
            }
          }
        });
          
      } catch (error) {
          return reject(error);
      }
  })
}
