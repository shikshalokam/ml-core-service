/**
 * name : pending-observations.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Pending Observations notification of samiksha should be showned in the app in every 15 days.
 */

// dependencies

const samikshaService = require(ROOT_PATH + "/generics/services/samiksha");
const notificationsHelper = require(MODULES_BASE_PATH + "/notifications/in-app/helper");

/**
  * Pending Observations notification of samiksha should be showned in the app in every 15 days.
  * @function
  * @name pendingObservations
  * @returns {Promise} return a Promise.
*/

let pendingObservations = function () {
  nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_PENDING_OBSERVATION, () => {

    logger.info("<----- Pending Observations cron started ---->", new Date());

    return new Promise(async (resolve, reject) => {
      try{
        let pendingObservations = await samikshaService.pendingObservations();

        if ( pendingObservations.result && pendingObservations.result.length > 0 ) {
          await notificationsHelper.pendingAssessmentsOrObservations(
            pendingObservations.result, true
          );
        }
  
        logger.info("<----- Pending Observations cron stopped --->", new Date());
        resolve();
      } catch(error) {
        return reject(error);
      }

    })

  });
}

module.exports = pendingObservations;