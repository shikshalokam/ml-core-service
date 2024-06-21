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
        },
        getAllStats:function(){
            req.checkQuery('type').optional().isIn(['observation', 'project', 'survey', 'program']) // If present, it must be one of these values
            .withMessage('Invalid type. Allowed values are observation, project, survey, program.')
        }

    }

    if (userValidator[req.params.method]) {
        userValidator[req.params.method]();
    }

};