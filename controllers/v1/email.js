/**
 * name : email.js
 * author : Aman Jung Karki
 * created-date : 03-Dec-2019
 * Description : Email.
 */


/**
 * dependencies
 */

const emailHelper = require(MODULES_BASE_PATH + "/email/helper.js");

/**
    * Email
    * @class
*/

module.exports = class Email {

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
        return "email";
    }

    /**
     * @api {post} /kendra/api/v1/email/jenkins 
     * send email to users
     * @apiVersion 1.0.0
     * @apiGroup Email
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/email/jenkins
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
	    "subject": "Regarding nodemailer",
	    "text": "First Text",
	    "html":"<p><b>Hello</b> from Angel Drome!</p>"
        }
    */

    /**
      *  send email notifications.
      * @method
      * @name jenkins
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of status and message.
     */

    jenkins(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let emailSent = await emailHelper.sendJenkinsEmail(req.body);

                return resolve({
                    result: emailSent
                })

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                })

            }


        })
    }

};

