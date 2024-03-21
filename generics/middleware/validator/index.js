/**
 * name : middleware/validator.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : validation for endpoints.
 */


//dependencies
let fs = require("fs");

module.exports = (req, res, next) => {
    let validatorPath;
    if (req.params.file) {
        validatorPath =
         ROOT_PATH + `/module/${req.params.controller}/${req.params.file}/validator/${req.params.version}.js`;
    } else {
        validatorPath = 
        ROOT_PATH + `/module/${req.params.controller}/validator/${req.params.version}.js`;
    }

    if (fs.existsSync(validatorPath)) require(validatorPath.replace(/\.\.\//g, ''))(req)
    

    next();

    return

}