/**
 * name : admin/helper.js
 * author : Priyanka Pradeep
 * created-date : 23-09-2022
 * Description : All admin related helper functions.
 */

//Dependencies

/**
    * adminHelper
    * @class
*/

module.exports = class adminHelper {

      /**
      * List of data based on collection.
      * @method
      * @name list
      * @param {Object} filterQueryObject - filter query data.
      * @param {Object} [projection = {}] - projected data.
      * @returns {Promise} returns a promise.
     */

    static list( 
        collection,
        query = "all", 
        fields = "all",
        skipFields = "none", 
        limitingValue = 100, 
        skippingValue = 0,
        sortedData = "" 
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let queryObject = {};
                
                if (query != "all") {
                    queryObject = query;
                }
                
                let projectionObject = {};
                
                if (fields != "all") {
                    
                    fields.forEach(element => {
                        projectionObject[element] = 1;
                    });
                }

                if (skipFields != "none") {
                    skipFields.forEach(element => {
                        projectionObject[element] = 0;
                    });
                }
                
                let mongoDBDocuments;
                
                if( sortedData !== "" ) {
                    
                    mongoDBDocuments = await database.getCollection(collection)
                    .find(queryObject)
                    .project(projectionObject)
                    .sort(sortedData)
                    .limit(limitingValue)
                    .toArray();

                } else {

                    mongoDBDocuments = await database.getCollection(collection)
                    .find(queryObject)
                    .project(projectionObject)
                    .skip(skippingValue)
                    .limit(limitingValue)
                    .toArray();
                }
                // finding document count from db. We can't get it from result array length because a limiting value is passed
                let docCount = await database.getCollection(collection)
                    .find(queryObject).count();

                return resolve({
                    success: true,
                    message: constants.apiResponses.DATA_FETCHED_SUCCESSFULLY,
                    data: mongoDBDocuments,
                    count: docCount
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })


    }


    /**
      * List of data based on collection
      * @method
      * @name dbFind
      * @param {Object} reqBody - request body
      * @returns {Object}  - collection details.
     */

    static dbFind( collection, reqBody ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                if ( reqBody.mongoIdKeys ) {
                    reqBody.query = await this.convertStringToObjectIdInQuery(reqBody.query, reqBody.mongoIdKeys);
                }
                
                let mongoDBDocuments = await this.list(
                    collection, 
                    reqBody.query,
                    reqBody.projection ? reqBody.projection : [],
                    "none",
                    reqBody.limit ? reqBody.limit : 100,
                    reqBody.skip ? reqBody.skip : 0

                );
                
                return resolve({
                  message : constants.apiResponses.DATA_FETCHED_SUCCESSFULLY,
                  success : true,
                  result: mongoDBDocuments.data ? mongoDBDocuments.data : [],
                  count: mongoDBDocuments.count ? mongoDBDocuments.count : 0
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })
    }

    // /**
    //   * Delete the data from collection
    //   * @method
    //   * @name dbDelete
    //   * @param {Object} reqBody - request body
    //   * @returns {Object}  - collection details.
    //  */

    // static dbDelete( collection, reqBody ) {
    //     return new Promise(async (resolve, reject) => {
    //         try {

    //             if ( reqBody.mongoIdKeys ) {
    //                 reqBody.query = await this.convertStringToObjectIdInQuery(reqBody.query, reqBody.mongoIdKeys);
    //             }
                
    //             let deleteData = await database.getCollection(collection).deleteMany(reqBody.query);      

    //             return resolve({
    //               message : constants.apiResponses.DATA_DELETED_SUCCESSFULLY,
    //               success : true
    //             });

    //         } catch (error) {
    //             return resolve({
    //                 success: false,
    //                 message: error.message,
    //                 data: false
    //             });
    //         }
    //     })
    // }

    /**
      * Update the data in any model
      * @method
      * @name dbUpdate
      * @param {Object} reqBody - request body
      * @returns {Object}  - collection details.
     */

    static dbUpdate( collection, reqBody ) {
        return new Promise(async (resolve, reject) => {
            try {

                if ( reqBody.mongoIdKeys ) {
                    reqBody.query = await this.convertStringToObjectIdInQuery(reqBody.findQuery, reqBody.mongoIdKeys);
                }

                let updateData = await database.getCollection(collection).updateMany(reqBody.findQuery, reqBody.updateQuery);      
                
                return resolve({
                  message : constants.apiResponses.DATA_UPDATED_SUCCESSFULLY,
                  success : true
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })
    }

    /**
      * Create a new mongodb record
      * @method
      * @name dbCreate
      * @param {Object} reqBody - request body
      * @returns {Object}  - collection details.
     */

    static dbCreate( collection, reqBody ) {
        return new Promise(async (resolve, reject) => {
            try {

                let insertData = await database.getCollection(collection).create(reqBody);      

                if( !insertData._id ) {
                    throw {
                      message : constants.apiResponses.FAILED_TO_CREATE_RECORD
                    }
                }

                return resolve({
                  message : constants.apiResponses.DATA_CREATED_SUCCESSFULLY,
                  success : true,
                  result : {
                    _id : insertData._id
                  }
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })
    }

    /**
      * Convert String to ObjectIds inside Query.
      * @method
      * @name convertStringToObjectIdInQuery     
      * @returns {Array} Query.
    */

    static convertStringToObjectIdInQuery(query, mongoIdKeys) {

        for ( let pointerToArray = 0; pointerToArray < mongoIdKeys.length; pointerToArray++ ) {
            let eachKey = mongoIdKeys[pointerToArray];
            let currentQuery = query[eachKey];

            if ( typeof(currentQuery) === "string") {
                query[eachKey] = gen.utils.convertStringToObjectId(currentQuery);
            }  else if ( typeof(currentQuery) === "object") {

                let nestedKey = Object.keys(query[eachKey]);
                if ( nestedKey ) {
                    let convertedIds = [];
                    nestedKey = nestedKey[0];
                    query[eachKey][nestedKey] = gen.utils.arrayIdsTobjectIds(currentQuery[nestedKey]);
                }
            }
        }

        return query;
    }

    /**
      * Create a index on collections 
      * @method
      * @name createIndex
      * @param {Object} reqBody - request body
      * @returns {Object}  - indexed details details.
     */

    static createIndex(collection, reqBody){
        return new Promise(async(resolve,reject)=>{
            try{
               
                let keys = reqBody.keys;
        
                let presentIndex = await database.getCollection(collection).listIndexes({}, { key: 1 }).toArray();
                let indexes = presentIndex.map((indexedKeys) => {
                  return Object.keys(indexedKeys.key)[0];
                });
                let indexNotPresent = _.differenceWith(keys, indexes);
                if (indexNotPresent.length > 0) {
                  indexNotPresent.forEach(async (key) => {
                    await database.getCollection(collection).createIndex({ [key]: 1 });
                  });
                  return resolve({
                    message: constants.apiResponses.KEYS_INDEXED_SUCCESSFULLY,
                    success: true,
                  });
                } else {
                  return resolve({
                    message: constants.apiResponses.KEYS_ALREADY_INDEXED,
                    success: true,
                  });
                }
            } catch(error){
                reject(error.message)
            }
            
        })
    }

}

