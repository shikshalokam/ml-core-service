/**
 * name : v1.js
 * author : Aman
 * created-date : 25-Nov-2020
 * Description : Forms validation.
 */

module.exports = (req) => {

    let formsValidator = {

        details : function () {
            req.checkParams('_id').exists().withMessage("required form name")
        },
        create : function () {
            req.checkBody('name').exists().withMessage("required form name");
            req.checkBody('value').exists().withMessage("required form value");
        },
        update : function () {
            req.checkParams('_id').exists().withMessage("required form name")
            req.checkBody('value').exists().withMessage("required form value");
        }
    }

    if (formsValidator[req.params.method]) {
        formsValidator[req.params.method]();
    } 

};