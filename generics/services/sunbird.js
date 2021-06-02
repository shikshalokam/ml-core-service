/**
 * name : bodh.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All bodh service related information.
 */

//dependencies

const request = require('request');
const fs = require("fs");

/**
  * Get user profile.
  * @function
  * @name userProfile   
  * @param userId - logged in user id.
  * @param token - logged in user token.
  * @returns {Promise}
*/

var userProfile = async function (userId, token) {

    const userProfileUrl = constants.endpoints.GET_USER_PROFILE + "/" + userId;

    return new Promise(async (resolve, reject) => {

        const options = {
            "headers": {
                "content-type": "application/json",
                "authorization": process.env.AUTHORIZATION,
                "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                "x-authenticated-user-token": token
            }
        };

        request.get(userProfileUrl, options, callback);

        function callback(err, data) {
            if (err) {
                return reject({
                    message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                let profileData = data.body;
                return resolve(JSON.parse(profileData).result.response);
            }
        }
    })
}

/**
  * Call to sunbird service. 
  * @function
  * @name callToSunbird
  * @param requestBody - Logged in user Id.
  * @param token - Logged in user token.
  * @param url - url of the api call.
  * @param requestType - http request method
  * @returns {JSON} - sunbird service response
*/

function callToSunbird(requestType, url, token = "", requestBody = "") {
    return new Promise(async (resolve, reject) => {

        let options = {
            "headers": {
                "content-type": "application/json",
                "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
            }
        };
        if (token) {
            options['headers']["x-authenticated-user-token"] = token;
        }

        if (requestType != "GET") {
            options['json'] = requestBody;
        }

        url = url;
        if (requestType == "PATCH") {
            request.patch(url, options, callback);
        } else if (requestType == "GET") {
            request.get(url, options, callback);
        } else {
            request.post(url, options, callback);
        }

        function callback(err, data) {

            if (err) {
                return reject({
                    message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                return resolve(data.body);
            }
        }

    });
}

/**
* To get list of learning resources
* @method
* @name  learningResources
* @param {String} token - user access token.
* @param {String} pageSize - page size of the request
* @param {String} pageNo - page no of the request
* @param {String} category - category for the learning resource
* @param {String} subCategory - subcategory for the learning resource
* @param {String} topic -  topic for the learning resource
* @param {String} language - language for the learning resource
* @param {String} sortBy - sortBy option for the learning resource
* @returns {json} Response consists of list of learning resources
*/

const learningResources = function (token, pageSize, pageNo, filters, sortBy, searchText) {
    return new Promise(async (resolve, reject) => {
        try {

            let learningResourceApiUrl = constants.endpoints.SUNBIRD_LEARNING_RESOURCE_LIST;
            learningResourceApiUrl = learningResourceApiUrl + "?limit=" + pageSize + "&page=" + pageNo;
            if (searchText) {
                learningResourceApiUrl = learningResourceApiUrl + "&search=" + searchText;
            }
            if (sortBy) {
                learningResourceApiUrl = learningResourceApiUrl + "&sortBy=" + sortBy;
            }

            let mappedFilterList = {};
            let filterKeys = Object.keys(filters);

            if (filterKeys && filterKeys.length > 0) {
                filterKeys.map(filter => {
                    let mappingType = "";

                    if (filter == "category") {
                        mappingType = "board"
                    } else if (filter == "subCategory") {
                        mappingType = "gradeLevel"
                    } else if (filter == "topic") {
                        mappingType = "medium"
                    } else if (filter == "language") {
                        mappingType = "subject"
                    } else if (filter == "mimeType") {
                        mappingType = "mimeType"
                    }
                    mappedFilterList[mappingType] = filters[filter];
                });
            }

            let requestBody = {
                filters: mappedFilterList
            }

            let response = await callToSunbird("POST", learningResourceApiUrl, token, requestBody);
            return resolve(response);
        } catch (error) {
            reject({ message: constants.apiResponses.SUNBIRD_SERVICE_DOWN });
        }


    })

}

/**
* To search the users
* @method
* @name  userSearch
* @param {String} token - user access token.
* @param {String} sortBy - sortBy option for the learning resource
* @returns {json} Response consists of user deatils
*/
const userSearch = function (requestBody, token) {
    return new Promise(async (resolve, reject) => {
        try {
            let userSearchUrl = constants.endpoints.SUNBIRD_USER_SEARCH;
            let userInformation = await callToSunbird("POST", userSearchUrl, token, requestBody);
            return resolve(userInformation);

        } catch (error) {
            reject({ message: constants.apiResponses.SUNBIRD_SERVICE_DOWN });
        }
    })
}



module.exports = {
    userProfile: userProfile,
    learningResources: learningResources,
    userSearch: userSearch
}; 