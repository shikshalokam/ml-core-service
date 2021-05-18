/**
 * name : slack.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : All Slack error message.
 */


/**
 * load modules.
 */

const slackHelper = require(MODULES_BASE_PATH + "/slack/helper");

/**
    * Slack
    * @class
*/
module.exports = class Slack {

    constructor() {}

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     *  @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */


    static get name() {
        return "slack";
    }

    /**
    * @api {post} /kendra/api/v1/slack/error 
    * Send Error Message To Slack
    * @apiVersion 1.0.0
    * @apiGroup Slack
    * @apiSampleRequest /kendra/api/v1/slack/error
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Requests Body:
    *  {
        "slackErrorName":"Samiksha-Error",
        "AppName":"samiksha",
        "Environment":"Testing",
        "Method":"POST",
        "Url":"/assessment-designer-service/api/v1/draftQuestions/create",
        "loggedInUserId" :"e97b5582-471c-4649-8401-3cc4249359bb",
        "error":"name is undefined",
        "color":"#fa3e3e"
        }
    }
    */

    /**
      * Send error message to slack.
      * @method
      * @name error
      * @param  {Request} req - request body.
      * @returns {JSON} Response consists of message and success.
    */

    error(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let sendMessageToSlack = await slackHelper.error(req.body);
                return resolve(sendMessageToSlack);

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                });

            }


        })
    }
};