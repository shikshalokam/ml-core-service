/**
 * name : helper.js
 * author : Vishnu
 * created-date : 11-Jan-2023
 * Description : Certificate Template related helper functionality.
*/
// dependencies
const certificateTemplateHelper = require(MODULES_BASE_PATH + "/certificateTemplates/helper");

/**
    * CertificateBaseTemplatesHelper
    * @class
*/
module.exports = class CertificateBaseTemplatesHelper {

  /**
   * Create certificate base template.
   * @method create
   * @name create
   * @param {Object} data - certificate base template creation data.
   * @returns {JSON} created certificate base template details. 
   */
  
  static create( data, file, userId ) {
    return new Promise(async (resolve, reject) => {
        try {
            let uploadFile = await certificateTemplateHelper.uploadToCloud( file, "", userId, false );
            if( !uploadFile.success ) {
              throw ({
                message: constants.apiResponses.COULD_NOT_UPLOAD_CONTENT
              })
            }
            data.url = uploadFile.data.templateUrl;
            let certificateTemplateCreated = 
            await database.models.certificateBaseTemplates.create(
              data
            );
            return resolve({
              message : constants.apiResponses.CERTIFICATE_BASE_TEMPLATE_ADDED,
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
   * Update certificate base template.
   * @method update
   * @name update
   * @param {Object} data - certificate template updation data.
   * @param {String} baseTemplateId - certificate template Id.
   * @param {String} file - file.
   * @param {String} userId - userId.
   * @returns {JSON} Updated certificate template details. 
  */
  
  static update( baseTemplateId, data, file = {}, userId ) {
    return new Promise(async (resolve, reject) => {
        try {
          if ( Object.keys(file).length > 0 ) {
            let uploadFile = await certificateTemplateHelper.uploadToCloud( file, "", userId, false );
            if( !uploadFile.success ) {
              throw ({
                message: constants.apiResponses.COULD_NOT_UPLOAD_CONTENT
              })
            }
            data.url = uploadFile.data.templateUrl;
          }
          
          let updateObject = {
            "$set" : data
          };
          let certificateBaseTemplateUpdated = 
          await database.models.certificateBaseTemplates.findOneAndUpdate(
            { _id : baseTemplateId },
            updateObject
          );
          if ( certificateBaseTemplateUpdated == null ) {
            throw{
              message: constants.apiResponses.CERTIFICATE_BASE_TEMPLATE_NOT_UPDATED
            }
          }
          return resolve({
            message : constants.apiResponses.CERTIFICATE_BASE_TEMPLATE_UPDATED,
            data : {
              id : certificateBaseTemplateUpdated._id
            }
          });
            
        } catch (error) {
          return reject(error);
        }
    });    
  }

}
