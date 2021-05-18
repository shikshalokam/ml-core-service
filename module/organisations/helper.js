/**
 * name : helper.js
 * author : Aman
 * Date : 05-May-2020
 * Description : Organisation details
 */

// Dependencies
const sunbirdService = 
require(ROOT_PATH +"/generics/services/sunbird");
const sessionHelpers = require(ROOT_PATH+"/generics/helpers/sessions");

 /**
     * OrganisationHelper
     * @class
 */

module.exports = class OrganisationHelper {

    /**
   * List of organisations.
   * @method
   * @name list
   * @returns {Array} Organisation lists.
   */

    static list(token) {
        return new Promise(async (resolve, reject) => {
            try {

                let sessionData = sessionHelpers.get(
                    constants.common.ORGANISATION_LISTS
                );

                let result = [];

                if( 
                    sessionData !== undefined && 
                    sessionData.data && 
                    sessionData.data.length > 0 
                ) {
                    result = sessionData.data;
                } else {
                    
                    let organisations = 
                    await sunbirdService.organisationList(token,constants.common.ORGANISATIONS_LIMIT,
                        constants.common.ORGANISATIONS_OFFSET)
                    
                    if ( organisations.status !== httpStatusCode.ok.status) {
                        throw {
                            status : httpStatusCode.bad_request_status,
                            message : constants.apiResponses.ERROR_IN_ORGANISATIONS_LIST
                        }
                    }

                    if(
                        organisations.result.response &&
                        organisations.result.response.content.length > 0
                      ) {
                          result = organisations.result.response.content.map(contentData=>{
                              return {
                                  name : contentData.orgName,
                                  id : contentData.id
                              }
                          })
                          
                          sessionHelpers.set(
                              constants.common.ORGANISATION_LISTS, 
                              {
                                  data : result
                              }
                          )
                      }
                }

                return resolve({
                    message : constants.apiResponses.ORGANISATIONS_LIST_FETCHED,
                    result : result
                })

            } catch (error) {
                return reject(error);
            }
        })
    }

};