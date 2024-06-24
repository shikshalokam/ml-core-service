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
     * @param {Object} update 
     * @param {Object} options 
     * @returns {JSON} - create programUsers.
    */

    static update(query, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
            
                let programUsers = await database.models.programUsers.findOneAndUpdate(
                    query, 
                    update,
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
     * Update program users
     * @method
     * @name updateMany
     * @param {Object} query 
     * @param {Object} update 
     * @param {Object} options 
     * @returns {JSON} - update programUsers.
    */

    static updateMany(query, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
            
                let updatedProgramUserCount = await database.models.programUsers.updateMany(
                    query, 
                    update,
                    options
                );
                if( updatedProgramUserCount) {
                    return resolve(updatedProgramUserCount);
                }
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
     * find program users details
     * @method
     * @name programUsersDocuments
     * @param {Array} [filterData = "all"] - template filter query.
     * @param {Array} [fieldsArray = "all"] - projected fields.
     * @param {Array} [skipFields = "none"] - field not to include
     * @param {Sort} [sortedData = ""] - sorting data
     * @returns {Array} Lists of program user. 
    */
    static programUsersDocuments(
        filterData = "all", 
        fieldsArray = "all",
        skipFields = "none",
        sortedData = ""
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let queryObject = (filterData != "all") ? filterData : {};
                let projection = {}
           
                if (fieldsArray != "all") {
                    fieldsArray.forEach(field => {
                        projection[field] = 1;
                    });
                }
               
                if( skipFields !== "none" ) {
                   skipFields.forEach(field=>{
                       projection[field] = 0;
                   });
                }
                let programUsers;
                if( sortedData !== "" ) {       
                    programUsers = await database.models.programUsers
                    .find(queryObject, projection)
                    .sort(sortedData)
                    .lean();
                } else {
                    programUsers = await database.models.programUsers
                    .find(queryObject, projection)
                    .lean();
                } 
           
                return resolve(programUsers);
            
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
   * Get programUsers document Count based on filtered data provided.
   * @method
   * @name countDocuments
   * @param {Object} [findQuery = "all"] -filter data.
   * @returns {Promise<Number>}          - Count of Survey.
   */

  static countDocuments(findQuery = "all") {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = {};
        if (findQuery != "all") {
          queryObject = _.merge(queryObject, findQuery);
        }
        let countDocuments = await database.models.programUsers
          .countDocuments(queryObject)
          .lean();

        return resolve(countDocuments);
      } catch (error) {
        return reject(error);
      }
    });
  }
  
    /**
     * check if user joined a program or not and consentShared
     * @method
     * @name checkForUserJoinedProgramAndConsentShared
     * @param {String} programId
     * @param {String} userId 
     * @returns {Object} result.
    */

    static checkForUserJoinedProgramAndConsentShared(
        programId, 
        userId
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = {};
                const query = { 
                    userId: userId,
                    programId: programId
                }
    
                //Check data present in programUsers collection.
                let programUsers = await this.programUsersDocuments(
                    query,
                    ["_id","consentShared"]
                );
                result.joinProgram = programUsers.length > 0 ? true : false;
                result.consentShared = programUsers.length > 0 ? programUsers[0].consentShared : false;
                return resolve(result);
            
            } catch (error) {
                return reject(error);
            }
        });
    }

     /**
   * Program details or cound o programs based on user.
   * @method
   * @name userProgram
   * @param {String} reqesteduserId - userId .
   * @param {String} stats          - condition to check stats or details .
   * @returns {Object}              - Details of the program or count of the program.
   */

  static userProgram(reqesteduserId, stats ) {
    return new Promise(async (resolve, reject) => {
      try {
        if (stats === false) {
          //getting details of usersProgram and programJoined details

          let updateUserProgramList = await this.getAggregate(reqesteduserId);
          return resolve({
            message: constants.apiResponses.PROGRAMS_FETCHED,
            success: true,
            data: updateUserProgramList,
          });
        } else {
          //getting bigNumber of usersProgram list
          let countProgram = await this.countDocuments({
            userId: reqesteduserId,
          });
          return resolve({
            message: constants.apiResponses.PROGRAMS_FETCHED,
            success: true,
            data: countProgram,
          });
        }
      } catch (error) {
        return reject({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }

  /**
   * aggregate function.
   * @method
   * @name getAggregate
   * @param {String} [createdBy]         - userId
   * @returns {Array}                    -program details.
   */

  static getAggregate(createdBy) {
    return new Promise(async (resolve, reject) => {
      try {
        const pipeline = [
          {
            $match: {
            userId: createdBy,
            },
          },
          {
            $lookup: {
              from: 'programs',
              localField: 'programId',
              foreignField: '_id',
              as: 'programs'
            }
          },
          {
            $project: {
              _id: 1,
              userId: 1,
              createdAt:1,
              programId:1,
              programsDetails: {
                $map: {
                  input: "$programs",
                  as: "programs",
                  in: {
                    _id: "$$programs._id",
                    status: "$$programs.status",
                    name: "$$programs.name",
                    externalId: "$$programs.externalId",
                  },
                },
              },
            },
          },
        ];

        let programUpdate = await database.models.programUsers.aggregate(pipeline);
        if (programUpdate) {
          return resolve(programUpdate);
        }
      } catch (error) {
        console.log(error);
        return reject(error);
      }
    });
  }
}