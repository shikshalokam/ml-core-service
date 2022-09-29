/**
 * name : v1.js
 * author : Vishnu
 * created-date : 29-Sep-2022
 * Description : Certificate Template Validation.
*/

module.exports = (req) => {

    let certificateTemplatesValidator = {

        create : function () {
            req.checkBody('templateUrl', 'templateUrl is required').exists({checkFalsy: true}).isLength({ min: 1 });
            req.checkBody('solutionId', 'solutionId is required').exists({checkFalsy: true}).isLength({ min: 1 });
            req.checkBody('programId', 'programId is required').exists({checkFalsy: true}).isLength({ min: 1 });
            req.checkBody("issuer").exists().withMessage("issuer is required");
            req.checkBody("criteria").exists().withMessage("criteria is required");
        },
        update : function () {
            req.checkParams("_id").exists().withMessage("required certificate templateId");
        },
    }

    if (certificateTemplatesValidator[req.params.method]) {
        certificateTemplatesValidator[req.params.method]();
    }

};