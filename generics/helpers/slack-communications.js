/**
 * name : slack-communications.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : Slack error message.
 */

//dependencies

const request = require('./http-request');
const SLACK_COMMUNICATION_ON_OFF = process.env.SLACK_COMMUNICATIONS_ON_OFF;
const SLACK_TOKEN = process.env.SLACK_TOKEN
const SLACK_HOOK = process.env.SLACK_EXCEPTION_LOG_URL;
const ERROR_MESSAGES_TO_SLACK = 
(!process.env.ERROR_MESSAGE_TO_SLACK || 
  !process.env.ERROR_MESSAGE_TO_SLACK != "OFF") ?
 "ON" : 
 "OFF";

/**
  * Send the error message to slack.
  * @function
  * @name sendMessageToSlack
  * @param {Object} errorMessage - error message to be sent to slack.
  * @returns {Promise} returns a promise.
*/

let sendMessageToSlack = function (errorMessage) {
  return new Promise(async (resolve, reject) => {
    try {

      if (SLACK_COMMUNICATION_ON_OFF === "ON" && 
      ERROR_MESSAGES_TO_SLACK === "ON" && SLACK_TOKEN != "") {

        let reqObj = new request()
        let attachmentData = new Array
        let fieldsData = new Array

        Object.keys(errorMessage).forEach(objValue => {

          if (objValue !== "slackErrorName" && objValue !== "color") {
            fieldsData.push({
              title: objValue,
              value: errorMessage[objValue],
              short: false
            })
          }
        })


        fieldsData.push({
          title: "Environment",
          value: process.env.NODE_ENV,
          short: false
        })

        let attachment = {
          color: errorMessage.color,
          pretext: errorMessage,
          text: "More information below",
          fields: fieldsData
        }
        attachmentData.push(attachment)

        var options = {
          json: {
            text: errorMessage.slackErrorName,
            attachments: attachmentData
          }
        }

        let sendMessageToSlack = await reqObj.post(
          SLACK_HOOK,
          options
        )

        if (sendMessageToSlack.data !== "ok") {
          throw Error("Slack message was not posted")
        }

        return resolve({
          success: true,
          message: "Slack message posted."
        });

      } else {
        return resolve({
          success: false,
          message: "Slack configuration is not done"
        })
      }
    } catch (error) {
      return reject(error)
    }
  })
}

module.exports = {
  sendMessageToSlack: sendMessageToSlack
};
