/**
 * name : delete-read-notifications.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Delete all read notifications every month for samiksha.
 */

 // dependencies

const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications");
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const UNNATI_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_UNNATI_INDEX");

/**
  * Delete all read notifications every month for samiksha.
  * @function
  * @name deleteReadNotification
  * @returns {Promise} return a Promise.
*/

let deleteReadNotification = function () {
  nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_READ_NOTIFICATION, () => {

    logger.info("<-----  Delete Read Notification cron started ---- >", new Date());

    return new Promise(async (resolve, reject) => {

      try {

        let samikshaReadNotification = {
          "users": "all",
          "internal": true,
          "action": "deletion",
          "condition": {
            is_read: true,
            dateDifference: 30
          }
        };

        let unnatiReadNotification = 
        JSON.parse(JSON.stringify(samikshaReadNotification));

        unnatiReadNotification.condition["index"] = UNNATI_INDEX;

        let readNotificationsArray = 
        [samikshaReadNotification, unnatiReadNotification];

        for (let pointerToReadNotifications = 0; 
          pointerToReadNotifications < readNotificationsArray.length; 
          pointerToReadNotifications++) {

            let pushDeleteReadNotificationsToKafka = 
            
            await kafkaCommunication.pushDeletionNotificationsToKafka(
              readNotificationsArray[pointerToReadNotifications]
            );

            if (pushDeleteReadNotificationsToKafka.status != "success") {
              
              let errorObject = {
                slackErrorName: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),
                color: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR"),
                message: `Failed to push read notifications to kafka`
              };

              slackClient.sendMessageToSlack(errorObject);
              return;
            }
          }

        logger.info("<-----  Delete Read Notification cron stopped ---- >", new Date());
        return resolve();

      } catch (error) {
        return reject(error);
      }

    })

  });
}

module.exports = deleteReadNotification;