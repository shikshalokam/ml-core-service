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

      } catch (error) {
          return reject(error);
      }
  })
}

module.exports = {
  learnerLocationSearch : learnerLocationSearch
};