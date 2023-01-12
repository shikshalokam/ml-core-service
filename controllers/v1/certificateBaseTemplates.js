/**
 * name : certificateBaseTemplates.js
 * author : Vishnu
 * created-date : 11-Jan-2023
 * Description : Certificate base template related information.
*/

//  Dependencies
const certificateBaseTemplateHelper = require(MODULES_BASE_PATH + "/certificateBaseTemplates/helper");

module.exports = class CertificateBaseTemplates extends Abstract {
    //  Adding model schema
    constructor() {
        super(schemas["certificateBaseTemplates"]);
    }

    /**
    * @api {post/patch} /kendra/api/v1/certificateBaseTemplates/createOrUpdate
    * @apiVersion 1.0.0
    * @apiName Create certificate template
    * @apiGroup certificateBaseTemplates
    * @apiParamExample {json} Request-Body:
    *   {   
            "code": "SingleLogoSingleSign"
        }

    * @apiHeader {String} internal-access-token - internal access token  
    * @apiHeader {String} X-authenticated-user-token - Authenticity token
    * @apiSampleRequest /kendra/api/v1/certificateBaseTemplates/createOrUpdate
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *   {
            "status": 200,
            "message": "Base template added successfully",
            "result": {
                    id": "6011136a2d25b926974d9ec9"
            }
        }
    */

    /**
     * Create/update certificate base template.
     * @method
     * @name createOrUpdate
     * @param {Object} req - requested data.
     * @returns {JSON} Created certificate base template data.
    */

    async createOrUpdate(req) {
        return new Promise(async (resolve, reject) => {
        try {
            if ( req.method === "POST" ) {
                if ( req.files && req.files.file ) {
                    let certificateBaseTemplateData = await certificateBaseTemplateHelper.create( req.body, req.files, req.userDetails.userId );
                    certificateBaseTemplateData["result"] = certificateBaseTemplateData.data;
                    return resolve(certificateBaseTemplateData);
                } else {
                    throw ({
                        status: httpStatusCode["bad_request"].status,
                        message: httpStatusCode["bad_request"].message
                    });
                }
            } else if ( req.method === "PATCH" ) {
                let certificateBaseTemplateData = await certificateBaseTemplateHelper.update(
                    req.params._id,
                    req.body,
                    req.files,
                    req.userDetails.userId
                );
                certificateBaseTemplateData["result"] = certificateBaseTemplateData.data;
                return resolve(certificateBaseTemplateData);
            }
        } catch (error) {
            return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error
            });
        }
        });
    }
}