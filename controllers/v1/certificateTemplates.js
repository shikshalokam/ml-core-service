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
    * @api {post/patch} /kendra/api/v1/certificateTemplates/createOrUpdate
    * @apiVersion 1.0.0
    * @apiName Create certificate template
    * @apiGroup CertificateTemplates
    * @apiParamExample {json} Request-Body:
    *   {   "templateUrl" :"certificateTemplates/6343bd978f9d8980b7841e85/ba9aa220-ff1b-4717-b6ea-ace55f04fc16_2022-9-10-1665383945769.svg",
            "criteria" : {
                "validationText" : "Complete validation message",
                "expression" : "C1&&C2&&C3",
                "conditions" : {
                    "C1" : 	{
                        "validationText" : "Project Should be submitted within program Enddate",
                        "expression" : "C1&&C2",
                        "conditions" : {
                            "C1" : {
                                "scope" : "project",
                                "key" : "status",
                                "operator" : "==",
                                "value" : "submitted"
                            },
                            "C2" : {
                                "scope" : "project",
                                "key" : "completedDate",
                                "operator" : "<",
                                "value" : "15-08-2022"
                            }
                        }
                    },
                    "C2" : 	{
                        "validationText" : "Evidence project level validation",
                        "expression" : "C1",
                        "conditions" : {
                            "C1" : {
                                    "scope" : "project",
                                    "key" : "attachments",
                                    "function" : "count",
                                    "filter" : {
                                        "key" : "type",
                                        "value" : "all"
                                    },
                                    "operator" : ">",
                                    "value" : 1
                            }
                        }
                    },
                    "C3" : 	{
                        "validationText" : "Evidence task level validation",
                        "expression" : "C1&&C2&&C3",
                        "conditions" : {
                            "C1" : {
                                "scope" : "task",
                                "key" : "attachments",
                                "function" : "count",
                                "filter" : {
                                    "key" : "type",
                                    "value" : "all"
                                },
                                "operator" : ">",
                                "value" : 1
                            }
                        }
                    }
                }
            },
            "issuer": {
                "name":"Kerala"
            },
            "status" : "active",
            "solutionId" : "5ff9dc1b9259097d48017bbe",
            "programId" : "605083ba09b7bd61555580fb"

        }

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
     * Create/update certificate template.
     * @method
     * @name createOrUpdate
     * @param {Object} req - requested data.
     * @returns {JSON} Created certificate template data.
    */

    async createOrUpdate(req) {
        return new Promise(async (resolve, reject) => {
        try {
            if ( req.method === "POST" ) {
                let certificateTemplateData = await certificateTemplateHelper.create( req.body );
                certificateTemplateData["result"] = certificateTemplateData.data;
                return resolve(certificateTemplateData);
            } else if ( req.method === "PATCH" ) {
                let certificateTemplateData = await certificateTemplateHelper.update(
                    req.params._id, 
                    req.body, 
                );
                certificateTemplateData["result"] = certificateTemplateData.data;
                return resolve(certificateTemplateData);
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

    /**
    * @api {post} /kendra/api/v1/certificateTemplates/uploadCertificateTemplate
    * @apiVersion 1.0.0
    * @apiName upload certificate template
    * @apiGroup uploadCertificateTemplate
    * @apiHeader {String} internal-access-token - internal access token  
    * @apiHeader {String} X-authenticated-user-token - Authenticity token
    * @apiSampleRequest /kendra/api/v1/certificateTemplates/uploadCertificateTemplate
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *   {
            "message": "File uploaded successfully",
            "status": 200,
            "result": {
                "success": true,
                "data": {
                    "templateUrl": "certificateTemplates/6343bd978f9d8980b7841e85/ba9aa220-ff1b-4717-b6ea-ace55f04fc16_2022-9-10-1665383945769.svg"
                }
            }
        }
    */

    /**
     * uploadTemplate.
     * @method
     * @name uploadTemplate
     * @param {Object} req - requested data.
     * @returns {JSON} file uploaded details.
    */

     async uploadTemplate(req) {
        return new Promise(async (resolve, reject) => {
        try {

            if ( req.files && req.files.file ) {
                let uploadedTemplateDetails = 
                await certificateTemplateHelper.uploadToCloud( 
                    req.files,
                    req.params._id, 
                    req.userDetails ? req.userDetails.userId : "",
                    req.query.updateTemplate ? req.query.updateTemplate : true
                );
                return resolve({
                    message: constants.apiResponses.FILE_UPLOADED,
                    result: uploadedTemplateDetails
                })
            } else {
                return reject({
                    status: httpStatusCode["bad_request"].status,
                    message: httpStatusCode["bad_request"].message

                });
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
    /**
    * @api {post} /kendra/api/v1/certificateTemplates/createSvg
    * @apiVersion 1.0.0
    * @apiName createSvg certificate template svg
    * @apiGroup createSvg
    * @apiHeader {String} internal-access-token - internal access token  
    * @apiHeader {String} X-authenticated-user-token - Authenticity token
    * @apiSampleRequest /kendra/api/v1/certificateTemplates/createSvg?baseTemplateId=
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *   {
            "message": "Template edited successfully",
            "status": 200,
            "result": {
                "url": "https://sunbirdstagingpublic.blob.core.windows.net/samiksha/certificateTemplates/BASE_TEMPLATE/_22-10-2022-1669120782574.svg?sv=2020-10-02&st=2022-11-22T12%3A39%3A42Z&se=2023-11-22T12%3A49%3A42Z&sr=b&sp=rw&sig=gLnKb1T32swAQQ%2Bgtaaa967d6c0GIL%2FGRcGCwjvpI30%3D"
        }
}
    */

    /**
     * generate cettificate templateSvg.
     * @method
     * @name createSvg
     * @param {Object} req - requested data.
     * @returns {JSON} -svg uploaded details.
    */

     async createSvg(req) {
        return new Promise(async (resolve, reject) => {
        try {

            let svgData = await certificateTemplateHelper.createSvg(req.files, req.body, req.query.baseTemplateId);
            return resolve(svgData);
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