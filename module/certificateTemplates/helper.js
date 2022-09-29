/**
 * name : helper.js
 * author : Vishnu
 * created-date : 29-sep-2022
 * Description : Certificate Template related helper functionality.
*/

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
}
