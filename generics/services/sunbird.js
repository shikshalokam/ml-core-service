/**
 * name : sunbird.js
 * author : Vishnudas
 * Date : 22-Feb-2022
 * Description : All Sunbird learner related api call.
 */

//dependencies


const request = require('request');
const sunbirdBaseUrl = process.env.SUNBIRD_SERVICE_URL;

/**
  * 
  * @function
  * @name learnerLocationSearch
  * @param {String} bearerToken - autherization token.
  * @param {object} bodyData -  bodydata .
  * @returns {Promise} returns a promise.
*/

const learnerLocationSearch = function ( bodyData ) {
  return new Promise(async (resolve, reject) => {
      try {
          
        const url = 
        sunbirdBaseUrl + constants.endpoints.GET_LOCATION_DATA;
        const options = {
            headers : {
                "Authorization" : process.env.SUNBIRD_SERVICE_AUTHERIZATION,
                "content-type": "application/json"
            },
            json : bodyData
        };

        request.post(url,options,kendraCallback);

        function kendraCallback(err, data) {

            let result = {
                success : true
            };

            if (err) {
                result.success = false;
            } else {
                  
                let response = data.body;
                  
                if( response.responseCode === constants.common.OK) {
                    result["data"] = response.result;
                } else {
                      result.success = false;
                }
            }
            return resolve(result);
        }

        setTimeout(function () {
           return reject (constants.common.TIMEOUT_ERROR)
        }, constants.common.SUNBIRD_SERVER_TIMEOUT);


      } catch (error) {
          return reject(error);
      }
  })
}

/**
  * 
  * @function
  * @name formRead
  * @param {String} bearerToken - autherization token.
  * @param {object} bodyData -  subType data.
  * @returns {Promise} returns a promise.
*/
const formRead = function ( subTypeData ) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("subTypeData:",subTypeData)
            let bodyData = {
                request : {
                    type: "profileConfig",
                    subType: subTypeData,
                    action: "get"
                }
            }
            console.log("bodyData:",bodyData.request)
            const url = 
            sunbirdBaseUrl + constants.endpoints.GET_FORM_DATA;
            const options = {
                headers : {
                    "Authorization" : process.env.SUNBIRD_SERVICE_AUTHERIZATION,
                    "content-type": "application/json"
                },
                json : bodyData
            };
  
            request.post(url,options,kendraCallback);
  
            function kendraCallback(err, data) {
  
                let result = {
                    success : true
                };
  
                if (err) {
                    result.success = false;
                } else {
                    
                    let response = data.body;
                    
                    if( response.responseCode === constants.common.OK) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                }
                return resolve(result);
            }
            setTimeout(function () {
                return reject (constants.common.TIMEOUT_ERROR)
             }, constants.common.SUNBIRD_SERVER_TIMEOUT);

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
  learnerLocationSearch : learnerLocationSearch,
  formRead : formRead
};