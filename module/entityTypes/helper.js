/**
 * name : entityTypes/helper.js
 * author : Aman
 * created-date : 22-Feb-2019
 * Description : Entity types related helper functionality.
 */

 /**
    * EntityTypesHelper
    * @class
*/
module.exports = class EntityTypesHelper {

    /**
      * List of entity types.
      * @method
      * @name entityTypesDocument
      * @param {Object} [filterQuery = "all"] - Filtered query data.
      * @param {Object} [fieldsArray = "all"] - Projected data.
      * @param {Object} [skipFields = "none"] - Fields not to include.      
      * @returns {Object} List of entity types.
     */

    static entityTypesDocument( 
        filterQuery = "all",
        fieldsArray = "all",
        skipFields = "none" 
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let queryObject = (filterQuery != "all") ? filterQuery : {};

                let projection = {}
                if (fieldsArray != "all") {
                    fieldsArray.forEach(field => {
                        projection[field] = 1;
                    });
                }
    
                if( skipFields != "none" ) {
                  skipFields.forEach(field=>{
                    projection[field] = 0;
                  })
                }

                let entityTypeData = 
                await database.models.entityTypes.find(queryObject, projection).lean();

                return resolve(entityTypeData);

            } catch (error) {
                return reject(error);
            }
        })

    }

    /**
   * List of entity types.
   * @method
   * @name list
   * @returns {Array} List of entity types.
   */
  
  static list() {
    return new Promise(async (resolve, reject) => {
        try {
            
            const entityTypes = await this.entityTypesDocument(
                "all",
                ["_id","name"]
            );

            return resolve({
                message : constants.apiResponses.ENTITY_TYPES_FETCHED,
                result : entityTypes
            });
            
        } catch (error) {
            return reject(error);
        }
    });
  }

};