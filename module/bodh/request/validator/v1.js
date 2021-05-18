/**
 * name : v1.js
 * author : Aman
 * created-date : 06-04-2020
 * Description : Bodh request validator.
 */

module.exports = (req) => {

    let bodhRequestValidator = {
        
        middleware : function () {
            req.checkBody('url').exists().withMessage("required url");
            req.checkBody('method').exists().withMessage("required method");
            req.checkBody('headers').exists().withMessage("required headers");
        }
    }

    if (bodhRequestValidator[req.params.method]) {
        bodhRequestValidator[req.params.method]();
    }

};