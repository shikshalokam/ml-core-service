/**
 * name : middleware/set-language.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Set language authentication.
 */

// dependencies
const languageList = require(ROOT_PATH + "/generics/languages");

module.exports = (req, res, next) => {
    if ((req.method == "GET" || req.method == "POST") && !req.path.includes("/language/")) {

        if (req.headers && req.headers["translation-language"]) {
            req.translationLanguage = req.headers["translation-language"];
        } else {
            req.translationLanguage = "english"
        }

        req.i18n.changeLanguage(languageList[req.translationLanguage]);
    }

    next();
    return;
}


