module.exports = (req) => {

    let appsValidator = {

        getDetails: function () {
            req.checkParams('_id').exists().withMessage("required app name").notEmpty().withMessage("required app name");
        }
    }

    if (appsValidator[req.params.method]) {
        appsValidator[req.params.method]();
    }

};