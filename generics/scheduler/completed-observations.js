/**
 * name : completed-observations.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : All Completed Observations notifications of samiksha should be showned once in a month.
 */

// dependencies
const samikshaService = require(ROOT_PATH + "/generics/services/samiksha");
const notificationsHelper = require(MODULES_BASE_PATH + "/notifications/in-app/helper");

/**
  * Completed Observations functionality.
  * @function
  * @name completedObservation
  * @returns {Promise} return a Promise.
*/

let completedObservation = function () {
  nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_COMPLETED_OBSERVATION, () => {

    logger.info("<---- Completed Observations cron started ---->", new Date());

    return new Promise(async (resolve, reject) => {
      try{
        let completedObservations = await samikshaService.completedObservations();

        if (
          completedObservations.result && 
          completedObservations.result.length > 0
        ) {
  
          await notificationsHelper.completedAssessmentsOrObservations(completedObservations.result, true);
        }
  
        logger.info("<---- Completed Observations cron stopped --->", new Date());
        resolve();
      } catch(err){
        return reject(err);
      }

    })

  });
}

module.exports = completedObservation;