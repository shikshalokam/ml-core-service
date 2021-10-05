module.exports = (req) => {

    let userProfileValidator = {

    }

    if (userProfileValidator[req.params.method]) {
        userProfileValidator[req.params.method]();
    }

};