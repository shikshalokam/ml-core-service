/**
 * name : improvement-project.js
 * author : Aman Jung Karki
 * Date : 12-Mar-2021
 * Description : All improvement project related api call.
 */

//dependencies
const request = require('request');
// process.env.ML_PROJECT_SERVICE_URL = "http://ml-projects-service:3000"

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
  * Get project detail by solutionId.
  * @function
  * @name getDetail
  * @param {String} token - logged in user token.
  * @param {String} link - link
  * @param {Object} bodyData - bodyData
  * @returns {Promise} returns a promise.
*/

var getDetail = function ( solutionId, token, bodyData = {} ) {

    let getProjectDetailByLinkUrl = 
    process.env.ML_PROJECT_SERVICE_URL + 
    constants.endpoints.GET_PROJECT_DETAILS_BY_LINK + "?solutionId=" + solutionId;
    
    return new Promise(async (resolve, reject) => {
        try {

            function improvementProjectCallback(err, data) {

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

            const options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            if( bodyData !== "" ) {
                options.json = bodyData
            } 

            request.get(getProjectDetailByLinkUrl,options,improvementProjectCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Get template detail.
  * @function
  * @name getTemplateDetail
  * @param {String} token - logged in user token.
  * @param {String} templateId - templateId
  * @returns {Promise} returns a promise.
*/

var getTemplateDetail = function ( templateId, token ) {

    let url = 
    process.env.ML_PROJECT_SERVICE_URL + 
    constants.endpoints.GET_TEMPLATE_DETAILS + "/" + templateId;
    
    return new Promise(async (resolve, reject) => {
        try {

            function improvementProjectCallback(err, data) {

                let result = {
                    success : true,
                    message: "",
                    status:""
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    if( response.status == httpStatusCode['ok'].status ) {
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

            request.get(url,options,improvementProjectCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * List of project.
  * @function
  * @name projectDocuments
  * @param {Object} filterData - Filter data.
  * @param {Array} projection - Projected data. 
  * @param {Array} skipFields - Field to skip.  
  * @returns {JSON} - List of projects.
*/

const projectDocuments = function (
    userToken, 
    filterData =  "all",
    projection = "all",
    skipFields = "none", 
) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const url = process.env.ML_PROJECT_SERVICE_URL + constants.endpoints.LIST_PROJECT;

            function improvementProjectCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {

                    let response = data.body;
                    if( response.status === httpStatusCode['ok'].status) {
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
                    // "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : userToken
                },
                json : {
                    query : filterData,
                    projection : projection,
                    skipFields : skipFields
                }
            };

            request.post(url,options,improvementProjectCallback);

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    assignedProjects : assignedProjects,
    importedProjects : importedProjects,
    getDetail : getDetail,
    getTemplateDetail : getTemplateDetail,
    projectDocuments : projectDocuments
}