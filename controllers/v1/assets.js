const assetsHelper = require(MODULES_BASE_PATH + "/assets/helper.js");

module.exports = class Assets {
  /**
    * Get organisation Assets(program and solution).
    * @name list
    * @api {get} /kendra/api/v1/assets/list?type=program or solution.
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest  v1/assets/list?type=program
    * @apiParamExample {Object:} Request-Body:
     {
     "filters": {
        "orgId": "01269934121990553633",
        "userId":["5d7255bb-1216-460e-9228-59b60230b1c1","5d7255bb-1216-460e-9228-59b60230b1c2"]
    },
      "fields": [
        "_id",
        "name",
        "status",
        "owner",
        "orgId",
        "objectType"
     ],
    "limit": 1000
}
    * @apiUse successBody
    * @apiUse errorBody
   * @returns {JSON} - Details of the program or solution .
 */

  list(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let assestsData = await assetsHelper.fetchOrganizationAssets(
          req.query.type,
          req.body.filters.orgId,
          req.body.filters.userIds,
          req.body.fields
        );

        return resolve(assestsData);
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message:
            error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }
  
};
