/**
 * name : v1.js
 * author : Aman
 * created-date : 19-Jan-2021
 * Description : Solutions validation.
 */

module.exports = (req) => {

    let solutionsValidator = {

        create : function () {
            req.checkBody('programExternalId').exists().withMessage("required program externalId");
            req.checkBody('externalId').exists().withMessage("required solution externalId");
            req.checkBody('name').exists().withMessage("required solution name");
            req.checkBody('type').exists().withMessage("required solution type");
            req.checkBody('subType').exists().withMessage("required solution subType");
        },
        update : function () {
            req.checkParams("_id").exists().withMessage("required solution id");
        },
        forUserRoleAndLocationDetails : function () {
            req.checkParams("_id").exists().withMessage("Required solution id");
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
        },
        details : function () {
            req.checkParams("_id").exists().withMessage("required solution id");
        },
        getSolutions : function () {
            req.checkQuery("type").exists().withMessage("required solution type")
        },
        targetedEntity : function () {
            req.checkParams("_id").exists().withMessage("required solution id");
        }
    }

    if (solutionsValidator[req.params.method]) {
        solutionsValidator[req.params.method]();
    }

};