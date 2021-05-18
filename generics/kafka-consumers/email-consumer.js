/**
 * name : email-consumer.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description :  consume email data sent from kafka.
 */


//dependencies

const emailHelper = require(ROOT_PATH + "/generics/helpers/email");
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");

 /**
  * email consumer message received.
  * @function
  * @name messageReceived
  * @param {String} message - consumer data
  * @param {String} consumer - kafka consumer
  * @returns {Promise} return a Promise.
*/

var messageReceived = function (message, consumer) {

    return new Promise(async function (resolve, reject) {

        try {

            let parsedMessage = JSON.parse(message.value);

            await emailHelper.sendEmail(parsedMessage, consumer);

            return resolve("Message Received for email");
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
                message: `Kafka server is down on address ${error.address} and on port ${error.port} for email topic`
            }

            slackClient.sendMessageToSlack(errorObject);
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
