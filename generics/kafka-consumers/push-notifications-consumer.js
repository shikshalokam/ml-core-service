/**
 * name : push-notifications-consumer.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : Send all the notifications via push notifications.
 */

//dependencies

const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const pushNotificationsHelper = require(MODULES_BASE_PATH + "/notifications/push/helper")

/**
  * push notification consumer message.
  * @function
  * @name messageReceived
  * @param {String} message - consumer data
  * @returns {Promise} return a Promise.
*/


var messageReceived = function (message) {

  return new Promise(async function (resolve, reject) {

    try {
      
      let parsedMessage = JSON.parse(message.value)

      if(parsedMessage.push == true  || !parsedMessage.push) {


        if( parsedMessage.pushToTopic ) {

          await pushNotificationsHelper.pushToTopic(parsedMessage);

        } else {

          if ( 
            parsedMessage.action !== "deletion" && 
            parsedMessage.action !== "versionUpdate" &&
            parsedMessage.action !== "Update" 
          ) {

            let userId = parsedMessage.user_id;
            delete parsedMessage.user_id;
            parsedMessage.is_read = false;
  
            await pushNotificationsHelper.pushNotificationMessageToDevice(
              userId,
              parsedMessage
            )

          }
        }
  
        return resolve("Message Received");
      } else {
        return resolve("Push notification not enable");
      }
      
    } catch (error) {
      return reject(error);
    }

  });
};

/**
  * If message is not received.
  * @function
  * @name errorTriggered
  * @param {Object} error - error object
  * @returns {Promise} return a Promise.
*/

var errorTriggered = function (error) {

  return new Promise(function (resolve, reject) {

    try {
      let errorObject = {
        slackErrorName: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),
        color: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR"),
        message: `Kafka server is down on address ${error.address} and on port ${error.port} for notifications`
      }

      slackClient.sendMessageToSlack(errorObject)
      return resolve(error);
    } catch (error) {
      return reject(error);
    }

  });
};

module.exports = {
  messageReceived: messageReceived,
  errorTriggered: errorTriggered
};
