


const assetsHelper = require(MODULES_BASE_PATH + "/assets/helper.js");

module.exports = class Assets {

    

list(req) {
    return new Promise(async (resolve, reject) => {
        try {
            
            let assestsData = 
            await assetsHelper.fetchPrograms(
            req.query.type,
            req.body,
        );
            
            return resolve(assestsData);
        } catch (error) {
            return reject({
                status: error.status || httpStatusCode.internal_server_error.status,
                message: error.message || httpStatusCode.internal_server_error.message,
                errorObject: error
            });
        }
    });
}

}