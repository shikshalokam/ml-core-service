/**
 * name : push.js
 * author : Aman Jung Karki
 * created-date : 25-Nov-2019
 * Description :  Push notifications.
 */

// dependencies

const csv = require('csvtojson');
const userExtensionHelper = require(MODULES_BASE_PATH + "/user-extension/helper");
const pushNotificationsHelper = require(MODULES_BASE_PATH + "/notifications/push/helper");
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");

/**
    * Push Notifications
    * @class
*/

module.exports = class PushNotifications {

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
        return "push";
    }

    /**
     * @api {post} /kendra/api/v1/notifications/push/registerDevice  
     * Register device for push notifications
     * @apiVersion 1.0.0
     * @apiGroup pushNotifications
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParam {File} userData Mandatory userData file of type csv.
     * @apiSampleRequest /kendra/api/v1/notifications/push/registerDevice
     * @apiUse successBody
     * @apiUse errorBody
     */

      /**
      * Register device id for the particular logged in user.
      * @method
      * @name registerDevice
      * @param  {Request}  req  request body.
      * @returns {JSON} Response consists of status and result.Result is an object consists of key-value pairs.
     */

    async registerDevice(req) {
        return new Promise(async (resolve, reject) => {
            try {

                const defaultAppType = 
                gen.utils.checkIfEnvDataExistsOrNot("ASSESSMENT_APPLICATION_APP_TYPE").trim().toLowerCase(); // TODO - After some time if all app start supplying appType in header, remove this line.
                
                let appType = defaultAppType;
                if(req.headers.apptype && req.headers.apptype != "") {
                    appType = req.headers.apptype.trim().toLowerCase();
                }

                let appName = req.headers.appname.trim().toLowerCase();

                let deviceData = {
                    deviceId: req.body.deviceId,
                    os: req.headers.os,
                    app: appName,
                    appType: appType,
                    status: "active",
                    activatedAt: new Date()
                };


                let result = 
                await userExtensionHelper.createOrUpdate(deviceData, _.pick(req.userDetails, ["userId", "email", "userName","userToken"]));

                let response = {};

                if (result && result.success) {

                    response["result"] = {};

                    let topicArray = [ 
                        deviceData.app + process.env.TOPIC_FOR_ALL_USERS,
                        deviceData.app + process.env.TOPIC_FOR_ANDROID_ALL_USERS,
                        deviceData.app + process.env.TOPIC_FOR_IOS_ALL_USERS
                    ];

                    await Promise.all(topicArray.map(async topicName => {

                        deviceData.topic = topicName;
                        let subscribeResult = await pushNotificationsHelper.subscribeToTopic(_.pick(deviceData, ["deviceId", "topic","appType"]));

                        response["result"][topicName] = subscribeResult.success ? "Subscribed" : "Could not subscribee";

                    }));
                } else {
                    response["status"] = httpStatusCode.ok.status;
                }

                return resolve(response);

            } catch (error) {

                return reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message,
                    errorObject: error
                });

            }
        })

    }

    /**
    * @api {post} /kendra/api/v1/notifications/push/pushToTopic 
    * Push Notification to topic
    * @apiVersion 1.0.0
    * @apiGroup pushNotifications
    * @apiSampleRequest /kendra/api/v1/notifications/push/pushToTopic
    * @apiParam {File} pushToTopic Mandatory pushToTopic file of type csv.  
    * @apiUse successBody
    * @apiUse errorBody
    */

     /**
      * Push sample data to the topic given.
      * @method
      * @name pushToTopic
      * @param  {Request}  req  request body.It consists of csv to push data to particular topic.
      * @returns {csv} Response consists of exactly the same csv that we upload with extra column status.
     */

    async pushToTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.pushToTopic) {
                    throw { message: "Missing file of type pushToTopic" };
                }

                let topicData = 
                await csv().fromString(req.files.pushToTopic.data.toString());

                const fileName = `push-to-topic`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                await Promise.all(topicData.map(async singleTopicData => {

                    let topicCsvData = 
                    await pushNotificationsHelper.pushData(singleTopicData);

                    input.push(topicCsvData);

                }))

                input.push(null);

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                });

            }
        })

    }

    /**
    * @api {post} /kendra/api/v1/notifications/push/subscribeToTopic  
    * Subscribe To Topic
    * @apiVersion 1.0.0
    * @apiGroup pushNotifications
    * @apiSampleRequest /kendra/api/v1/notifications/push/subscribeToTopic
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} subscribeToTopic Mandatory subscribeToTopic file of type csv.            
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Subscribe sample data to particular topic.
      * @method
      * @name subscribeToTopic 
      * @param  {Request}  req  request body.It consists of csv to be uploaded for subscribing data to topic.
      * @returns {csv} Response consists of exactly the same csv that we upload with extra column status.
     */

    async subscribeToTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.subscribeToTopic) {
                    throw { message: "Missing file of type subscribeToTopic" };
                }

                let subscribersData = 
                await csv().fromString(req.files.subscribeToTopic.data.toString());

                const fileName = `subscribe-to-topic`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                await Promise.all(subscribersData.map(async subscriber => {

                    let subscribeStatus = 
                    await pushNotificationsHelper.subscribeOrUnSubscribeData(subscriber, true);

                    input.push(subscribeStatus);
                }))

                input.push(null);

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }
        })

    }

    /**
    * @api {post} /kendra/api/v1/notifications/push/unsubscribeFromTopic  
    * Unsubscribe From Topic
    * @apiVersion 1.0.0
    * @apiGroup pushNotifications
    * @apiSampleRequest /kendra/api/v1/notifications/push/unsubscribeFromTopic
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} unsubscribeFromTopic Mandatory unsubscribeFromTopic file of type csv.                
    * @apiUse successBody
    * @apiUse errorBody
    */

     /**
      * UnSubscribe sample data to particular topic.
      * @method
      * @name unsubscribeFromTopic 
      * @param  {Request}  req  request body.It consists of csv to be uploaded for unSubscribing data From topic.
      * @returns {csv} Response consists of exactly the same csv that we upload with extra column status.
     */

    async unsubscribeFromTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.unsubscribeFromTopic) {
                    throw { message: "Missing file of type unSubscribeFromTopic" };
                }

                let unsubscribersData = 
                await csv().fromString(req.files.unsubscribeFromTopic.data.toString());

                const fileName = `unsubscribe-from-topic`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();


                await Promise.all(unsubscribersData.map(async unsubscriber => {
                    let unSubscribeStatus = 
                    await pushNotificationsHelper.subscribeOrUnSubscribeData(unsubscriber);

                    input.push(unSubscribeStatus);
                }))

                input.push(null);

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }
        })

    }

      /**
    * @api {post} /kendra/api/v1/notifications/push/pushToUsers
    * Unsubscribe From Topic
    * @apiVersion 1.0.0
    * @apiGroup notifications
    * @apiSampleRequest /kendra/api/v1/notifications/push/pushToUsers
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} userData Mandatory file of type csv.                
    * @apiUse successBody
    * @apiUse errorBody
    */

     /**
      * Push notification data to pushToUsers.
      * @method
      * @name pushToUsers - send notifications across app eg : bodh,samiksha based
      * on user external ids.
      * @param  {Object} req - All requested data.
     */

    async pushToUsers(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.file || req.file !== "notifications") {
                    throw { message: "Missing file of type notifications" };
                }

                let notificationsData = req.csvData;
                let userExternalIds = [];
                let usersData = [];

                let fileStream = new csvFileStream("push-to-bodh");
                let input = fileStream.initStream();
            
                (async function () {
                  await fileStream.getProcessorPromise();
                  return resolve({
                    isResponseAStream: true,
                    fileNameWithPath: fileStream.fileNameWithPath()
                });
                }());

                notificationsData.forEach(notificationData=>{
                    let userIds = notificationData["userIds"].split(",");

                    if(userIds.length >0) {

                        for(let pointerToUserId = 0;
                            pointerToUserId<userIds.length;
                            pointerToUserId++
                        ) {
                            let notificationData = {...notificationData};
                            notificationData["data"] = notificationData.target ? 
                            {
                                title : notificationData.target
                            } : {};
    
                            delete notificationData.target;
                            delete notificationData.id;
                            delete notificationData.userIds;
                            delete notificationData.users;

                            userExternalIds.push(userIds[pointerToUserId]);
                            notificationData["userExternalId"] = 
                            userIds[pointerToUserId];

                            usersData.push(notificationData);
                        }
                    }
                })

                let userProfiles = 
                await database.models.userExtension.find({
                    externalId: {
                        $in:userExternalIds
                    },
                    status: "active",
                    isDeleted: false
                }, {
                    devices: 1,
                    userId:1,
                    externalId :1
                }).lean();

                let userProfilesData = _.keyBy(userProfiles,"externalId");

                await Promise.all(usersData.map(
                    async singleUserData => {
                        
                        if(userProfilesData[singleUserData.userExternalId]) {
                            let devices = 
                            userProfilesData[singleUserData.userExternalId].devices;

                            let activeDevices =
                            devices.filter(eachUserDevice=>{
                                if(eachUserDevice.app === singleUserData.appname 
                                    && eachUserDevice.os === singleUserData.os && 
                                    eachUserDevice.status !== "inactive") {
                                        return eachUserDevice;
                                    }
                            });

                            if(activeDevices.length>0) {
                                let notifications = 
                                await pushNotificationsHelper.pushToUsers
                                (
                                    singleUserData,
                                    activeDevices,
                                    userProfilesData[singleUserData.userExternalId].userId,
                                    singleUserData.label ? singleUserData.label : ""
                                );
                                
                              
                                singleUserData["status"] = 
                                notifications?"Success":"failure";
                            } else {
                                singleUserData["status"] = "No active devices";
                            }
                        } else {
                            singleUserData["status"] = "User could not be found";
                        }
                        singleUserData.target = singleUserData.data.title;
                        delete singleUserData.data;

                        input.push(singleUserData);
                }));

                input.push(null);


            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }
        })

    }

};

