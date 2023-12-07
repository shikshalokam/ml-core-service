/**
 * name : admin.js
 * author : Priyanka Pradeep
 * created-date : 23-09-2022
 * Description : Admin Related information. 
 */

 // Dependencies
 const adminHelper = require(MODULES_BASE_PATH + "/admin/helper");
 
  /**
     * Admin
     * @class
 */
  module.exports = class Admin {
 
    static get name() {
        return "admin";
    }

    /**
     * @api {post} /kendra/api/v1/admin/dbFind/:collectionName
     * List of data based on collection
     * @apiVersion 1.0.0
     * @apiGroup Admin
     * @apiSampleRequest /kendra/api/v1/admin/dbFind/projects
     * @param {json} Request-Body:
     * {
     * "query" : {
          "userId": "18155ae6-493d-4369-9668-165eb6dcaa2a",
          "_id": "601921116ffa9c5e9d0b53e5"
        },
       "projection" : ["title"],
       "limit": 100,
       "skip": 2
      }
     * @apiParamExample {json} Response:
     * {
          "message": "Data Fetched Or Updated Successfully",
          "status": 200,
          "result": [
              {
                  "_id": "601921e86ffa9c5e9d0b53e7",
                  "title": "Please edit this project for submitting your Prerak Head Teacher of the Block-19-20 project"
              },
              {
                  "_id": "60193ce26ffa9c5e9d0b53fe",
                  "title": "Please edit this project for submitting your Prerak Head Teacher of the Block-19-20 project"
              }
          ]
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * List of data based on collection
      * @method
      * @name dbFind
      * @param {String} _id - MongoDB Collection Name
      * @param {Object} req - Req Body
      * @returns {JSON} list of data.
    */

  async dbFind(req) {
    return new Promise(async (resolve, reject) => {
      try {

          let result = await adminHelper.dbFind(
            req.params._id,
            req.body
          );

          return resolve(result);
        
        } catch (error) {
          return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error
          })
        }
    })
  }

  // /**
  //    * @api {post} /kendra/api/v1/admin/dbDelete/:collectionName
  //    * Delete the data from collection
  //    * @apiVersion 1.0.0
  //    * @apiGroup Admin
  //    * @apiSampleRequest /kendra/api/v1/admin/dbDelete/projects
  //    * @param {json} Request-Body:
  //    * {
  //    * "query" : {
  //    * "_id": { $in : ["601921e86ffa9c5e9d0b53e7","60193ce26ffa9c5e9d0b53fe"]},
  //       },
  //       "mongoIdKeys" : ["_id"] 
  //     }
  //    * @apiParamExample {json} Response:
  //    * {
  //         "message": "Data deleted successfully",
  //         "status": 200
  //    * }   
  //    * @apiUse successBody
  //    * @apiUse errorBody
  //    */

  //   /**
  //     * Delete the data from collection
  //     * @method
  //     * @name dbDelete
  //     * @param {String} _id - MongoDB Collection Name
  //     * @param {Object} req - Req Body
  //     * @returns {JSON} list of data.
  //   */

  // async dbDelete(req) {
  //   return new Promise(async (resolve, reject) => {
  //     try {

  //         let result = await adminHelper.dbDelete(
  //           req.params._id,
  //           req.body
  //         );

  //         return resolve(result);
        
  //       } catch (error) {
  //         return reject({
  //           status: error.status || httpStatusCode.internal_server_error.status,
  //           message: error.message || httpStatusCode.internal_server_error.message,
  //           errorObject: error
  //         })
  //       }
  //   })
  // }

    /**
     * @api {post} /kendra/api/v1/admin/dbUpdate/:collectionName
     * Update the data in collection
     * @apiVersion 1.0.0
     * @apiGroup Admin
     * @apiSampleRequest /kendra/api/v1/admin/dbUpdate/projects
     * @param {json} Request-Body:
     * {
        "findQuery": {
            "_id": { "$in" : ["601921e86ffa9c5e9d0b53e7"] }
        },
        "mongoIdKeys" : ["_id"],
        "updateQuery" : {
            "$set" : { "status": "started"}
        }
      }
     * @apiParamExample {json} Response:
     * {
          "message": "Data Updated successfully",
          "status": 200
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     

    /**
      * Update the data in collection
      * @method
      * @name dbUpdate
      * @param {String} _id - MongoDB Collection Name
      * @param {Object} req - Req Body
      * @returns {JSON} list of data.
    */

  async dbUpdate(req) {
    return new Promise(async (resolve, reject) => {
      try {

          let result = await adminHelper.dbUpdate(
            req.params._id,
            req.body
          );

          return resolve(result);
        
        } catch (error) {
          return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error
          })
        }
    })
  }

  /**
     * @api {post} /kendra/api/v1/admin/dbCreate/:collectionName
     * Create the new record
     * @apiVersion 1.0.0
     * @apiGroup Admin
     * @apiSampleRequest /kendra/api/v1/admin/dbCreate/apps
     * @param {json} Request-Body:
     * {
          "name": "samiksha",
          "displayName": "Samiksha",
          "description": "Get the app to discover more",
          "logo": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2Fapps%2Fsamiksha.png?alt=media",
          "playstoreLink": "https://play.google.com/store/apps/details?id=org.shikshalokam.samiksha",
          "appStoreLink": "https://apps.apple.com/in/app/shikshalokam-samiksha/id1442066610"
      }
     * @apiParamExample {json} Response:
     * {
          "message": "Data Created successfully",
          "status": 200,
          "result" : {
            "_id": "601921e86ffa9c5e9d0b53e7"
          }
          }
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Create the new record
      * @method
      * @name dbCreate
      * @param {String} _id - MongoDB Collection Name
      * @param {Object} req - Req Body
      * @returns {JSON} list of data.
    */

  async dbCreate(req) {
    return new Promise(async (resolve, reject) => {
      try {

          let result = await adminHelper.dbCreate(
            req.params._id,
            req.body
          );

          return resolve(result);
        
        } catch (error) {
          return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error
          })
        }
    })
  }

  /**
     * @api {post} /kendra/api/v1/admin/createIndex/:collectionName
     * Creates indexs on collections 
     * @apiVersion 1.0.0
     * @apiGroup Admin
     * @apiSampleRequest /kendra/api/v1/admin/index/apps
     * @param {json} Request-Body:
     * 
         {
              "keys": [
                  "scope.roles"
              ]
          }
     * @apiParamExample {json} Response:
     * {
          "message": "Keys indexed successfully",
          "status": 200
      }
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Create indexs on collections
      * @method
      * @name createIndex
      * @param {String} _id - MongoDB Collection Name
      * @param {Object} req - Req Body
      * @returns {JSON} success body.
    */
  async createIndex(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await adminHelper.createIndex(req.params._id,req.body)
        resolve(result)
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }

};
 