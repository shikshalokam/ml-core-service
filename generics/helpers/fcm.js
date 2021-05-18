/**
 * name : fcm.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : fcm functionality
 */

 // dependencies

const firebase = require('firebase-admin');
const FCM_KEYSTORE_PATH = gen.utils.checkIfEnvDataExistsOrNot("FCM_KEY_PATH");

firebase.initializeApp({
  credential: firebase.credential.cert(ROOT_PATH + FCM_KEYSTORE_PATH)
});
const FCM_SERVER_KEY = 
gen.utils.checkIfEnvDataExistsOrNot("FCM_SERVER_KEY");

const TOPIC_PREFIX = 
gen.utils.checkIfEnvDataExistsOrNot("NODE_ENV");

const request = require(GENERIC_HELPERS_PATH + '/http-request');
const THEME_COLOR = 
gen.utils.checkIfEnvDataExistsOrNot("SAMIKSHA_THEME_COLOR");

const androidObj = {
  ttl: 3600 * 1000,
  priority: 'high',
  notification: {
    "click_action": "FCM_PLUGIN_ACTIVITY",
    icon: 'stock_ticker_update',
    color: THEME_COLOR
  }
};

/**
  * Send notification to device.
  * @function
  * @name sendToDevice
  * @param {Object[]} [deviceIds = []] - Array of device ids.
  * @param {Object} [notificatonData = {}] - notificationData 
  * @returns {Promise} returns a promise.
*/

var sendToDevice = function (deviceIds = [], notificatonData = {}) {

  return new Promise(async function (resolve, reject) {
    try {

      let registrationTokens = new Array;

      if (Array.isArray(deviceIds) && deviceIds.length < 1) {
        throw new Error("Invalid list of device ids.");
      } else if (Array.isArray(deviceIds)) {
        registrationTokens = deviceIds;
      }

      if (typeof (deviceIds) == "string") {
        if (deviceIds == "") {
          throw new Error("Invalid device id.");
        }
        registrationTokens.push(deviceIds);
      }

      if (registrationTokens.length < 1){
        throw new Error("Invalid list of device ids.");
      } 

      let failedTokens = new Array;
      let successFullTokens = new Array;

      /** TODO
       * Max 500 tokens can be pushed, if more than 500, divide in chunks and send.
      */

      let firebaseResponse = await firebase.messaging().sendMulticast({
        data: notificatonData.data,
        android: androidObj,
        tokens: registrationTokens,
      });

      if (firebaseResponse.failureCount > 0) {
        firebaseResponse.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          } else if (resp.success) {
            successFullTokens.push(registrationTokens[idx]);
          }
        });
      }

      if (failedTokens.length > 0) {
        return resolve({
          success: false,
          message: "Failed to send notification",
          failedDeviceIds: failedTokens,
          // successFullTokens: successFullTokens
        });
      }

      return resolve({
        success: true,
        message: `Notification successfully sent to ${deviceIds}`,
        successFullTokens: successFullTokens
      });

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  *  Send notification to particular topic
  * @function
  * @name sendToTopic
  * @param {String} [topic = ""] - topic
  * @param {Object} [notificatonData = {}] - notificationData
  * @param {String} [topicCondition = ""] - topic condition 
  * @returns {Promise} returns a promise.
*/

var sendToTopic = function (topic = "", notificatonData = {}, topicCondition = "") {

  return new Promise(async function (resolve, reject) {
    try {

      let message = {};

      if (topicCondition != "") {
        message = {
          notification: notificatonData,
          condition: condition
        };
      } else if (topic != "") {
        message = {
          data: notificatonData,
          topic: topic
        };
      }

      if (Object.keys(message).length < 1) {
        throw new Error("Invalid topic.")
      }

      try {
        let firebaseResponse = await firebase.messaging().send(message);

        if (firebaseResponse) {
          return resolve({
            success: true,
            message: `Notification successfully sent to topic(s): ${firebaseResponse}`
          });
        } else {
          return resolve({
            success: false,
            message: `Failed to send notification to topic: ${firebaseResponse}`
          });
        }

      } catch (error) {
        return resolve({
          success: false,
          message: `Failed to send notification to topic ${error}`
        });
      }

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * Subscribe device to topic.
  * @function
  * @name subscribeDeviceToTopic
  * @param {String} [topic = ""] - topic
  * @param {Object[]} [deviceIds = []] - array of device ids
  * @returns {Promise} returns a promise.
*/

var subscribeDeviceToTopic = function (deviceIds = [], topic = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (topic == "") {
        throw new Error("Invalid topic name.");
      } else {
        topic = TOPIC_PREFIX + topic;
      }

      let registrationTokens = new Array;

      if (Array.isArray(deviceIds) && deviceIds.length < 1) {
        throw new Error("Invalid list of device ids.");
      } else if (Array.isArray(deviceIds)) {
        registrationTokens = deviceIds;
      }

      if (typeof (deviceIds) == "string") {
        if (deviceIds == "") {
          throw new Error("Invalid device id.")
        } 
        registrationTokens.push(deviceIds);
      }

      if (registrationTokens.length < 1) {
        throw new Error("Invalid list of device ids.");
      }

      try {
        let firebaseResponse = 
        await FIREBASE.messaging().subscribeToTopic(registrationTokens, topic);

        if (firebaseResponse) {
          return resolve({
            success: true,
            message: `Successfully subscribed to topic: ${firebaseResponse}`
          });
        } else {
          return resolve({
            success: false,
            message: `Failed to subscribe to topic: ${firebaseResponse}`
          });
        }

      } catch (error) {
        return resolve({
          success: false,
          message: `Failed to subscribe to topic: ${error}`
        });
      }

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * unSubscribe device from topic.
  * @function
  * @name unsubscribeDeviceFromTopic
  * @param {String} [topic = ""] - topic
  * @param {Object[]} [deviceIds = []] - array of device ids
  * @returns {Promise} returns a promise.
*/

var unsubscribeDeviceFromTopic = function (deviceIds = [], topic = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (topic == "") {
        throw new Error("Invalid topic name.");
      } else {
        topic = TOPIC_PREFIX + "-" + topic;
      }

      let registrationTokens = new Array;

      if (Array.isArray(deviceIds) && deviceIds.length < 1) {
        throw new Error("Invalid list of device ids.");
      } else if (Array.isArray(deviceIds)) {
        registrationTokens = deviceIds;
      }

      if (typeof (deviceIds) == "string") {
        if (deviceIds == "") {
          throw new Error("Invalid device id.");
        }
        registrationTokens.push(deviceIds);
      }

      if (registrationTokens.length < 1) {
        throw new Error("Invalid list of device ids.");
      }

      try {
        let firebaseResponse = 
        await FIREBASE.messaging().unsubscribeFromTopic(registrationTokens, topic);

        if (firebaseResponse) {
          return resolve({
            success: true,
            message: `Successfully unsubscribed from topic: ${firebaseResponse}`
          });
        } else {
          return resolve({
            success: false,
            message: `Failed to unsubscribe from topic: ${firebaseResponse}`
          });
        }

      } catch (error) {
        return resolve({
          success: false,
          message: `Failed to unsubscribe from topic: ${error}`
        });
      }

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * Get device id information.
  * @function
  * @name getDeviceIdInformation
  * @param {String} [deviceId = ""] - single device id.
  * @returns {Promise} returns a promise.
*/

var getDeviceIdInformation = function (deviceId = "") {

  return new Promise(async (resolve, reject) => {
    try {

      if (FCM_SERVER_KEY == "") {
        throw new Error("Missing FCM_SERVER_KEY.");
      }

      if (deviceId == "") {
        throw new Error("Invalid device id.");
      }

      let reqObj = new request();

      let firebaseApiWithId = 
      gen.utils.checkIfEnvDataExistsOrNot("GOOGLE_API_URL")+ deviceId + "?details=true";

      let response = await reqObj.get(
        firebaseApiWithId,
        {
          "headers": {
            "Authorization": `key=${FCM_SERVER_KEY}`
          }
        }
      );

      return resolve(response);

    } catch (error) {
      return reject(error);
    }
  })

};

/**
  * Send notification to android device.
  * @function
  * @name sendToAndroid
  * @param {Object[]} [deviceIds = []] - Array of device ids.
  * @param {Object} [notificatonData = {}] - notification data.
  * @returns {Promise} returns a promise.
*/


var sendToAndroid = function (deviceIds = [], notificatonData = {}) {

  return new Promise(async function (resolve, reject) {
    try {

      let registrationTokens = new Array;

      if (Array.isArray(deviceIds) && deviceIds.length < 1) {
        throw new Error("Invalid list of device ids.");
      } else if (Array.isArray(deviceIds)) {
        registrationTokens = deviceIds;
      }

      if (typeof (deviceIds) == "string") {
        if (deviceIds == "") {
          throw new Error("Invalid device id.");
        }
        registrationTokens.push(deviceIds);
      }

      if (registrationTokens.length < 1) {
        throw new Error("Invalid list of device ids.");
      }

      let failedTokens = new Array;
      let successFullTokens = new Array;

      /** TODO
      * Max 500 tokens can be pushed, if more than 500, divide in chunks and send.
     */

      let firebaseResponse = await FIREBASE.messaging().sendMulticast({
        android: notificationData,
        tokens: registrationTokens,
      });

      if (firebaseResponse.failureCount > 0) {
        firebaseResponse.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          } else if (resp.success) {
            successFullTokens.push(registrationTokens[idx]);
          }
        });
      }

      if (failedTokens.length > 0) {
        return resolve({
          success: false,
          message: "Failed to send notification",
          failedDeviceIds: failedTokens,
          // successFullTokens: successFullTokens
        });
      }

      return resolve({
        success: true,
        message: `Notification successfully sent to ${deviceIds}`,
        successFullTokens: successFullTokens
      });

    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  sendToDevice: sendToDevice,
  sendToTopic: sendToTopic,
  sendToAndroid: sendToAndroid,
  subscribeDeviceToTopic: subscribeDeviceToTopic,
  unsubscribeDeviceFromTopic: unsubscribeDeviceFromTopic,
  getDeviceIdInformation: getDeviceIdInformation
};