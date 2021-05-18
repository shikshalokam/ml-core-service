/**
 * name : user-profile.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Cron job for user profile update.
 */

// dependencies

const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications");
const userProfileHelper = require(MODULES_BASE_PATH + "/user-profile/helper.js");

/**
  * Update user profile.
  * @function
  * @name profilePendingVerificationNotification
  * @returns {Promise} return a Promise.
*/

let profilePendingVerificationNotification = function () {
    nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_PROFILE_PENDING_UPDATE_NOTIFICATION, () => {

        logger.info("<-----  profile Pending Verification Notification cron started ---- >", new Date());
    
        return new Promise(async (resolve, reject) => {

            try {
                
                let userProfiles = 
                await userProfileHelper.userProfileNotVerified(
                    {
                        userId : 1
                    }
                );

                let result = [];
                if ( userProfiles && userProfiles.length > 0 ) {

                    let userProfileData = {
                        "is_read" : false,
                        "action" : "profile_update",
                        "created_at" : new Date(),
                        "text" : constants.common.PROFILE_UPDATE_NOTIFICATION_MESSAGE,
                        "title" : constants.common.PROFILE_UPDATE_TITLE,
                        "type" : process.env.ELASTICSEARCH_USER_NOTIFICATIONS_TYPE,
                        "internal" : false,
                        "payload" : {
                            "type" : 
                            process.env.ELASTICSEARCH_USER_NOTIFICATIONS_TYPE
                        },
                        "appType" : 
                        [
                            process.env.IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE 
                        ]
                    };

                    for (let userProfile = 0;
                        userProfile < userProfiles.length;
                        userProfile++
                    ) {

                        let response = {
                            success: false
                        };

                        let currentUser = userProfiles[userProfile]

                        let cloneUserProfileData = { ...userProfileData };

                        cloneUserProfileData["user_id"] = currentUser.userId;
                            
                        let pushUserNotificationToKafka = 
                        await kafkaCommunication.pushNotificationsDataToKafka(
                            cloneUserProfileData
                        );
                       
                        if (
                            pushUserNotificationToKafka.status && 
                            pushUserNotificationToKafka.status !== "success"
                        ) {
                            throw new Error(`Failed to push user profile notification for user ${currentUser.userId}`);
                        }

                        response.success = true;
                        response["message"] = `successfully pushed user profile information to kafka for user ${currentUser.userId}`;
                        result.push(response);
                    }
                }
                return resolve(result);

            } catch (error) {
                return reject(error);
            }

        })

    });
}




module.exports = profilePendingVerificationNotification;
