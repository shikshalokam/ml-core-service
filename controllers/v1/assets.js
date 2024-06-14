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
          req.body.filters.orgId ? req.body.filters.orgId : "",
          req.body.filters.userIds ? req.body.filters.userIds : [],
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

    /**
    * Transfer ownership of assets(program and solution).
    * @name ownershipTransfer
    * @api {get} /kendra/api/v1/assets/ownershipTransfer
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest  v1/assets/ownershipTransfer
    * @apiParamExample {Object:} Request-Body:
    {
        "action": "ownership-transfer",
        "organisationId": "01269934121990553633",
        "context": "Ownership Transfer",
        "actionBy": {
            "userId": "86d2d978-5b20-4453-8a76-82b5a4c728c9",
            "userName": ""
        },
        "toUserProfile": {
            "userId": "3b200146-5c0c-4e95-ae06-dacb89460d99",
            "userName": "sdfsdsd",
            "channel": "",
            "organisationId": "",
            "roles": [
                "CONTENT_CREATOR",
                "PROGRAM_MANAGER",
                "PROGRAM_DESIGNER"
             ]
        },
        "fromUserProfile": {
            "userId": "fca2925f-1eee-4654-9177-fece3fd6afc9",
            "userName": "test",
            "firstName": "test",
            "lastName": "",
            "roles": [
                "PROGRAM_DESIGNER"


            ]
            
        },
        "assetInformation": {
            "objectType": "Program",
            "identifier": "62205480a81abe61c07e5058"
        },
        "iteration": 1
    }
    * @apiUse successBody
    * @apiUse errorBody
     * @apiParamExample {json} Response:
    {
        "message": "Ownership transfered successfully",
        "status": 200
    } 
 */

  ownershipTransfer(req){
    return new Promise(async (resolve, reject) => {
      try{
        let transferOwnerShipStatus = await assetsHelper.ownershipTransfer(
          req.body
        );
        if ( !transferOwnerShipStatus.success ) {
          return resolve({
              status: httpStatusCode.bad_request.status,
              message: constants.apiResponses.OWNERSHIP_TANSFER_FAILED
          })
      }else {
        return resolve({
          status: httpStatusCode.ok.status,
          message: constants.apiResponses.OWNERSHIP_TANSFER_SUCCESS,
          success: true
        })
      }
      }catch(error){
        console.log(error);
      }
    });
  }
};
