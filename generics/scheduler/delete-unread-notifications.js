/**
 * name : delete-unread-notifications/samiksha.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Delete all unread notifications every 3 month in samiksha.
 */

// const KAFKA_COMMUNICATION = require(ROOT_PATH + "/generics/helpers/kafka-communications")
// const SLACK_CLIENT = require(ROOT_PATH + "/generics/helpers/slack-communications");

// let deleteUnReadNotifications = function () {
// nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_UNREAD_NOTIFICATION, () => {

//   logger.info("<-----  Delete UnRead Notification cron started ---- >", new Date());

//   return new Promise(async (resolve, reject) => {

//     try {

//       logger.info("Delete unread notifications for samiksha is closed")

// let samikshaUnReadNotification = {
//   "users": "all",
//   "internal": true,
//   "action": "deletion",
//   "condition": {
//     is_read: true,
//     dateDifference: 90
//   }
// }

// let unnatiUnReadNotification = JSON.parse(JSON.stringify(samikshaUnReadNotification));
// unnatiUnReadNotification.condition["index"] = unnatiIndex

// let unreadNotificationsArray = [samikshaReadNotification, unnatiReadNotification]

// for (let pointerToUnReadNotifications = 0; pointerToUnReadNotifications < unreadNotificationsArray.length; pointerToUnReadNotifications++) {

//   let pushUnDeleteReadNotificationsToKafka = await KAFKA_COMMUNICATION.pushDeletionNotificationsToKafka(unreadNotificationsArray[pointerToUnReadNotifications]);

//   if (pushUnDeleteReadNotificationsToKafka.status != "success") {
//     let errorObject = {
//       message: `Failed to push unread notifications to kafka`,
//     }
//const SLACK_CLIENT.kafkaErrorAlert(errorObject)
//     return;
//   }
// }

//       return resolve()

//     } catch (error) {
//       return reject(error)
//     }

//   })

// });
// }

// module.exports = deleteUnReadNotifications;