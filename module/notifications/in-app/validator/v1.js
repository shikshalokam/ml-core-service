module.exports = (req) => {

    let notificationsValidator = {

        markAsRead: function () {
            req.checkParams('_id').exists().withMessage("required notification id")
        }

    }

    if (notificationsValidator[req.params.method]) {
        notificationsValidator[req.params.method]();
    }

};