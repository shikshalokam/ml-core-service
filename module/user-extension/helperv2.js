/**
 * name : module//user-extension/helper.js
 * author : Priyanka Pradeep
 * Date : 22-Apr-2022
 * Description : User extension helper.
 */


/**
    * UserExtensionHelperV2
    * @class
*/

module.exports = class UserExtensionHelperV2 {

    /**
   * Get userExtension document based on userid.
   * @method
   * @name userExtensionDocument
   * @name userExtensionDocument
   * @param {Object} filterQueryObject - filter query data.
   * @param {Object} [projection = {}] - projected data.
   * @returns {Promise} returns a promise.
  */

    static userExtensionDocument(filterQueryObject, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {

                let userExtensionData = await database.models.userExtension.findOne(filterQueryObject, projection).lean();

                return resolve(userExtensionData);

            } catch (error) {
                return reject(error);
            }
        })


    }
};




