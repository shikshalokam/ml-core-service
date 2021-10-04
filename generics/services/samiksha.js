/**
 * name : samiksha.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All samiksha related api call.
 */

//dependencies

const request = require('request');

/**
  * List of assigned user observations.
  * @function
  * @name assignedObservations
  * @param {String} token - logged in user token.
  * @param {String} [ search = "" ] - search data.
  * @param {String} [ filter = "" ] 
  * @returns {Promise} returns a promise.
*/

var assignedObservations = function ( token,search = "",filter = "" ) {

    let userAssignedUrl = 
    process.env.ML_SURVEY_SERVICE_URL + 
    constants.endpoints.GET_USER_ASSIGNED_OBSERVATION + "?search=" + search;

    if( filter !== "" ) {
        userAssignedUrl = userAssignedUrl + "&filter=" + filter;
    } 
    
    return new Promise(async (resolve, reject) => {
        try {

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    
                    if( response.status === httpStatusCode['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                }

                return resolve(result);
            }

            const options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            request.get(userAssignedUrl,options,assessmentCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * List of user assigned surveys.
  * @function
  * @name assignedSurveys
  * @param {String} token - logged in user token.
  * @param {String} [search = ""] - search data.
  * @param {String} [filter = ""] - filter key.
  * @returns {Promise} returns a promise.
*/

var assignedSurveys = function ( token,search = "",filter = "", surveyReportPage = "" ) {

    let userAssignedUrl = 
    process.env.ML_SURVEY_SERVICE_URL +
    constants.endpoints.GET_USER_ASSIGNED_SURVEY + "?search=" + search;

    if( filter !== "" ) {
        userAssignedUrl = userAssignedUrl + "&filter=" + filter;
    } 

    if( surveyReportPage !== "" ) {
        userAssignedUrl = userAssignedUrl + "&surveyReportPage=" + surveyReportPage;
    } 
    
    return new Promise(async (resolve, reject) => {
        try {

            function assessmentCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    if( response.status === httpStatusCode['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                }

                return resolve(result);
            }

            const options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            request.get(userAssignedUrl,options,assessmentCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

module.exports = {
    assignedObservations : assignedObservations,
    assignedSurveys : assignedSurveys
};