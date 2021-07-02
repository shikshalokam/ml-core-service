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

var assignedSurveys = function ( token,search = "",filter = "" ) {

    let userAssignedUrl = 
    process.env.ML_SURVEY_SERVICE_URL +
    constants.endpoints.GET_USER_ASSIGNED_SURVEY + "?search=" + search;

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
  * Get observation detail by link.
  * @function
  * @name getObservationDetailByLink
  * @param {String} token - logged in user token.
  * @param {String} link - link
  * @param {Object} bodyData - bodyData
  * @returns {Promise} returns a promise.
*/

var getObservationDetailByLink = function ( link, token, bodyData = "" ) {

    let getObservationDetailByLinkUrl = 
    process.env.ML_SURVEY_SERVICE_URL + 
    constants.endpoints.GET_OBSERVATION_DETAILS_BY_LINK + "/" + link;

    return new Promise((resolve, reject) => {
        try {

            const assessmentCallback = function (err, data) {

                let result = {
                    success : true,
                    message: "",
                    status:""
                };

                if (err) {
                    result.success = false;
                } else {
                    let response = data.body
                    if( response.status === httpStatusCode['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;  
                    }

                    result.message = response.message;
                    result.status = response.status;
                }

                return resolve(result);
            }

            let options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            if( bodyData !== "" ) {
                options.json = bodyData
            } 

            request.post(getObservationDetailByLinkUrl, options, assessmentCallback);

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Get survey detail by link.
  * @function
  * @name getSurveyDetailByLink
  * @param {String} token - logged in user token.
  * @param {String} link - link
  * @param {Object} bodyData - bodyData
  * @returns {Promise} returns a promise.
*/

var getSurveyDetailByLink = function ( link, token, bodyData = "" ) {

    let getSurveyDetailByLinkUrl = 
    process.env.ML_SURVEY_SERVICE_URL + 
    constants.endpoints.GET_SURVEY_DETAILS_BY_LINK + "/" + link;

    return new Promise((resolve, reject) => {
        try {

            const assessmentCallback = function (err, data) {

                let result = {
                    success : true,
                    message: "",
                    status:""
                };

                if (err) {
                    result.success = false;
                } else {

                    let response = data.body;
                    
                    if( response.status === httpStatusCode['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }

                    result.message = response.message;
                    result.status = response.status;
                }

                return resolve(result);
            }

            let options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            if( bodyData !== "" ) {
                options.json = bodyData
            } 

            request.post(getSurveyDetailByLinkUrl, options, assessmentCallback);

        } catch (error) {
            return reject(error);
        }
    })

}

module.exports = {
    assignedObservations : assignedObservations,
    assignedSurveys : assignedSurveys,
    getObservationDetailByLink : getObservationDetailByLink,
    getSurveyDetailByLink : getSurveyDetailByLink
};