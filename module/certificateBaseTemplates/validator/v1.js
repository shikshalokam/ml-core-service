/**
 * name : v1.js
 * author : Vishnu
 * created-date : 11-Jan-2023
 * Description : Certificate Base Template Validation.
*/

module.exports = (req) => {

    let certificateBaseTemplatesValidator = {

        createOrUpdate : function () {
            if ( req.method === "POST" ) {
                req.checkBody("code").exists().withMessage("Base template code required");
                req.checkBody("name").exists().withMessage("Base template name required");
            } else if ( req.method === "PATCH" ) {
                req.checkParams("_id").exists().withMessage("Base template Id required");
                req.checkParams("_id").isMongoId().withMessage("Base template Id is not valid");
            }   
        }
    }

    if (certificateBaseTemplatesValidator[req.params.method]) {
        certificateBaseTemplatesValidator[req.params.method]();
    }

};