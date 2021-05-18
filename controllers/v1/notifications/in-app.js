/**
 * name : notifications.js
 * author : Aman Jung Karki
 * created-date : 06-Nov-2019
 * modified-date:25-Nov-2019
 * Description : Notification related information for samiksha service.
 */


/**
* dependencies
*/
const notificationsHelper = require(MODULES_BASE_PATH + "/notifications/in-app/helper");

/**
    * In-App Notifications
    * @class
*/
module.exports = class InAppNotifications {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     * @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */

    constructor() {}

    static get name() {
        return "notifications";
    }

    /**
    * @api {get} /kendra/api/v1/notifications/in-app/list?page=:page&limit=:limit 
    * List in-app Notifications
    * @apiVersion 1.0.0
    * @apiGroup inAppNotifications
    * @apiSampleRequest /kendra/api/v1/notifications/in-app/list?page=1&limit=10
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

     /**
      * List all notifications data. 
      * Notifications data may consists of push notifications or in-app notifications.
      * @method
      * @name list
      * @param  {Request} req request body.
      * @returns {JSON} Response with message and result. 
      * Result is an object consisting of data and count.
    */

    async list(req) {
        return new Promise(async (resolve, reject) => {

            try {

                const defaultAppType = gen.utils.checkIfEnvDataExistsOrNot("ASSESSMENT_APPLICATION_APP_TYPE").trim().toLowerCase(); // TODO - After some time if all app start supplying appType in header, remove this line.
                
                let appType = defaultAppType;
                if(req.headers.apptype && req.headers.apptype != "") {
                    appType = req.headers.apptype.trim().toLowerCase();
                }

                let notificationDocument = 
                await notificationsHelper.list(
                    (req.params._id && req.params._id != "") ? 
                    req.params._id 
                    : req.userDetails.id, 
                    req.pageSize, 
                    req.pageNo, 
                    appType
                );

                return resolve({
                    result: notificationDocument,
                    message: constants.apiResponses.NOTIFICATION_LIST
                });

            } catch (error) {
                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                });
            }
        })
    }

    /**
    * @api {get} /kendra/api/v1/notifications/in-app/unReadCount 
    * Count Unread Notifications
    * @apiVersion 1.0.0
    * @apiGroup inAppNotifications
    * @apiSampleRequest /kendra/api/v1/notifications/in-app/unReadCount
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Get the count of all unRead notifications.
      * @method
      * @name unReadCount
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of count and data (which is an array) of app update.
    */

    async unReadCount(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const defaultAppType = 
                gen.utils.checkIfEnvDataExistsOrNot("ASSESSMENT_APPLICATION_APP_TYPE").trim().toLowerCase(); // TODO - After some time if all app start supplying appType in header, remove this line.
                
                let appType = defaultAppType;
                if(req.headers.apptype && req.headers.apptype != "") {
                    appType = req.headers.apptype.trim().toLowerCase();
                }

                let unReadCountDocument = 
                await notificationsHelper.unReadCount(
                    req.userDetails.id, 
                    appType,
                    req.headers.appname,
                    req.headers.os,
                    req.headers.appversion
                );

                return resolve({
                    message: constants.apiResponses.UNREAD_NOTIFICATION,
                    status: httpStatusCode.ok.status,
                    result: {
                        count: unReadCountDocument.count,
                        data: unReadCountDocument.data
                    }
                });

            } catch (error) {
                reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message 
                    || httpStatusCode["internal_server_error"].message
                });
            }
        })
    }

    /**
     * @api {post} /kendra/api/v1/notifications/in-app/markAsRead/{{notificationId}} 
     * Mark as Notification Read
     * @apiVersion 1.0.0
     * @apiGroup inAppNotifications
     * @apiHeader {String} X-authenticated-user-token Authenticity token  
     * @apiHeader {String} appType App Type  
     * @apiSampleRequest /kendra/api/v1/notifications/in-app/markAsRead/1
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * mark is_read true for particular notification.
      * @method
      * @name markAsRead
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of message and status code.
    */

    async markAsRead(req) {
        return new Promise(async (resolve, reject) => {

            try {

                const defaultAppType = gen.utils.checkIfEnvDataExistsOrNot("ASSESSMENT_APPLICATION_APP_TYPE").trim().toLowerCase(); // TODO - After some time if all app start supplying appType in header, remove this line.
                
                let appType = defaultAppType;
                if(req.headers.apptype && req.headers.apptype != "") {
                    appType = req.headers.apptype.trim().toLowerCase();
                }

                await notificationsHelper.markAsRead(
                    req.userDetails.id, 
                    req.params._id, 
                    appType
                );

                return resolve({
                    message: constants.apiResponses.MARK_AS_READ_NOTIFICATION,
                    status: httpStatusCode.ok.status
                });
            } catch (error) {
                reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message 
                    || httpStatusCode["internal_server_error"].message
                });
            }
        })

    }

};

