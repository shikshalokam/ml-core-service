/**
 * name : apps.js
 * author : Deepa
 * created-date : 27-08-2020
 * Description : App Related information. 
 */

 // Dependencies
 const appsHelper = require(MODULES_BASE_PATH + "/apps/helper");
 
  /**
     * Apps
     * @class
 */
 module.exports = class Apps extends Abstract {
   constructor() {
     super(schemas["apps"]);
   }
 
   static get name() {
     return "apps";
   }

    /**
     * @api {get} /kendra/api/v1/apps/details/{{appName}}
     * Get app details
     * @apiVersion 1.0.0
     * @apiGroup Apps
     * @apiSampleRequest /kendra/api/v1/apps/details/samiksha
     * @apiParamExample {json} Response:
     * {
          "message": "Apps details fetched successfully.",
          "status": 200,
          "result": {
            "name": "samiksha",
            "displayName": "Samiksha",
            "description": "Get the app to discover more",
            "logo": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2Fapps%2Fsamiksha.png?alt=media",
            "playstoreLink": "https://play.google.com/store/apps/details?id=org.shikshalokam.samiksha",
            "appStoreLink": "https://apps.apple.com/in/app/shikshalokam-samiksha/id1442066610"
          }
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Get app details.
      * @method
      * @name details
      * @param {String} name - app name
      * @returns {JSON} created app version data.
    */

   async details(req) {
     return new Promise(async (resolve, reject) => {
       try {

          let appDetails = await appsHelper.getDetails(
            req.params._id
          );

          return resolve({
            message : appDetails.message,
            result : appDetails.data
          });
        
        } catch (error) {
          reject({                                        
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
 