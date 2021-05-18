/**
 * name : v1.js
 * author : Aman Jung Karki
 * created-date : 13-04-2020
 * Description : All bodh batch validation.
 */

module.exports = (req) => {

    let platformValidator = {
        
        enroll: function () {
            req.checkBody('batchId').exists().withMessage("required batch id");
            req.checkBody('userIds').exists().withMessage("required user ids");
        }
    }

    if (platformValidator[req.params.method]) {
        platformValidator[req.params.method]();
    }

};