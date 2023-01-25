/**
 * name : routes/index.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : All routes.
 */

// dependencies
const authenticator = require(ROOT_PATH + "/generics/middleware/authenticator");
const pagination = require(ROOT_PATH + "/generics/middleware/pagination");
const fs = require("fs");
const inputValidator = require(ROOT_PATH + "/generics/middleware/validator");
const dataSetUpload = require(ROOT_PATH + "/generics/middleware/dataSetUpload");

module.exports = function (app) {

  app.use(authenticator);
  app.use(dataSetUpload);
  app.use(pagination);

  var router = async function (req, res, next) {
    console.log("Request reched to route")

    if (!req.params.version) {
      next();
    } else if (!controllers[req.params.version]) {
      next();
    } else if (!controllers[req.params.version][req.params.controller]) {
      next();
    }
    else if (!(controllers[req.params.version][req.params.controller][req.params.method] 
      || controllers[req.params.version][req.params.controller][req.params.file][req.params.method])) {
      next();
    }
    else if (req.params.method.startsWith("_")) {
      next();
    } else {

      try { 

        let validationError = req.validationErrors();

        if (validationError.length){
          throw { status: 400, message: validationError };
        }

        let result;

        if (req.params.file) {
          result = 
          await controllers[req.params.version][req.params.controller][req.params.file][req.params.method](req);
        } else {
          result = 
          await controllers[req.params.version][req.params.controller][req.params.method](req);
        }

        if (result.isResponseAStream == true) {
          fs.exists(result.fileNameWithPath, function (exists) {

            if (exists) {

              res.setHeader(
                'Content-disposition', 
                'attachment; filename=' + result.fileNameWithPath.split('/').pop()
              );
              res.set('Content-Type', 'application/octet-stream');
              fs.createReadStream(result.fileNameWithPath).pipe(res);

            } else {

              throw {
                status: 500,
                message: "Oops! Something went wrong!"
              };

            }

          });

        } else {
          res.status(result.status ? result.status : httpStatusCode["ok"].status).json({
            message: result.message,
            status: result.status ? result.status : httpStatusCode["ok"].status,
            result: result.data,
            result: result.result,
            additionalDetails: result.additionalDetails,
            pagination: result.pagination,
            totalCount: result.totalCount,
            total: result.total,
            count: result.count,
            failed: result.failed
          });

          console.log('-------------------Response log starts here-------------------');
          console.log("%j",result);
          console.log('-------------------Response log ends here-------------------');
        }

      }
      catch (error) {
        res.status(error.status ? error.status : httpStatusCode.bad_request.status).json({
          status: error.status ? error.status : httpStatusCode.bad_request.status,
          message: error.message
        });

        console.log("error is",error);
        
      };
    }
  };

  app.all("/:version/:controller/:method", inputValidator, router);
  app.all("/:version/:controller/:file/:method", inputValidator, router);
  app.all("/:version/:controller/:method/:_id", inputValidator, router);
  app.all("/:version/:controller/:file/:method/:_id", inputValidator, router);

  app.use((req, res, next) => {
    res.status(httpStatusCode["not_found"].status).send(httpStatusCode["not_found"].message);
  });
};
