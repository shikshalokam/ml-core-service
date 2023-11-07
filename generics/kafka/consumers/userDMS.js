/**
 * name : userDMS.js
 * author : Ankit Shahu
 * created-date : 22-Nov-2020
 * Description : User delete consumer.
 */

//dependencies
const usersHelper = require(MODULES_BASE_PATH + "/users/helper.js");

/**
 * submission consumer message received.
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
        console.log(userDeleteResponse);
        if (userDeleteResponse.success == true) {
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
