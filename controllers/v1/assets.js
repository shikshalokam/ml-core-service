const assetsHelper = require(MODULES_BASE_PATH + "/assets/helper.js");

module.exports = class Assets {
  /**
    * Get organisation program and solution.
    * @name list
    * @api {get} /kendra/api/v1/assets/list?type=program or solution.
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest  v1/assets/list?type=program
    * @apiParamExample {json} Request-Body:
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
    * @apiParamExample {json} Response:
    * 
    * {
    "message": "Assets fetched successfully ",
    "status": 200,
    "result": [
        {
            "_id": "650be4aea302f0000807b2b0",
            "status": "active",
            "owner": "5d7255bb-1216-460e-9228-59b60230b1c1",
            "name": "6.0 CSP 7 Program already expired",
            "objectType": "program"
        },
        {
            "_id": "650be6c4a302f0000807b379",
            "status": "active",
            "owner": "5d7255bb-1216-460e-9228-59b60230b1c1",
            "name": "6.0 CSP 2 Program expired in one day with no start date and end date ",
            "objectType": "program"
        },
    ]
}

     */

  list(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let assestsData = await assetsHelper.fetchPrograms(
          req.query.type,
          req.body
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



  kafkaResponse(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let assestsData = await assetsTransferConsumer.messageReceived(req.body);
;

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
