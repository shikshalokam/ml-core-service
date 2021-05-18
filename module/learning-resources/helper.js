/** 
* name : helper.js
* author : Rakesh Kumar
* created-date : 02-Nov-2020
* Description : Related to learning resources
*/

// Dependencies
const sunbirdService = require(ROOT_PATH + "/generics/services/sunbird");
const formsHelper = require(MODULES_BASE_PATH + "/forms/helper");

/**
    * LearningResourcesHelper
    * @class
*/

module.exports = class LearningResourcesHelper {

  /**
  * To get list of learning resources
  * @method
  * @name  list
  * @param {String} token - user access token.
  * @param {String} pageSize - page size of the request
  * @param {String} pageNo - page no of the request
  * @param {Object} filters - resource filters
  * @param {Array} filters.category - categories for the learning resource
  * @param {Array} filters.subCategory - subcategories for the learning resource
  * @param {Array} filters.topic - topic's for the learning resource
  * @param {Array} filters.language - language's of the learning resources
  * @param {String} searchText - search text 
  * @returns {json} Response consists of list of learning resources
  */
  static list(token, pageSize, pageNo, filters, sortBy,searchText) {
    return new Promise(async (resolve, reject) => {
      try {

        let learningResources = await sunbirdService.learningResources(token, pageSize, pageNo, filters, sortBy,searchText);
        if (learningResources && learningResources.result && learningResources.result.content) {

          let resources = [];
          if(learningResources.result.count > 0 && learningResources.result.content){
            learningResources.result.content.map(resource => {
              resources.push({
                name:resource.name,
                id:resource.identifier,
                link:resource.previewUrl
              });
            });
          }
          resolve({
            message: learningResources.message,
            data: {
              count: learningResources.result.count,
              content: resources
            },
            success: true
          });
        } else {
          throw new Error(constants.apiResponses.LEARNING_RESORCES_NOT_FOUND);
        }
      } catch (error) {
        resolve({
          message: error.message,
          data: false,
          success: false
        });
      }
    })

  }
  
  /**
 * Get resource filtrs
 * @method
 * @name filters
 * @returns {json} Response consists of learning resource filters
 */

  static filters() {
    return new Promise(async (resolve, reject) => {
      try {

        let formData = await formsHelper.formsDocument({
          name: constants.common.LEARNING_RESOURCE_FILTER_FORM_NAME
        });

        if (!formData[0]) {
          return reject({
            message:
              constants.apiResponses.LEARNING_RESORCES_FILTERS_NOT_FOUND
          });
        }
        resolve({
          message: constants.apiResponses.LEARNING_RESORCES_FILTERS_FOUND,
          data: formData[0].value,
          success: true
        });

      } catch (error) {
        resolve({
          message: error.message,
          data: false,
          success: false
        });
      }
    })
  }
}