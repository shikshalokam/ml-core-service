module.exports = (req) => {

    let slackValidator = {

        error: function () {
            req.checkBody('slackErrorName').exists()
            .withMessage("required error title for slack");
            req.checkBody("message").exists().withMessage("required error messages");
            req.checkBody('Environment').exists().withMessage("required node env");
        },

    }

    if (slackValidator[req.params.method]) {
        slackValidator[req.params.method]();
    }

};