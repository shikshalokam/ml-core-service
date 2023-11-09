/**
 * name : userDMS.js
 * author : Ankit Shahu
 * created-date : 22-Nov-2020
 * Description : User delete consumer.
 */

//dependencies
const usersHelper = require(MODULES_BASE_PATH + "/users/helper.js");
const kafkaProducersHelper = require(ROOT_PATH + "/generics/kafka/producers");
/**
 * userdelete consumer message received.
 * @function
 * @name messageReceived
 * @param {String} message - consumer data
 * @returns {Promise} return a Promise.
 */

var messageReceived = function (message) {
  return new Promise(async function (resolve, reject) {
    try {
      let parsedMessage = JSON.parse(message.value);
      if (parsedMessage.edata.action === "delete-user") {
        let userDeleteResponse = await usersHelper.userDelete(parsedMessage);

        if (userDeleteResponse.success == true) {
          let msgData = await gen.utils.getTelemetryEvent(parsedMessage);
          let telemetryEvent = {
            timestamp: new Date(),
            msg: JSON.stringify(msgData),
            lname: "TelemetryEventLogger",
            tname: "",
            level: "INFO",
            HOSTNAME: "",
            "application.home": "",
          };
          await kafkaProducersHelper.pushTelemetryEventToKafka(telemetryEvent);
          return resolve("Message Processed.");
        } else {
          return resolve("Message Processed.");
        }
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
      return resolve(error);
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  messageReceived: messageReceived,
  errorTriggered: errorTriggered,
};
