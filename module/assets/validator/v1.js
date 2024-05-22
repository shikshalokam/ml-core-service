
module.exports = (req) => {

    let assetsValidator = {

        list : function () {
            req.checkBody('filters').exists().withMessage("required filters");
        },
       
    }

    if (assetsValidator[req.params.method]) {
        assetsValidator[req.params.method]();
    }

};