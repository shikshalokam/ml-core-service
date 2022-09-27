/**
 * name : v1.js
 * author : Priyanka Pradeep
 * created-date : 25-Sep-2022
 * Description : Admin validation.
 */

module.exports = (req) => {

    let adminValidator = {

        dbFind : function () {
            req.checkParams("_id").exists().withMessage("required mongodb collection name");
            req.checkBody("query").exists().withMessage("required mongoDB find query");
        },
        dbDelete : function () {
            req.checkParams("_id").exists().withMessage("required mongodb collection name");
            req.checkBody("query").exists().withMessage("required mongoDB find query");
        },
        dbUpdate : function () {
            req.checkParams("_id").exists().withMessage("required mongodb collection name");
            req.checkBody("findQuery").exists().withMessage("required mongoDB find query");
            req.checkBody("updateQuery").exists().withMessage("required mongoDB update query");
        },
        dbCreate : function () {
            req.checkParams("_id").exists().withMessage("required mongodb collection name");
        },
    }

    if (adminValidator[req.params.method]) {
        adminValidator[req.params.method]();
    }

};