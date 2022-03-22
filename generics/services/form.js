/**
 * name : form.js
 * author : Vishnudas
 * Date : 02-Mar-2022
 * Description : calling sunbird form api and setting cache.
 */

//dependencies
const sunbirdService = require(ROOT_PATH + '/generics/services/sunbird');
let cache = require(ROOT_PATH+"/generics/helpers/cache");

/**
  * 
  * @function
  * @name formData
  * @param {String} stateLocationCode - state location code.
  * @param {object} entityKey -  key to store data in cache
  * @returns {Promise} returns a promise.
*/


const formData = function ( stateLocationCode, entityKey ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            let subEntitiesDetails = await sunbirdService.formRead( stateLocationCode );
            let subEntityData = subEntitiesDetails.data.form.data.fields[1].children.teacher;

            let subEntities = subEntityData.map( subEntity => {
                return subEntity.code;
            })
            if( !subEntitiesDetails.data || !subEntityData.length > 0 ) {
                return resolve({
                    message : constants.apiResponses.ENTITY_NOT_FOUND,
                    result : []
                })
            }
            let setCache = cache.setValue(entityKey, subEntities, 43200);
            return resolve(subEntities);

        } catch (error) {
            return reject(error);
        }
    })
}
module.exports = {
    formData : formData
}