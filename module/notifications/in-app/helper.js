/**
 * name : module/notifications/in-app/helper.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : In-app helper.
 */

//dependencies
const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search");
const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications");
const moment = require("moment-timezone");
let currentDate = moment(new Date());
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
let sessionHelpers = require(ROOT_PATH+"/generics/helpers/sessions");

const userExtensionHelper = require(MODULES_BASE_PATH + "/user-extension/helper");
const pushNotificationsHelper = require(MODULES_BASE_PATH + "/notifications/push/helper");
// const FCM_HELPER = require(MODULES_BASE_PATH + "/notifications/fcm/helper");

/**
    * InAppNotificationsHelper
    * @class
*/

module.exports = class InAppNotificationsHelper {

      /**
      * List of notifications data
      * @method
      * @name list
      * @param {String} userId - Logged in user id.
      * @param {Number} pageSize - Total page size.
      * @param {Number} pageNo - Total page no.
      * @param {String} appType  - Name of the app type
      * @param {String} appName - app name       
      * @returns {Promise} returns a promise.
     */


    static list(userId, pageSize, pageNo, appType) {
        return new Promise(async (resolve, reject) => {
            try {

                let getNotificationDocument = 
                await elasticSearchHelper.getNotificationData(
                    userId, 
                    appType
                );

                if (getNotificationDocument.statusCode !== httpStatusCode["ok"].status) {
                    return resolve({
                        data: [],
                        count: 0
                    })
                }

                let notificationInDescendingOrder = 
                getNotificationDocument.body._source.notifications.reverse();

                let skippedValue = pageSize * (pageNo - 1);
                let limitingValue = pageSize;

                let paginatedData = 
                notificationInDescendingOrder.splice(skippedValue, limitingValue);

                return resolve({
                    data: paginatedData,
                    count: getNotificationDocument.body._source.notificationCount
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * mark is_read- true to a specific notification.
      * @method
      * @name markAsRead
      * @param {String} userId - Logged in user id.
      * @param {String} [appname = ""] - App type
      * @param {String} notificatonNumber - id of notification       
      * @returns {Promise} returns a promise.
     */
  
    static markAsRead(userId, notificatonNumber, appType = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let updateNotificationDocument = 
                await elasticSearchHelper.updateNotificationData(
                    userId, 
                    Number(notificatonNumber), 
                    { is_read: true }, 
                    appType
                );

                return resolve(updateNotificationDocument);
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * unread notification 
      * @method
      * @name unReadCount
      * @param {String} userId - Logged in user id.
      * @param {String} apptype - type of the app.
      * @param {String} appname - name of the app.                    
      * @returns {Promise} returns a promise.
     */

    static unReadCount(userId,apptype,appname,os,currentAppVersion) {
        return new Promise(async (resolve, reject) => {
            try {

                let response = {
                    count: 0,
                    data: []
                };
                
                let getNotificationDocument = 
                await elasticSearchHelper.getNotificationData(
                    userId, apptype
                );
               
               
                if (getNotificationDocument.statusCode === httpStatusCode["ok"].status) {
                    
                    response["count"] = 
                    getNotificationDocument.body._source.notificationUnreadCount;
                }

                let versionData = await database.models.appReleases.findOne({
                    appName : gen.utils.lowerCase(appname),
                    os : os,
                    status : constants.common.ACTIVE
                }).lean();

                if( 
                    versionData && versionData.version !== currentAppVersion
                ) {
                    
                    response.data.push({
                        is_read : false,
                        internal : true,
                        action : "versionUpdate",
                        appName : versionData.appName,
                        created_at : new Date(),
                        text : versionData.text,
                        title : versionData.title,
                        type : "Information",
                        payload : {
                            appVersion : versionData.version,
                            updateType : versionData.releaseType,
                            type : "appUpdate",
                            releaseNotes : versionData.releaseNotes,
                            os : versionData.os
                        },
                        appType : versionData.appType
                    });

                }

                // <- Dirty fix.Currently not required.

                // let sessionPath = `${constants.common.ALL_APP_VERSION}-${gen.utils.lowerCase(appname)}-${gen.utils.lowerCase(os)}`;
                // let sessionData = sessionHelpers.get(sessionPath);

                // if( sessionData !== undefined && sessionData.payload &&
                //     sessionData.payload.appVersion !== currentAppVersion
                // ) {
                //     response.data.push(sessionData);
                // }

                return resolve(response);

            } catch (error) {
                return reject(error);
            }
        })
    }

      /**
      * Pending assessments or pending observations. 
      * @method
      * @name pendingAssessmentsOrObservations
      * @param {Object} assessmentOrObservationData - Logged in user id.
      * @param {String} [observation = false] - check if it is for pending observation. If true pending observation functionality is run otherwise pending assessments.                  
      * @returns {Promise} returns a promise.
     */


    static pendingAssessmentsOrObservations(assessmentOrObservationData, observation = false) {
        return new Promise(async (resolve, reject) => {
            try {

                let pendingData = assessmentOrObservationData.filter(singleData => {
                    let pendingCreatedDate = moment(singleData.createdAt);
                    let dateDifferenceWithPendingAssessment = 
                    currentDate.diff(pendingCreatedDate, 'days');

                    if (dateDifferenceWithPendingAssessment >= 14) {
                        return singleData;
                    }
                })

                if (pendingData.length > 0) {

                    let result = {
                        is_read: false,
                        action: "pending",
                        internal: false,
                        type: "Information",
                        created_at: new Date(),
                        payload: {
                            type: "institutional"
                        },
                        title: "Pending Assessment!",
                        text: "You have a Pending Assessment",
                        appType : process.env.ASSESSMENT_APPLICATION_APP_TYPE
                    };

                    if (observation) {
                        result.payload["type"] = "observation";
                        result.title = "Pending Observation!";
                        result.text = "You have a Pending Observation"
                    }

                    for (let pointerToPendingData = 0; 
                        pointerToPendingData < pendingData.length; 
                        pointerToPendingData++) {

                          result.payload["solution_id"] = 
                          pendingData[pointerToPendingData].solutionId;

                          result.payload["submission_id"] = 
                          pendingData[pointerToPendingData]._id;

                          result.payload["entity_id"] = 
                          pendingData[pointerToPendingData].entityId;

                          result.payload["entity_name"] = 
                          pendingData[pointerToPendingData].entityName;
                          
                          result["user_id"] = 
                          pendingData[pointerToPendingData].userId;

                          if (observation) {
                            result.payload["observation_id"] = 
                            pendingData[pointerToPendingData].observationId;
                        }

                        result.payload["program_id"] = 
                        pendingData[pointerToPendingData].programId;

                        let pushAssessmentsOrObservationsToKafka = 
                        await kafkaCommunication.pushNotificationsDataToKafka(result);

                        if (pushAssessmentsOrObservationsToKafka && pushAssessmentsOrObservationsToKafka.status && pushAssessmentsOrObservationsToKafka.status != "success") {
                            let errorObject = {
                                userId: result.user_id,
                                message: `Failed to push ${result.title} to kafka`,
                                payload: result.payload,
                                slackErrorName: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),
                                color: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR")
                            };
                            slackClient.sendMessageToSlack(errorObject);
                            return;
                        }
                    }
                }
            }
            catch (error) {
                return reject(error);
            }
        })
    }

       /**
      * Completed assessments or pending observations functionality. 
      * @method
      * @name completedAssessmentsOrObservations
      * @param {Object} assessmentOrObservationData - Logged in user id.
      * @param {String} [observation = false] - check if it is for completed observation. If true completed observation functionality is run otherwise completed assessments.                  
      * @returns {Promise} returns a promise.
     */


    static completedAssessmentsOrObservations(assessmentOrObservationData, observation = false) {
        return new Promise(async (resolve, reject) => {
            try {

                let userCompletionData = {};

                for (let indexToAssessmentOrObservationData = 0; 
                    indexToAssessmentOrObservationData < assessmentOrObservationData.length; 
                    indexToAssessmentOrObservationData++) {

                        if (
                            !userCompletionData[assessmentOrObservationData[indexToAssessmentOrObservationData].userId]
                        ) {
                            userCompletionData[assessmentOrObservationData[indexToAssessmentOrObservationData].userId] = {};
                            userCompletionData[assessmentOrObservationData[indexToAssessmentOrObservationData].userId]["count"] = 0;
                        }

                        userCompletionData[assessmentOrObservationData[indexToAssessmentOrObservationData].userId]["count"] += 1;

                }

                let allUserCompletionData = Object.keys(userCompletionData);

                if (allUserCompletionData.length > 0) {

                    let result = {
                        is_read: false,
                        payload: {
                            type: "institutional"
                        },
                        action: "view_only",
                        internal: false,
                        title: "Congratulations!",
                        type: "Information",
                        created_at: new Date(),
                        appType : process.env.ASSESSMENT_APPLICATION_APP_TYPE
                    };

                    if (observation) {
                        result.payload.type = "observation";
                    }

                    for (let pointerToUserData = 0; 
                        pointerToUserData < allUserCompletionData.length; 
                        pointerToUserData++) {

                          result.user_id = allUserCompletionData[pointerToUserData];
                          result.text = observation ? `You have Completed ${userCompletionData[allUserCompletionData[pointerToUserData]].count} Observations this month!` : `You have Completed ${userCompletionData[allUserCompletionData[pointerToUserData]].count} Assessments this month!`;
                          let pushCompletedAssessmentsOrObservationsToKafka = await kafkaCommunication.pushNotificationsDataToKafka(result);

                          if (pushCompletedAssessmentsOrObservationsToKafka.status && pushCompletedAssessmentsOrObservationsToKafka.status != "success") {
                             let errorObject = {
                                slackErrorName: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),
                                color: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR"),
                                message: observation ? 
                                `Failed to push completed observations to kafka` : 
                                `Failed to push completed assessments to kafka`,
                                payload: result.payload
                            };

                            slackClient.sendMessageToSlack(errorObject);
                            return;
                        }
                    }
                }

                return resolve();

            }
            catch (error) {
                return reject(error);
            }
        })
    }

};