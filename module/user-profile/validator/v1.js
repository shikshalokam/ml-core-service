module.exports = (req) => {

    let userProfileValidator = {

        getForm : function() {
            req.checkHeaders('appname').exists().withMessage("required app name in headers");
            req.checkHeaders('os').exists().withMessage('required os in headers');
        },
        save: function () {
            req.checkBody('data').exists().withMessage("Required meta information data");
        }

    }

    if (userProfileValidator[req.params.method]) {
        userProfileValidator[req.params.method]();
    }

};