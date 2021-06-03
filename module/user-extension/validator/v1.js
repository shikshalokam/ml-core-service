/**
 * name : v1.js
 * author : Aman Jung Karki
 * created-date : 09-Sep-2020
 * Description : User extension validation.
 */

module.exports = (req) => {
    
    let userExtensionValidator = {
        updateProfileRoles : function () {
            req.checkBody('stateId').exists().withMessage("State id is required");
            req.checkBody('roles').exists().withMessage("Roles data is required");
        },
        solutions: function () {
            req.checkParams('_id').exists().withMessage('Required program id');
        }
    }

    if ( userExtensionValidator[req.params.method] ) {
        userExtensionValidator[req.params.method]()
    }
}