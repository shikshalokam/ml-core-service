/**
 * name : improvement-project.js
 * author : Aman Jung Karki
 * Date : 12-Mar-2021
 * Description : All improvement project related api call.
 */

//dependencies
const request = require('request');

/**
  * List of user assigned projects.
  * @function
  * @name assignedProjects
  * @param {String} token - logged in user token.
  * @param {Object} requestedData - Request body data.
  * @param {String} search - search data.
  * @param {String} filter - filter text.
  * @returns {Promise} returns a promise.
*/

var assignedProjects = function ( token,search = "",filter = "" ) {

    let url = 
    process.env.ML_PROJECT_SERVICE_URL +
    constants.endpoints.GET_USER_ASSIGNED_PROJECT + "?search=" + search;
    
    if( filter !== "" ) {
        url = url + "&filter=" + filter;
    }
    
    return new Promise(async (resolve, reject) => {
        try {

            function improvementProjectCallback(err, data) {

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

            request.get(url,options,improvementProjectCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * List of user imported projects.
  * @function
  * @name importedProjects
  * @param {String} token - logged in user token.
  * @param {String} programId - program id.
  * @returns {Promise} returns a promise.
*/

var importedProjects = function ( token,programId = "" ) {

    let url = 
    process.env.ML_PROJECT_SERVICE_URL +
    constants.endpoints.IMPORTED_PROJECT;

    if( programId !== "" ) {
        url += "/" + programId;
    }
    
    return new Promise(async (resolve, reject) => {
        try {

            function improvementProjectCallback(err, data) {

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

            request.get(url,options,improvementProjectCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Get project detail by link.
  * @function
  * @name getProjectDetailByLink
  * @param {String} token - logged in user token.
  * @param {String} link - link
  * @param {Object} bodyData - bodyData
  * @returns {Promise} returns a promise.
*/

var getProjectDetailByLink = function ( solutionId, token, bodyData = "" ) {

    let getProjectDetailByLinkUrl = 
    process.env.ML_PROJECT_SERVICE_URL + 
    constants.endpoints.GET_PROJECT_DETAILS_BY_LINK + "?solutionId=" + solutionId;

    return new Promise((resolve, reject) => {
        try {

            const improvementProjectCallback = function (err, data) {

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

            request.post(getProjectDetailByLinkUrl, options, improvementProjectCallback);

        } catch (error) {
            return reject(error);
        }
    })

}

module.exports = {
    assignedProjects : assignedProjects,
    importedProjects : importedProjects,
    getProjectDetailByLink : getProjectDetailByLink
}