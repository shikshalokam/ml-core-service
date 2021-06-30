/**
 * name : elastic-search.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : elastic search common functionality
 */

//dependencies
const ASSESSMENT_APPLICATION_APP_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("ASSESSMENT_APPLICATION_APP_TYPE");

const IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE");

const ASSESSMENT_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_ASSESSMENT_INDEX");

const USER_NOTIFICATION_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_USER_NOTIFICATIONS_TYPE");

const IMPROVEMENT_PROJECT_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_IMPROVEMENT_PROJECT_INDEX");

const COMMON_LANGUAGE_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_COMMON_LANGUAGE_INDEX");

const COMMON_LANGUGAE_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_COMMON_LANGUAGE_TYPE");

const IMPROVEMENT_PROJECT_LANGUAGE_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_IMPROVEMENT_PROJECT_LANGUAGE_INDEX");

const IMPROVEMENT_PROJECT_LANGUAGE_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_IMPROVEMENT_PROJECT_LANGUAGE_TYPE");

const APP_VERSION_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_APP_RELEASES_INDEX");


let moment = require("moment-timezone");


const ALL_CONFIG_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_ALL_CONFIG_TYPE");

const APPLICATION_CONFIG_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_APPLICATION_CONFIG_INDEX")


/**
  * Push notification data to elastic search.
  * @function
  * @name pushNotificationData
  * @param {String} userId - logged in user id.
  * @param {Object} [notificatonData = {}] - notification data.
  * @returns {Promise} returns a promise.
*/

var pushNotificationData = function (userId = "", notificaton = {}) {

  return new Promise(async function (resolve, reject) {
    try {

      if (userId == "") {
        throw "Invalid user id."
      }

      if( Array.isArray(notificaton.appType) && notificaton.appType.length > 0 ) {

        for(let appType = 0; appType < notificaton.appType.length;appType++) {
          let clonedNotificationData = {...notificaton};
          clonedNotificationData.appType = notificaton.appType[appType];
          await _pushNotificationData( userId,clonedNotificationData );
        }

      } else {
        await _pushNotificationData( userId, notificaton );
      }

    } catch (error) {
      return reject(error);
    }
  });
};


/**
  * Helper function for getting ES index based on notification app type.
  * @function
  * @name _getESIndexForNotificationAppType
  * @param {String} appType - Notification app type.
  * @returns {Promise} returns a promise.
*/

var _getESIndexForNotificationAppType = function (appType = "") {
  return new Promise(async function (resolve, reject) {
    try {

      let indexName = ASSESSMENT_INDEX;

      if (appType === IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE) {
        indexName = IMPROVEMENT_PROJECT_INDEX;
      }
      
      if (indexName == "") {
        throw new Error("No elastic search index found.");
      }

      return resolve(indexName);
    }
    catch (error) {
      return reject(error);
    }
  })
};

/**
  * Helper function for pushNotificationData.
  * @function
  * @name _createInAppNotification
  * @param {String} userId - logged in user id.
  * @param {Object} notificatonData  - notification data.
  * @returns {Promise} returns a promise.
*/

var _createInAppNotification = function (userId, notificationData) {
  return new Promise(async function (resolve, reject) {
    try {

      let indexName = await _getESIndexForNotificationAppType(notificationData.appType);

      let notificationCreationObj = {
        id: userId,
        index: indexName,
        type: USER_NOTIFICATION_TYPE
      };

      notificationData.id = 0;

      notificationCreationObj["body"] = {
        notificationCount: 1,
        notificationUnreadCount: 1,
        notifications: [
          notificationData
        ]
      };

      const userNotificationDocCreation = 
      await _createOrUpdateData(notificationCreationObj);

      if (
        !(userNotificationDocCreation.statusCode == httpStatusCode["ok"].status || 
          userNotificationDocCreation.statusCode == httpStatusCode["created"].status)) {
        throw new Error("Failed to create notifications for user in elastic search.");
      }

      return resolve();
    }
    catch (error) {
      return reject(error);
    }
  })
};

/**
  * Helper function for pushNotificationData.
  * @function
  * @name _updateInAppNotification
  * @param {String} userId - logged in user id.
  * @param {Object} notificationDataToBeAdded  - notification data.
  * @param {Object} currentNotifications  - current notifications. 
  * @returns {Promise} returns a promise.
*/

var _updateInAppNotification = function (
  userId, 
  notificationDataToBeAdded, 
  currentNotifications) {

    return new Promise(async function (resolve, reject) {
      try {

        
        let indexName = await _getESIndexForNotificationAppType(notificationDataToBeAdded.appType);

        let notificationUpdationObj = {
          id: userId,
          index: indexName,
          type: USER_NOTIFICATION_TYPE
        };

        let notificationObject = currentNotifications.body._source;

        let arrayOfIds = notificationObject.notifications.map(item => {
          return item.id
        });

        let maximumId = Math.max(...arrayOfIds);

        notificationDataToBeAdded.id = maximumId + 1;

        notificationObject.notifications.push(notificationDataToBeAdded);

        notificationUpdationObj["body"] = {
          doc: {
            notificationCount: notificationObject.notificationCount + 1,
            notificationUnreadCount: notificationObject.notificationUnreadCount + 1,
            notifications: notificationObject.notifications
          }
        };

        const userNotificationDocUpdation = 
        await _createOrUpdateData(notificationUpdationObj, true);

      if (
        userNotificationDocUpdation.statusCode !== httpStatusCode["ok"].status || 
        userNotificationDocUpdation.body.result !== "updated") {
          throw new Error("Failed to push notification to elastic search.");
      }

        return resolve();
    }
    catch (error) {
      return reject(error);
    }
  })
};

/**
  * Update notification data.
  * @function
  * @name updateNotificationData
  * @param {String} [userId = ""] - logged in user id.
  * @param {Number} [notificatonNumber = 0] - id of notification.
  * @param {Number} [notificationData = {}] - notification data to update.
  * @param {Object} [notificationData = {}] - notification data to update.
  * @param {String} [appType = ""] - app type.
  * @returns {Promise} returns a promise.
*/

var updateNotificationData = function (
  userId = "", 
  notificatonNumber = 0, 
  notificationData = {}, 
  appType = ""
) {


    return new Promise(async function (resolve, reject) {
      try {

        if (userId == "") {
          throw "Invalid user id."
        }

        let indexName = await _getESIndexForNotificationAppType(appType);

        let userNotificationDocument = 
        await getNotificationData(userId, appType);

      if (
        userNotificationDocument.body.error && 
        userNotificationDocument.statusCode == httpStatusCode["not_found"].status) {
          
          return resolve({
          success: false,
          message: "No notification document found."
          });

      } else if (userNotificationDocument.statusCode == httpStatusCode["ok"].status) {

        let notificationObject = userNotificationDocument.body._source;

        let matchedNotificationData = 
        notificationObject.notifications.find(singleNotification => {
          return singleNotification.id === notificatonNumber
        });

        Object.keys(notificationData).forEach(keyToBeUpdated => {
          matchedNotificationData[keyToBeUpdated] = notificationData[keyToBeUpdated];
        });

        let updateData = {
          id: userId,
          index: indexName,
          type: USER_NOTIFICATION_TYPE,
          body: {
            doc: {
              notificationCount: notificationObject.notifications.length,
              notificationUnreadCount: 
              notificationObject.notifications.filter(
                notification => 
                notification.is_read == false).length,
              notifications: notificationObject.notifications
            }
          }
        };

        const userNotificationDocUpdation = 
        await _createOrUpdateData(updateData, true);

        if (userNotificationDocUpdation.statusCode !== httpStatusCode["ok"].status) {
          throw "Failed to push notification to elastic search.";
        }

      } else {
        throw "Something went wrong!";
      }

      return resolve({
        success: true,
        message: "Notification successfully updated in elastic search."
      });

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  *  Get notification data based on userId.
  * @function
  * @name getNotificationData
  * @param {String} [userId = ""] - logged in user id.
  * @param {String} [appType = ""] - app type.
  * @returns {Promise} returns a promise.
*/

var getNotificationData = function (userId = "", appType = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client){
        throw "Elastic search is down.";
      }

      if (userId == "") {
        throw "Invalid user id.";
      }

      let notificationInfo = {};

      let indexName = await _getESIndexForNotificationAppType(appType);

      notificationInfo["id"] = userId;
      notificationInfo["index"] = indexName;
      notificationInfo["type"] = USER_NOTIFICATION_TYPE;

      const userNotificationDocument = await getData(notificationInfo);

      return resolve(userNotificationDocument);

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * Delete read or unRead notification data.
  * @function
  * @name deleteReadOrUnReadNotificationData
  * @param {String} [users = "all"] 
  * @param {Object} notificationData - notification data to update.
  * @returns {Promise} returns a promise.
*/

var deleteReadOrUnReadNotificationData = function (users = "all", notificationData) {

  return new Promise(async function (resolve, reject) {
    try {

      let appIndex = "";

      if (
        notificationData.condition.index && 
        notificationData.condition.index !== "") {
        appIndex = notificationData.condition.index;
      }

      let indexName = await _getESIndexForNotificationAppType(appIndex);

      let allData = await _searchForAllData(indexName, USER_NOTIFICATION_TYPE);

      let currentDate = moment(new Date());
      let allUserData = allData;

      if (Array.isArray(users) && users.length > 0) {

        allUserData = allData.filter(singleIndexData => {
          if (users.indexOf(singleIndexData.id) !== -1) {
            return singleIndexData.notifications;
          }
        })

      }

      for (
        let pointerToIndexData = 0; 
        pointerToIndexData < allUserData.length; 
        pointerToIndexData++
        ) {
          
          let userId = allUserData[pointerToIndexData].id;
          let notificationsSize = allUserData[pointerToIndexData].notifications.length;

          for (
            let notificationIndex = 0; 
            notificationIndex < notificationsSize;
            notificationIndex++) {

              let currentNotificationData = 
              allUserData[pointerToIndexData].notifications[notificationIndex];

              let notificationCreatedDate = 
              moment(currentNotificationData.created_at);

              let dateDifferenceFromTheCreatedDate = 
              currentDate.diff(notificationCreatedDate, 'days');

              if (
                currentNotificationData.is_read === notificationData.condition.is_read 
                && dateDifferenceFromTheCreatedDate >= notificationData.condition.dateDifference
                ) {
                await deleteNotificationData(userId, currentNotificationData.id, appIndex);
              }
          }
      }
    }

    catch (error) {
      return reject(error);
    }
  });
};

/**
  * Delete notification data based on userId.
  * @function
  * @name deleteNotificationData
  * @param {String} userId - logged in user id.
  * @param {Number} notificationId - id of notification.
  * @param {String} appIndex - elastic search app index.
  * @returns {Promise} returns a promise.
*/

var deleteNotificationData = function (userId, notificationId, appIndex) {
  return new Promise(async function (resolve, reject) {
    try {
      let userNotificationDocument = await getNotificationData(userId, appIndex);

      if (userNotificationDocument.statusCode == httpStatusCode["not_found"].status) {

        return resolve({
          success: false,
          message: "No notification document found."
        });

      } else if (userNotificationDocument.statusCode == httpStatusCode["ok"].status) {

        let indexName = appIndex !== "" ? appIndex : ASSESSMENT_INDEX;

        let notificationObject = userNotificationDocument.body._source;

        let findIndexOfNotification = 
        notificationObject.notifications.findIndex(item => item.id === notificationId);

        notificationObject.notifications.splice(findIndexOfNotification, 1);

        let userNotificationDocDeletion;

        if (notificationObject.notifications.length > 0) {

          let updateData = {
            id: userId,
            index: indexName,
            type: USER_NOTIFICATION_TYPE,
            body: {
              doc: {
                notificationCount: notificationObject.notifications.length,
                notificationUnreadCount: 
                notificationObject.notifications.filter(
                  notification => notification.is_read == false
                  ).length,
                notifications: notificationObject.notifications
              }
            }
          };

          userNotificationDocDeletion = await _createOrUpdateData(updateData, true);

        } else {

          userNotificationDocDeletion = await deleteDocumentFromIndex(
            indexName,
            USER_NOTIFICATION_TYPE,
            userId
          );

        }

        if (userNotificationDocDeletion.statusCode !== httpStatusCode["ok"].status) {
          throw "Failed to delete notification in elastic search.";
        }
        return resolve();
      }
    } catch (error) {
      return reject(error);
    }
  })
};

/**
  *  Push language data in elastic search.
  * @function
  * @name pushLanguageData
  * @param {String} languageId - language id.
  * @param {Object} [languageData = {}] - Language data.
  * @returns {Promise} returns a promise.
*/


var pushLanguageData = function (languageId = "", languageData = {}, appType = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (languageId == "") {
        throw "Invalid language id.";
      }

      let languageInfo = {};
      languageInfo["index"] = COMMON_LANGUAGE_INDEX;
      languageInfo["type"] = COMMON_LANGUGAE_TYPE;
      
      if(appType !== "" && appType === IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE) {
        languageInfo["index"] = IMPROVEMENT_PROJECT_LANGUAGE_INDEX;
        languageInfo["type"] = IMPROVEMENT_PROJECT_LANGUAGE_TYPE;
      }

      languageInfo["id"] = languageId;

      let languageDocument = await getData(languageInfo);

      let languageObj = { ...languageInfo }

      if (languageDocument.statusCode === httpStatusCode["not_found"].status) {

        languageObj["body"] = {
          translate: languageData
        }

        const languageDocCreation = await _createOrUpdateData(languageObj)

        if (
          !(languageDocCreation.statusCode == httpStatusCode["ok"].status || 
            languageDocCreation.statusCode == httpStatusCode["created"].status)
            ) {
          throw new Error(`Failed to push language ${languageId} in elastic search.`)
        }

      } else if (languageDocument.statusCode == httpStatusCode["ok"].status) {

        languageObj["body"] = {
          doc: {
            translate: languageData
          }
        }

        const languageDocUpdation = await _createOrUpdateData(languageObj, true);

        if (languageDocUpdation.statusCode !== httpStatusCode["ok"].status) {
          throw new Error("Failed to push notification to elastic search.");
        }

      } else {
        throw new Error("Something went wrong!");
      }

      return resolve({
        success: true,
        message: "Notification successfully pushed to elastic search."
      })

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * update app version data and push it to elastic search.
  * @function
  * @name updateAppVersion
  * @param {Object} versionData - Version data.
  * @returns {Promise} returns a promise.
*/

var updateAppVersion = function (versionData) {

  return new Promise(async function (resolve, reject) {
    try {

      if (versionData.appName == "") {
        throw "Invalid appName.";
      }

      let versionInfo = {};

      versionInfo["id"] = versionData.appName;
      versionInfo["index"] = APP_VERSION_INDEX;
      versionInfo["type"] = USER_NOTIFICATION_TYPE;

      let appVersionDocument = await getData(versionInfo);

      let versionObj = { ...versionInfo };

      versionData.action = "alertModal";

      if (appVersionDocument.statusCode === httpStatusCode["not_found"].status) {

        versionObj["body"] = versionData;

        const appVersionCreation = await _createOrUpdateData(versionObj);

        if (
          !(appVersionCreation.statusCode == httpStatusCode["ok"].status || 
            appVersionCreation.statusCode == httpStatusCode["created"].status)) {
          throw new Error(`Failed to push app version in elastic search.`);
        }

      } else if (appVersionDocument.statusCode == httpStatusCode["ok"].status) {

        let existingLatestVersion = appVersionDocument.body._source;

        if (existingLatestVersion.payload.appVersion !== versionData.payload.appVersion) {

          versionObj["body"] = {
            doc: versionData
          };

          const appVersionUpdation = await _createOrUpdateData(versionObj, true);

          if (appVersionUpdation.statusCode !== httpStatusCode["ok"].status) {
            throw new Error("Failed to push notification to elastic search.");
          }

        }

      } else {
        throw "Something went wrong!";
      }

      return resolve({
        success: true
      });

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * update app version data and push to loggedin user and display as an in-app.
  * @function
  * @name pushAppVersionToLoggedInUser
  * @param {Object} userDetails - logged in user details.
  * @param {Object} headers - headers data.
  * @param {String} headers.appName - name of the app. 
  * @returns {Promise} returns a promise.
*/


var pushAppVersionToLoggedInUser = function ( userId,appName,appType ) {

  return new Promise(async function (resolve, reject) {
    try {

      if (appType == "") {
        throw "Invalid appName.";
      }

      let versionInfo = {};

      versionInfo["id"] = appName;
      versionInfo["index"] = APP_VERSION_INDEX;
      versionInfo["type"] = USER_NOTIFICATION_TYPE;

      let appVersionDocument = await getData(versionInfo);

      if (appVersionDocument.statusCode === httpStatusCode["ok"].status) {

        let versionData = appVersionDocument.body._source;
        versionData["created_at"] = new Date();

        let userNotificationDocument = 
        await getNotificationData(userId, appType);

        if (userNotificationDocument.statusCode === httpStatusCode["not_found"].status) {
          await _createInAppNotification(userId, versionData);
        } else {

          let notificationData = 
          userNotificationDocument.body._source.notifications.find(
            item => item.action === "alertModal" && 
            item.payload.appVersion === versionData.payload.appVersion);

          if (!notificationData) {
            await _updateInAppNotification(userId, versionData, userNotificationDocument);
          }

        }

      }

      return resolve({
        success: true
      });

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * Get the language data based on language id.
  * @function
  * @name getLanguageData
  * @param {String} languageId - Language Id.
  * @returns {Promise} returns a promise.
*/

var getLanguageData = function (languageId = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) throw new Error("Elastic search is down.");

      if (languageId == "") throw new Error("Invalid language id.");

      const languageDocument = await getData(languageId);

      return resolve(languageDocument);

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  *  Get the list of all the languages.
  * @function
  * @name getAllLanguagesData
  * @returns {Promise} returns a promise.
*/

var getAllLanguagesData = function (appName) {
  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) {
        throw "Elastic search is down.";
      }

      let languageIndex = COMMON_LANGUAGE_INDEX;
      let languageType = COMMON_LANGUGAE_TYPE;

      if(appName === IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE){
        languageIndex = IMPROVEMENT_PROJECT_LANGUAGE_INDEX;
        languageType = IMPROVEMENT_PROJECT_LANGUAGE_TYPE;
      }

      const checkIndexExistsOrNot = await _indexExistOrNot(languageIndex);

      const checkTypeExistsOrNot = 
      await _typeExistsOrNot(languageIndex, languageType);

      let userNotificationDocument = [];

      if (checkIndexExistsOrNot.statusCode !== httpStatusCode["not_found"].status && 
        checkTypeExistsOrNot.statusCode !== httpStatusCode["not_found"].status) {

          userNotificationDocument = 
          await _searchForAllData(languageIndex, languageType);
      }
      
      return resolve(userNotificationDocument);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * Get all data based on id,index and type.
  * @function
  * @name getData
  * @returns {Promise} returns a promise.
*/

var getData = function (data) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!data.id) {
        throw "id is required";
      }

      if (!data.index) {
        throw "index is required";
      }

      if (!data.type) {
        throw "type is required";
      }

      const result = await elasticsearch.client.get({
        id: data.id,
        index: data.index,
        type: data.type
        // include_type_name : true <- Not required
      }, {
          ignore: [httpStatusCode["not_found"].status],
          maxRetries: 3
        });

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};


/**
  * Create Or Update Operation.
  * @function
  * @name createOrUpdateDocumentInIndex
  * @param {String} id - (Non - Mandatory) Document ID.
  * @param {String} index - Index from which document is to deleted
  * @param {String} type - Type from which document is to deleted
  * @param {Object} data - Document Data to be created.
  * @returns {Promise} returns a promise.
*/

var createOrUpdateDocumentInIndex = function (index = "", type = "", id = "", data = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (index == "") {
        throw new Error("Index is required");
      }

      if (type == "") {
        throw new Error("Type is required");
      }

      if (id == "") {
        throw new Error("ID is required");
      }

      if (Object.keys(data).length == 0) {
        throw new Error("Data is required");
      }
      
      let documentObject = {
        id: id,
        index: index,
        type: type,
        body: {
          doc : data,
          doc_as_upsert : true,
        },
        refresh : true
      }

      let result = await elasticsearch.client.update(documentObject);

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * Create Or update operation.
  * @function
  * @name _createOrUpdateData
  * @param {Object} data - Data to be created or updated.
  * @param {String} [update = false] - if update is true update else create.
  * @returns {Promise} returns a promise.
*/

var _createOrUpdateData = function (data, update = false) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!data.id) {
        throw "id is required";
      }

      if (!data.index) {
        throw "index is required";
      }

      if (!data.type) {
        throw "type is required";
      }

      if (!data.body) {
        throw "body is required";
      }

      let result;

      if (update) {
        result = await elasticsearch.client.update({
          id: data.id,
          index: data.index,
          type: data.type,
          body: data.body
        });
      } else {
        result = await elasticsearch.client.create({
          id: data.id,
          index: data.index,
          type: data.type,
          body: data.body
        });
      }

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * Check for index exists or not.
  * @function
  * @name _indexExistOrNot
  * @param {String} index - name of the index.
  * @returns {Promise} returns a promise.
*/

var _indexExistOrNot = function (index) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is not found";
      }

      let result = await elasticsearch.client.indices.exists({
        index: index
      });

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * Check for index exists or not.
  * @function
  * @name _typeExistsOrNot
  * @param {String} index - name of the index for elastic search.
  * @param {String} type - type for elastic search. 
  * @returns {Promise} returns a promise.
*/

var _typeExistsOrNot = function (index, type) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is required";
      }

      if (!type) {
        throw "type is required";
      }

      let result = await elasticsearch.client.indices.existsType({
        index: index,
        type: type
      });

      return resolve(result);

    } catch (error) {

      return reject(error);
    }
  })
};


/**
  * Check for index exists or not.
  * @function
  * @name _typeExistsOrNot
  * @param {String} index - name of the index for elastic search.
  * @param {String} type - type for elastic search. 
  * @returns {Promise} returns a promise.
*/

var _indexTypeMappingExistOrNot = function (index, type) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is required";
      }

      if (!type) {
        throw "type is required";
      }

      let result = await elasticsearch.client.indices.getMapping({
        index: index,
        type: type,
        include_type_name : true
      });

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * search operation.
  * @function
  * @name _searchForAllData
  * @param {String} index - name of the index for elastic search.
  * @param {String} type - type for elastic search. 
  * @returns {Promise} returns a promise.
*/

var _searchForAllData = function (index, type) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is required";
      }

      if (!type) {
        throw "type is required";
      }

      const result = await elasticsearch.client.search({
        index: index,
        type: type,
        size: 1000
      });

      let response = [];

      if (result.statusCode === httpStatusCode["ok"].status && result.body.hits.hits.length > 0) {

        result.body.hits.hits.forEach(eachResultData => {
          response.push(_.merge({ id: eachResultData._id }, eachResultData._source));
        })
      }

      return resolve(response);

    } catch (error) {
      return reject(error);
    }
  })
};


/**
  * Search document from Index by query string.
  * @function
  * @name searchDocumentFromIndex
  * @param {String} index - Index from which document is to deleted
  * @param {String} type - Type from which document is to deleted
  * @param {Object} queryObject - Query in the Lucene query string syntax
  * @param {Int} page - Page No.
  * @param {Int} size - No. of documents to return
  * @returns {Promise} returns a promise.
*/

var searchDocumentFromIndex = function (index = "", type = "", queryObject = "", page = 1, size = 10) {

  return new Promise(async function (resolve, reject) {
    try {

      if (index == "") {
        throw new Error("Index is required");
      }

      if (type == "") {
        throw new Error("Type is required");
      }

      if (Object.keys(queryObject).length == 0) {
        throw new Error("Query Object is required");
      }
      
      let documentObject = {
        index: index,
        type: type,
        body: queryObject
      }

      if(size != "all") {
        documentObject.size = size
      }

      let result = await elasticsearch.client.search(documentObject);

      let searchDocuments = [];

      if (result.statusCode === httpStatusCode["ok"].status && result.body.hits.hits.length > 0) {

        result.body.hits.hits.forEach(eachResultData => {
          searchDocuments.push(_.merge({ id: eachResultData._id }, eachResultData._source));
        })

      } else if (result.statusCode === httpStatusCode["ok"].status && result.body.suggest && Object.keys(result.body.suggest).length > 0) {
        searchDocuments = result.body.suggest;
      } else {
        throw new Error("Failed to get search results from index.")
      }

      return resolve(searchDocuments);

    } catch (error) {
      return reject(error);
    }
  })
};


/**
  * Delete document from Index by ID or Query string.
  * @function
  * @name deleteDocumentFromIndex
  * @param {String} index - Index from which document is to deleted
  * @param {String} type - Type from which document is to deleted
  * @param {String} id - Document ID to deleted
  * @param {Object} queryObject - Query in the Lucene query string syntax
  * @returns {Promise} returns a promise.
*/

var deleteDocumentFromIndex = function (index = "", type = "", id = "", queryObject = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (index == "") {
        throw new Error("Index is required");
      }

      if (type == "") {
        throw new Error("Type is required");
      }

      if (id == "" && Object.keys(queryObject).length == 0) {
        throw new Error("Document ID or Query Object is required");
      }
      
      let result = null;
      
      if(id && id != "") {
        result = await elasticsearch.client.delete({
          id: id,
          index: index,
          type: type,
          refresh : true
        });
      } else if(Object.keys(queryObject).length > 0) {
        result = await elasticsearch.client.deleteByQuery({
          body : {
            query: {
              match : queryObject
            }
          },
          index: index,
          type: type,
          refresh : true
        });
      }

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  *  Get the list of all the languages.
  * @function
  * @name getAllLanguagesData
  * @returns {Promise} returns a promise.
*/

var getAllApplicationConfig = function () {
  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) {
        throw "Elastic search is down.";
      }

      const checkIndexExistsOrNot = await _indexExistOrNot(APPLICATION_CONFIG_INDEX);

      const checkTypeExistsOrNot = 
      await _typeExistsOrNot(APPLICATION_CONFIG_INDEX, ALL_CONFIG_TYPE);

      if (checkIndexExistsOrNot.statusCode !== httpStatusCode["not_found"].status && 
        checkTypeExistsOrNot.statusCode !== httpStatusCode["not_found"].status) {

          const allConfig = 
          await _searchForAllData(APPLICATION_CONFIG_INDEX, ALL_CONFIG_TYPE);
          
          return resolve(allConfig);
      }

    } catch (error) {
      return reject(error);
    }
  })
};

var pushAppConfigData = function (confgData = {}) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!confgData.id || confgData.id == "") {
        throw "Invalid confg id.";
      }

      let configObj = {};

      configObj["id"] = confgData.id
      configObj["index"] = APPLICATION_CONFIG_INDEX;
      configObj["type"] = ALL_CONFIG_TYPE;

       let configDocument = await getData(configObj);

      let appConfigObj = configObj;
      if (configDocument.statusCode === httpStatusCode["not_found"].status) {

       
        confgData.version = "0.0.1";
        appConfigObj["body"] = {
          doc:{
            config:confgData,
            version:version
          }
        } 
        const configDocCreation = await _createOrUpdateData(appConfigObj);

        if (
          !(configDocCreation.statusCode == httpStatusCode["ok"].status || 
            configDocCreation.statusCode == httpStatusCode["created"].status)
            ) {
          throw new Error(`Failed to push language ${confgData.id} in elastic search.`)
        }

      } else if (configDocument.statusCode == httpStatusCode["ok"].status) {

       
        let currentV = configDocument.body['_source']['config'].version;

        let versionChange = currentV.split(".");

        if( confgData.updateType && confgData.updateType=='major'){

          version = ( parseInt(versionChange[0]) + 1 ) + "."+ parseInt(versionChange[1]) + "." + parseInt(versionChange[2]);
          delete confgData.updateType;
         
        }else if( confgData.updateType && confgData.updateType=='minor'){
          version = parseInt(versionChange[0]) + "."+ ( parseInt(versionChange[1]) + 1 ) + "." + parseInt(versionChange[2]);
          delete confgData.updateType;
        }else {
          // version = versionChange[2] + 1
          delete confgData.updateType;
          version =  parseInt(versionChange[0]) + "."+ parseInt(versionChange[1]) + "." + ( parseInt(versionChange[2]) + 1 );
        }

        confgData.version =version;
        // console.log("version--",version);

        appConfigObj["body"] = {
          doc : {
            config : confgData
          }
        };

        const configDataUpdate = await _createOrUpdateData(appConfigObj, true);

        if (configDataUpdate.statusCode !== httpStatusCode["ok"].status) {
          throw new Error("Failed to push notification to elastic search.");
        }

      } else {
        throw "Something went wrong!"
      }

      return resolve({
        success: true,
        message: "Notification successfully pushed to elastic search."
      })

    } catch (error) {
      return reject(error);
    }
  });
};


/**
  *  Check if index exists in elastic search.
  * @function
  * @name checkIfIndexExists
  * @returns {Promise} returns a promise.
*/

var getIndexTypeMapping = function (indexName = "", typeName = "") {
  return new Promise(async function (resolve, reject) {
    try {

      if(indexName == "") {
        throw new Error("Invalid index name.");
      }

      if(typeName == "") {
        throw new Error("Invalid type name.");
      }

      if (!elasticsearch.client) {
        throw new Error("Elastic search is down.");
      }

      const checkIndexTypeMappingExistsOrNot = 
      await _indexTypeMappingExistOrNot(indexName, typeName);

      return resolve(checkIndexTypeMappingExistsOrNot);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * Helper function for pushing notification data.
  * @function
  * @name _pushNotificationData - helper function for pushing notification data.
  * @returns {Promise} returns a promise.
*/

var _pushNotificationData = function ( userId, notification) {
  return new Promise(async function (resolve, reject) {
    try {

      let notificationData = 
      await getNotificationData(userId, notification.appType);

      if (notificationData.statusCode == httpStatusCode["not_found"].status) {

        await _createInAppNotification(userId, notification);

      } else if (notificationData.statusCode == httpStatusCode["ok"].status) {

        await _updateInAppNotification(userId, notification, notificationData);

      } else {
        throw "Something went wrong!";
      }

      return resolve({
        success: true,
        message: "Notification successfully pushed to elastic search."
      });
    } catch (error) {
      return reject(error);
    }
  })
};


/**
  * Set index mapping.
  * @function
  * @name setIndexTypeMapping
  * @param {String} index - name of the index for elastic search.
  * @param {String} type - type for elastic search. 
  * @param {Object} mapping - mapping for elastic search. 
  * @returns {Promise} returns a promise.
*/

var setIndexTypeMapping = function (index = "", type = "", mapping) {

  return new Promise(async function (resolve, reject) {
    try {

      if (index == "") {
        throw new Error("Index is required");
      }

      if (type == "") {
        throw new Error("Type is required");
      }


    const putMapping = await elasticsearch.client.indices.putMapping({
      index: index,
      type: type,
      body: mapping,
      include_type_name : true
    });

    if(putMapping.statusCode != 200) {
      throw new Error("Error while updating mapping for index.");
    }
    
    return resolve(putMapping);

    } catch (error) {
      return reject(error);
    }
  })
};


/**
  * Create index.
  * @function
  * @name createIndex
  * @param {String} index - name of the index for elastic search.
  * @returns {Promise} returns a promise.
*/

var createIndex = function (index = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (index == "") {
        throw new Error("Index is required");
      }
      
      const createIndex = await elasticsearch.client.indices.create({ index: index});

      if(createIndex.statusCode != 200) {
        throw new Error("Error while creating bodh content index.")
      }
    
      return resolve(createIndex);

    } catch (error) {
      return reject(error);
    }
  })
};

module.exports = {
  pushNotificationData : pushNotificationData,
  getNotificationData : getNotificationData,
  updateNotificationData : updateNotificationData,
  deleteReadOrUnReadNotificationData : deleteReadOrUnReadNotificationData,
  deleteNotificationData : deleteNotificationData,
  pushLanguageData : pushLanguageData,
  getLanguageData : getLanguageData,
  getAllLanguagesData : getAllLanguagesData,
  getData : getData,
  updateAppVersion : updateAppVersion,
  pushAppVersionToLoggedInUser : pushAppVersionToLoggedInUser,
  getAllApplicationConfig : getAllApplicationConfig,
  pushAppConfigData : pushAppConfigData,
  getIndexTypeMapping : getIndexTypeMapping,
  deleteDocumentFromIndex : deleteDocumentFromIndex,
  createOrUpdateDocumentInIndex : createOrUpdateDocumentInIndex,
  searchDocumentFromIndex : searchDocumentFromIndex,
  createIndex : createIndex,
  setIndexTypeMapping : setIndexTypeMapping
};