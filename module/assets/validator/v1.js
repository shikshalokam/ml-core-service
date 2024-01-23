
module.exports = (req) => {

    let assetsValidator = {

        list : function () {
            req.checkBody('filters').exists().withMessage("required filters");
            req.checkBody('filters.orgId').exists().withMessage("required orgId");

        },
       
    }

    if (assetsValidator[req.params.method]) {
        assetsValidator[req.params.method]();
    }

};