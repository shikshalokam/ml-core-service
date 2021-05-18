/**
 * name : module/notifications/slack/helper.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Send error messages to slack.
 */

// dependencies
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");

/**
    * SlackHelper
    * @class
*/

module.exports = class SlackHelper {

      /**
      * Send error message to slack.
      * @method
      * @name error
      * @param {Object} data - data
      * @returns {Promise} returns a promise.
     */

    static error(data) {
        return new Promise(async (resolve, reject) => {
            try {

                let slackErrorData = await slackClient.sendMessageToSlack(data);

                return resolve(slackErrorData);

            } catch (error) {
                return reject(error);
            }
        })


    }

};




