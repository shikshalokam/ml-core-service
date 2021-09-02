/**
 * name : v1.js
 * author : Aman
 * created-date : 19-Jan-2021
 * Description : Programs validation.
 */

module.exports = (req) => {

    let programsValidator = {

        create : function () {
            req.checkBody('externalId').exists().withMessage("required program externalId");
            req.checkBody('name').exists().withMessage("required program name");
        },
        update : function () {
            req.checkParams("_id").exists().withMessage("required program id");
        },
        addRolesInScope : function () {
            req.checkParams("_id").exists().withMessage("required program id");
            req.checkBody("roles").exists().withMessage("required program roles to be added");
        },
        addEntitiesInScope : function () {
            req.checkParams("_id").exists().withMessage("required program id");
            req.checkBody("entities").exists().withMessage("required entities to be added");
        },
        removeRolesInScope : function () {
            req.checkParams("_id").exists().withMessage("required program id");
            req.checkBody("roles").exists().withMessage("required program roles to be added");
        },
        removeEntitiesInScope : function () {
            req.checkParams("_id").exists().withMessage("required program id");
            req.checkBody("entities").exists().withMessage("required entities to be added");
        }
    }

    if (programsValidator[req.params.method]) {
        programsValidator[req.params.method]();
    }

};