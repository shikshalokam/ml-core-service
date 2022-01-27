/**
 * name : solutions.js
 * author : Priyanka Pradeep
 * created-date : 27-jan-2022
 * Description : All solution v2 related information.
 */


/**
 * dependencies
 */

const solutionV1 = require(ROOT_PATH + "/controllers/v1/solutions");
const solutionHelper = require(MODULES_BASE_PATH + "/solutions/helper");

/**
    * SolutionV2
    * @class
*/

module.exports = class SolutionsV2 extends solutionV1 {
    /**
  * @api {post} /kendra/api/v2/solutions/verifyLink/:link
  * @apiVersion 1.0.0
  * @apiName verify Link
  * @apiGroup Solutions
  * @apiSampleRequest /kendra/api/v2/solutions/verifyLink/6f8d395f674dcb3146ade10f972da9d0
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Request:
  * {
  *   "role" : "HM,DEO",
      "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
      "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
      "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
    }
  * @apiParamExample {json} Response:
  * {
      "message": "Solution Link verified successfully",
      "status": 200,
      "result": {
          isATargetedSolution : true/false,
          type: improvementProject,
          solutionId : “5f6853f293734140ccce90cf”,
          projectId : “”
      }
    }
  */

   /**
   * verify Link
   * @method
   * @name verifyLink
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution Id
   * @returns {Array}
   */

  async verifyLink(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionHelper.verifyLink(
          req.params._id,
          req.body,
          req.userDetails.userId,
          req.userDetails.userToken,
          true
        );

        return resolve(solutionData);

      }
      catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }

}