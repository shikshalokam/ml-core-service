/**
 * name : user-management.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All user management related api call.
 */

//dependencies

let urlPrefix = 
process.env.USER_MANAGEMENT_HOST + 
process.env.USER_MANAGEMENT_BASE_URL +
process.env.URL_PREFIX; 

const request = require('request');

/**
  * Get platform user roles
  * @function
  * @name platformUserProfile
  * @returns {Promise} returns a promise.
*/

var platformUserProfile = function ( userId,token ) {

    const platformUserRolesUrl = 
    urlPrefix + constants.endpoints.PLATFORM_USER_PROFILE+"/"+userId;
    
    return new Promise(async (resolve, reject) => {
        try {

            const _userManagementCallBack = function (err, response) {
                if (err) {
                    logger.error("Failed to connect to user management service.");
                } else {
                    let userManagementData = JSON.parse(response.body);
                    return resolve(userManagementData);
                }
            }

            request.get(
                platformUserRolesUrl,{
                    headers: {
                        "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                        "X-authenticated-user-token" : token 
                    }
                },
                _userManagementCallBack
            )

        } catch (error) {
            return reject(error);
        }
    })

}

module.exports = {
    platformUserProfile : platformUserProfile
};