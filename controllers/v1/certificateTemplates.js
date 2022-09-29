/**
 * name : certificateTemplates.js
 * author : Vishnu
 * created-date : 29-Sep-2022
 * Description : Certificate template related information.
*/

//  Dependencies
const certificateTemplateHelper = require(MODULES_BASE_PATH + "/certificateTemplates/helper");

module.exports = class CertificateTemplates extends Abstract {
    //  Adding model schema
    constructor() {
        super(schemas["certificateTemplates"]);
    }

    /**
    * @api {post} /kendra/api/v1/certificateTemplates/create 
    * @apiVersion 1.0.0
    * @apiName Create solution
    * @apiGroup CreateTemplates
    * @apiParamExample {json} Request-Body:
    *                                       <---- Add request body here----->
    * @apiHeader {String} internal-access-token - internal access token  
    * @apiHeader {String} X-authenticated-user-token - Authenticity token
    * @apiSampleRequest /kendra/api/v1/certificateTemplates/create
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *   {
            "status": 200,
            "message": "Template added successfully",
            "result": {
                    id": "6011136a2d25b926974d9ec9"
            }
        }
    */

    /**
     * Create certificate template.
     * @method
     * @name create
     * @param {Object} req - requested data.
     * @returns {JSON} Created certificate template data.
    */

    async create(req) {
        return new Promise(async (resolve, reject) => {
        try {
            let certificateTemplateData = await certificateTemplateHelper.create( req.body );
            certificateTemplateData["result"] = certificateTemplateData.data;
            return resolve(certificateTemplateData);

        } catch (error) {
            return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error
            });
        }
        });
    }

    /**
     * @api {patch} /kendra/api/v1/certificateTemplates/update/:certificate templateId
     * @apiVersion 1.0.0
     * @apiName Update Certificate Template
     * @apiGroup CreateTemplates
     * @apiSampleRequest /kendra/api/v1/certificateTemplates/update/63358e94848b9be74d482b29
     * @apiHeader {String} internal-access-token internal access token 
     * @apiHeader {String} X-authenticated-user-token Authenticity token  
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
            "status": 200,
            "message": "Template updated successfully",
            "result": {
                    id": "63358e94848b9be74d482b29"
            }
        }
    */

    /**
     * Update certificate template.
     * @method
     * @name update
     * @param {Object} req - requested data.
     * @param {String} req.params._id -  certificate template Id.
     * @returns {JSON} Certificate updation status
    */

    async update(req) {
        return new Promise(async (resolve, reject) => {
        try {

            let certificateTemplateData = await certificateTemplateHelper.update(
                req.params._id, 
                req.body, 
            );
            certificateTemplateData["result"] = certificateTemplateData.data;
            return resolve(certificateTemplateData);
        }
        catch (error) {
            reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error
            })
        }
        })
    } 

}