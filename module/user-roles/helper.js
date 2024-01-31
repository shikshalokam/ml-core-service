/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : User Roles related helper functionality.
 */

/**
    * UserRolesHelper
    * @class
*/

module.exports = class UserRolesHelper {

    /**
   * User roles document.
   * @method
   * @name roleDocuments
   * @param {Array} [filterQuery = "all"] - solution ids.
   * @param {Array} [fieldsArray = "all"] - projected fields.
   * @param {Array} [skipFields = "none"] - field not to include
   * @returns {Array} List of user roles document. 
   */
  
  static roleDocuments(
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

            if( skipFields !== "none" ) {
              skipFields.forEach(field=>{
                projection[field] = 0;
              })
            }
    
            let userRolesData = await database.models.userRoles.find(
              queryObject, 
              projection
            ).lean();
        
            return resolve(userRolesData);
            
        } catch (error) {
            return reject(error);
        }
    });
  }

   /**
   * List of user roles data.
   * @method
   * @name list
   * @param bodyData - Body data.
   * @returns {Array} List of user roles data.
   */
  
  static list( bodyData ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const roles = await this.roleDocuments(
                bodyData.query,
                bodyData.projection,
                bodyData.skipFields
            );

            return resolve({
                message : constants.apiResponses.USER_ROLES_FETCHED,
                result : roles
            });
            
        } catch (error) {
            return reject(error);
        }
    });
  }

  static findOne(query){
    return new Promise(async (resolve, reject) => {
        try{
           let findUser =await database.models.userRoles.find(query)
           resolve(findUser)
        }catch(error){
            reject(error);
        }
    })
}

};