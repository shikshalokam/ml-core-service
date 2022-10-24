/**
 * name : form.js
 * author : Vishnudas
 * Date : 02-Mar-2022
 * Description : calling sunbird form api and setting cache.
 */

//dependencies
const request = require('request');

/**
  * @function
  * @name configForStateLocation
  * @param {String} stateLocationCode - state location code. eg: 28
  * @param {object} entityKey -  key to store data in cache. eg: subEntityTypesOf_bc75cc99-9205-463e-a722-5326857838f8
  * @returns {Promise} returns a promise.
*/


const configForStateLocation = function ( stateLocationCode, entityKey ) {
    return new Promise(async (resolve, reject) => {
        try {
            //Get Sub Entity Types present in a particular state
            let subEntitiesDetails = await formRead( stateLocationCode );
            if( !subEntitiesDetails.success ) {
                return resolve({
                    message : constants.apiResponses.ENTITY_NOT_FOUND,
                    result : []
                })
            }
            
            let subEntityData = subEntitiesDetails.data.form.data.fields[1].children.teacher;
            //Entity type is stored in a key called code
            let subEntities = subEntityData.map( subEntity => {
                return subEntity.code;
            })
            //set cache data for given state
            let setCache = cache.setValue(entityKey, subEntities, constants.common.CACHE_TTL);
            return resolve(subEntities);

        } catch (error) {
            return reject(error);
        }
    })
}

/**
    * 
    * @function
    * @name formRead
    * @param {String} stateLocationCode -  State location code.
    * @returns {Promise} returns a promise.
*/
async function formRead ( stateLocationCode ) {
    return new Promise(async (resolve, reject) => {
        try {
          
            let bodyData = {
                request : {
                    type: constants.common.PROFILE_CONFIG_FORM_KEY,
                    subType: stateLocationCode,
                    action: constants.common.GET_METHOD
                }
            }
            
            const url = 
            process.env.FORM_SERVICE_URL + constants.endpoints.GET_FORM_DATA;
            
            const options = {
                headers : {
                    "content-type": "application/json",
                },
                json : bodyData
            };

            request.post(url, options, requestCallBack);
            let result = {
                success : true
            };  
            function requestCallBack(err, data) {
             
                if (err) {
                    result.success = false;
                } else {
                    
                    let response = data.body;
                    
                    if( response.responseCode === constants.common.OK) {
                        result["data"] = response.result;
                        result.success = true;
                    } else {
                        result.success = false;
                    }
                }
                return resolve(result);
            }
            setTimeout(function () {
                return resolve (result = {
                    success : false
                });
            }, constants.common.SERVER_TIME_OUT);

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    configForStateLocation : configForStateLocation
}