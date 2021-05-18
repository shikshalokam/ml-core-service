/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

let userManagementService = 
require(ROOT_PATH +"/generics/services/user-management");

module.exports = class UserProfileHelper {

    /**
   * Get platform user profile.
   * @method
   * @name create
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of created user profile data.
   */

    static getProfile( userId,token ) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileCreationData = 
                await userManagementService.platformUserProfile(
                    userId,
                    token
                )
                
                return resolve(userProfileCreationData);

            } catch (error) {
                return reject(error);
            }
        })
    }

};