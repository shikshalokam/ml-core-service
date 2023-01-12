/**
 * name : helper.js
 * author : Vishnu
 * created-date : 12-Jan-2023
 * Description : Programs users related helper functionality.
 */

// Dependencies 

/**
    * ProgramUsersHelper
    * @class
*/
module.exports = class ProgramUsersHelper {
    /**
     * Create program users
     * @method
     * @name create
     * @param {Object} data 
     * @returns {JSON} - create programUsers.
    */

    static create(data) {
        return new Promise(async (resolve, reject) => {
            try {
            
                let programUsers = await database.models.programUsers.create(
                    data
                );
                
                if( !programUsers._id ) {
                    throw {
                        message : constants.apiResponses.PROGRAM_USERS_NOT_CREATED
                    };
                }
                return resolve(programUsers);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
     * Update program users
     * @method
     * @name update
     * @param {Object} query 
     * @param {Object} data 
     * @param {Object} options 
     * @returns {JSON} - create programUsers.
    */

    static update(query, data, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
            
                let programUsers = await database.models.programUsers.findOneAndUpdate(
                    query, 
                    data,
                    options
                );
                
                if( !programUsers._id ) {
                    throw {
                        message : constants.apiResponses.PROGRAM_USERS_NOT_UPDATED
                    };
                }
                return resolve(programUsers);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
     * find program users details
     * @method
     * @name find
     * @param {Object} query
     * @param {Array} projection 
     * @returns {JSON} - create programUsers.
    */

    static find(query, projection = []) {
        return new Promise(async (resolve, reject) => {
            try {
            
                let programUsers = await database.models.programUsers.find(
                    query,
                    projection
                  ).lean();
                
                return resolve(programUsers);

            } catch (error) {
                return reject(error);
            }
        })
    }

}