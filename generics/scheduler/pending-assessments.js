/**
 * name : pending-assessments.js
 * author : Aman Jung Karki
 * Date : 14-Nov-2019
 * Description : Pending Assessments notification should be showned in the app in every 15 days.
 */

// dependencies
const samikshaService = require(ROOT_PATH + "/generics/services/samiksha");
const notificationsHelper = require(MODULES_BASE_PATH + "/notifications/in-app/helper");

/**
  * Pending Assessments notification should be showned in the app in every 15 days.
  * @function
  * @name pendingAssessments
  * @returns {Promise} return a Promise.
*/

let pendingAssessments = function () {

    nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_PENDING_ASSESSMENT, () => {

        logger.info("<---- Pending Assessment cron started  ---->", new Date());

        return new Promise(async (resolve, reject) => {
            try{
                let pendingAssessments = 
                await samikshaService.pendingAssessments();

                if (
                    pendingAssessments.result && 
                    pendingAssessments.result.length > 0
                ) {
    
                    await notificationsHelper.pendingAssessmentsOrObservations(
                        pendingAssessments.result
                    );
                }
    
                logger.info("<---  Pending Assessment cron ended  ---->", new Date());
                resolve();
            } catch(error){
                return reject(error);
            }

        })

    });
}

module.exports = pendingAssessments;