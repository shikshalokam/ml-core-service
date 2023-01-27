/**
 * name : consent.js
 * author : Ankit Shahu
 * Date : 24-jan-2023
 * Description : Sunbird Consent API.
 */

//dependencies
const request = require('request');
const sunbirdServiceUrl = process.env.SUNBIRD_SERVICE_URL;

const consent = function ( token,consentData ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            let url = sunbirdServiceUrl + constants.endpoints.CONSENT_API;

            const options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token,
                    "Authorization" : process.env.SUNBIRD_SERVICE_AUTHERIZATION
                },
                body: JSON.stringify(consentData) 
            };
            console.log(url)
            console.log(JSON.stringify(options))
            request.post(url,options,kendraCallback);

            function kendraCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    if( response.responseCode === httpStatusCode['http_responsecode_ok'].message ) {
                        result["data"] = response;
                    } else {
                        result["message"] = response;
                        result.success = false;
                    }

                }
                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

  
module.exports = {
    consent : consent
}
