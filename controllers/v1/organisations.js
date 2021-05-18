/**
 * name : organisation.js
 * author : Aman 
 * created-date : 05-May-2020
 * Description : Organisations detail information. 
 */

const organisationHelper = require(ROOT_PATH + "/module/organisations/helper");
 
  /**
     * Organisations
     * @class
 */

module.exports = class Organisations {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     * @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */

    constructor(){}
  
    static get name() {
      return "organisations";
    }

      /**
     * @api {get} /kendra/api/v1/organisations/list 
     * List of all organisations
     * @apiVersion 1.0.0
     * @apiGroup Organisations
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/organisations/list
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "Fetched organisations lists successfully",
     * "status": 200,
     * "result": [
        {
            "name": "testing",
            "id": "013014480583598080574"
        },
        {
            "name": "ShikshaLokamDev",
            "id": "0125747659358699520"
        },
        {
            "name": "Partner-2",
            "id": "0125748470890987526"
        },
        {
            "name": "Partner-1",
            "id": "0125748495625912324"
        },
        {
            "name": "Mantra4Change",
            "id": "01291096296221081622"
        }
      ]
    }

    /**
      * List of all organisations.
      * @method
      * @name list
      * @returns {Array} consisting of organization name and id.
     */

    list(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let listOfOrganisation = await organisationHelper.list(req.userDetails.userToken);
                return resolve(listOfOrganisation);

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
  