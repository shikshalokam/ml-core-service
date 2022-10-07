/**
 * name : v1.js
 * author : Vishnu
 * created-date : 29-Sep-2022
 * Description : Certificate Template Validation.
*/

module.exports = (req) => {

    let certificateTemplatesValidator = {

        create : function () {
            if ( req.method === "POST" ) {
                req.checkBody('solutionId', 'solutionId is required').exists({checkFalsy: true}).isLength({ min: 1 });
                req.checkBody('programId', 'programId is required').exists({checkFalsy: true}).isLength({ min: 1 });
                req.checkBody("issuer").exists().withMessage("issuer is required");
                req.checkBody("criteria").exists().withMessage("criteria is required");
                req.checkBody("status").exists().withMessage("status is required");
            } else if ( req.method === "PATCH" ) {
                req.checkParams("_id").exists().withMessage("required certificate templateId");
            }
            
        },
        uploadCertificateTemplate : function () {
            req.checkParams("_id").exists().withMessage("required certificate templateId");
        }
    }

    if (certificateTemplatesValidator[req.params.method]) {
        certificateTemplatesValidator[req.params.method]();
    }

};