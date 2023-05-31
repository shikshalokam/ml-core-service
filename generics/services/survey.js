/**
 * name : survey.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All survey related api call.
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
  * @param {Array} - solutionIds - survey solutionIds
  * @returns {Promise} returns a promise.
*/

var assignedSurveys = function ( token,search = "",filter = "", surveyReportPage = "", solutionIds = []) {

    let userAssignedUrl = 
    process.env.ML_SURVEY_SERVICE_URL +
    constants.endpoints.GET_USER_ASSIGNED_SURVEY + "?search=" + search;

    if( filter !== "" ) {
        userAssignedUrl = userAssignedUrl + "&filter=" + filter;
    } 

    if( surveyReportPage !== "" ) {
        userAssignedUrl = userAssignedUrl + "&surveyReportPage=" + surveyReportPage;
    } 
    let requestBody = {}
    if (solutionIds.length > 0) {
        requestBody.solutionIds = solutionIds;
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
                },
                body: JSON.stringify(requestBody)

            };

            request.get(userAssignedUrl,options,assessmentCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Get questions from solution.
  * @function
  * @name getQuestions
  * @param {String} token - logged in user token.
  * @param {String} solutionId - solution Id
  * @returns {Promise} returns a promise.
*/

var getQuestions = function ( solutionId, token ) {

    let getQuestionsUrl = 
    process.env.ML_SURVEY_SERVICE_URL + 
    constants.endpoints.GET_QUESTIONS + "/" + solutionId;
    
    return new Promise(async (resolve, reject) => {
        try {

            function assessmentCallback(err, data) {

                let result = {
                    success : true,
                    message: "",
                    status:""
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    if( response.status === httpStatusCode['ok'].status ) {
                        result["result"] = response.result;
                    } else {
                        result.success = false;
                    }

                    result.message = response.message;
                    result.status = response.status;
                }

                return resolve(result);
            }

            const options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            request.get(getQuestionsUrl,options,assessmentCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Get observation.
  * @function
  * @name getObservationDetail
  * @param {String} token - logged in user token.
  * @param {String} solutionId - solution Id
  * @returns {Promise} returns a promise.
*/

var getObservationDetail = function ( solutionId, token ) {

    let url = 
    process.env.ML_SURVEY_SERVICE_URL + 
    constants.endpoints.GET_OBSERVATION + "?solutionId=" + solutionId;
    
    return new Promise(async (resolve, reject) => {
        try {

            function assessmentCallback(err, data) {

                let result = {
                    success : true,
                    message: "",
                    status:""
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    if( response.status === httpStatusCode['ok'].status ) {
                        result["result"] = response.result;
                    } else {
                        result.success = false;
                    }

                    result.message = response.message;
                    result.status = response.status;
                }

                return resolve(result);
            }

            const options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            request.get(url,options,assessmentCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Get survey documents.
  * @function
  * @name getImportedSurveys
  * @param {String} token - logged in user token.
  * @param {String} programId - program Id
  * @returns {Promise} returns a promise.
*/

const getImportedSurveys = function(token, programId) {
    let url = 
    process.env.ML_SURVEY_SERVICE_URL + 
    constants.endpoints.GET_IMPORTED_SURVEY

    if( programId !== "" ) {
        url += "/" + programId;
    }
    
    return new Promise(async (resolve, reject) => {
        try {

            function assessmentCallback(err, data) {

                let result = {
                    success : true,
                    message: "",
                    status:""
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    if( response.status === httpStatusCode['ok'].status ) {
                        result["result"] = response.result;
                    } else {
                        result.success = false;
                    }

                    result.message = response.message;
                    result.status = response.status;
                }

                return resolve(result);
            }

            const options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            request.get(url,options,assessmentCallback)

        } catch (error) {
            return reject(error);
        }
    })
}


/**
  * Get observation documents.
  * @function
  * @name getImportedObservations
  * @param {String} token - logged in user token.
  * @param {String} programId - program Id
  * @returns {Promise} returns a promise.
*/
const getImportedObservations = function(token, programId) {
    let url = 
    process.env.ML_SURVEY_SERVICE_URL + 
    constants.endpoints.GET_IMPORTED_OBSERVATION

    if( programId !== "" ) {
        url += "/" + programId;
    }
    
    return new Promise(async (resolve, reject) => {
        try {

            function assessmentCallback(err, data) {

                let result = {
                    success : true,
                    message: "",
                    status:""
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    if( response.status === httpStatusCode['ok'].status ) {
                        result["result"] = response.result;
                    } else {
                        result.success = false;
                    }

                    result.message = response.message;
                    result.status = response.status;
                }

                return resolve(result);
            }

            const options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            request.get(url,options,assessmentCallback)

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    assignedObservations : assignedObservations,
    assignedSurveys : assignedSurveys,
    getQuestions : getQuestions,
    getObservationDetail : getObservationDetail,
    getImportedSurveys : getImportedSurveys,
    getImportedObservations: getImportedObservations
};