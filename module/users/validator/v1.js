module.exports = (req) => {

    let userValidator = {
        
        solutions : function () {
            req.checkParams('_id').exists().withMessage("required Program id");
        },
        entityTypesByLocationAndRole : function () {
            req.checkParams('_id').exists().withMessage("required location id");
            req.checkQuery('role').exists().withMessage("required role code");
        },
        targetedEntity : function () {
            req.checkParams("_id").exists().withMessage("required solution id");
            req.checkBody("role").exists().withMessage("required user role");
        }

    }

    if (userValidator[req.params.method]) {
        userValidator[req.params.method]();
    }

};