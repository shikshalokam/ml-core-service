module.exports = (req) => {

    let applicationConfigValidator = {

        listLanguage: function () {
            req.checkParams('_id').exists().withMessage("required language id");
        }

    }

    if (applicationConfigValidator[req.params.method]) {
        applicationConfigValidator[req.params.method]();
    }

};