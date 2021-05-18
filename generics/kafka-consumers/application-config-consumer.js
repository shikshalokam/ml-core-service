/**
 * name : application-config-consumer.js
 * author : Rakesh Kumar    
 * created-date : 13-Dec-2019
 * Description : consume all config data sent from kafka.
 */

//dependencies

const elasticSearchHelper = require(GENERIC_HELPERS_PATH + "/elastic-search");
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");

/**
  * application config consumer message received.
  * @function
  * @name messageReceived
  * @param {String} message - consumer data
  * @returns {Promise} return a Promise.
*/

var messageReceived = function (message) {

  return new Promise(async function (resolve, reject) {

    try {

      let parsedMessage = JSON.parse(message.value);
        await elasticSearchHelper.pushAppConfigData(parsedMessage);

      return resolve("Message Received for Application Config");
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
        message: `Kafka server is down on address ${error.address} and on port ${error.port} for language pack`
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
