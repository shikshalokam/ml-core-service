/**
 * name : completed-assessments.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : All Completed Assessments notifications of samiksha should be showned once in a month.
 */

// dependencies
const samikshaService = require(ROOT_PATH + "/generics/services/samiksha");
const notificationsHelper = require(MODULES_BASE_PATH + "/notifications/in-app/helper");

/**
  * Completed Assessment functionality. 
  * @function
  * @name completedAssessment
  * @returns {Promise} return a Promise.
*/

let completedAssessment = function () {
  nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_COMPLETED_ASSESSMENT, () => {

    logger.info("<---- Completed Assessment cron started ---->", new Date());

    return new Promise(async (resolve, reject) => {
      try{
        let completedAssessments = await samikshaService.completedAssessments();

        if (
          completedAssessments.result && 
          completedAssessments.result.length > 0
        ) {
  
          await notificationsHelper.completedAssessmentsOrObservations(completedAssessments.result);
  
        }
  
        logger.info("<--- Completed Assessment cron stopped ---->", new Date());
        resolve();
      } catch(error){
        return reject(error);
      }

    })

  });
}

module.exports = completedAssessment;