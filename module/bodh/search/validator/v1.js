module.exports = (req) => {

    let searchRequestValidator = {
        
        middleware: function () {
            req.checkBody('url').exists()
            .notEmpty()
            .custom((value) => (value) ? gen.utils.checkIfURLIsSunbirdAPI(value) : false)
            .withMessage("required valid url");
            req.checkBody('headers').exists().withMessage("required headers");
            req.checkBody('body').exists().withMessage("required body");
            req.checkBody('body.request.query').exists().not().isEmpty().trim().escape().withMessage("required query string");
        },
        autocomplete: function () {
            req.checkBody('request.query').exists().not().isEmpty().trim().escape().withMessage("required query string url");
        }
    }

    if (searchRequestValidator[req.params.method]) {
        searchRequestValidator[req.params.method]();
    }

};