/**
 * name : v1.js
 * author : Aman Jung Karki
 * created-date : 09-Sep-2020
 * Description : User extension validation.
 */

module.exports = (req) => {
    
    let userExtensionValidator = {
        solutions: function () {
            req.checkParams('_id').exists().withMessage('Required program id');
        }
    }

    if ( userExtensionValidator[req.params.method] ) {
        userExtensionValidator[req.params.method]()
    }
}