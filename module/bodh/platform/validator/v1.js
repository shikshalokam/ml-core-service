/**
 * name : bodh/platform/validator/v1.js
 * author : Aman Jung Karki
 * created-date : 27-Feb-2020
 * Description : All bodh platform validation.
 */

module.exports = (req) => {

    let platformValidator = {
        
        generate: function () {
            req.checkBody('contentData').exists().withMessage("required content data");
        },
        uploadScromContent : function () {
            req.checkQuery('name').exists().withMessage("required content name").not().isEmpty().withMessage("Name should not be empty");
        }
    }

    if (platformValidator[req.params.method]) {
        platformValidator[req.params.method]();
    }

};