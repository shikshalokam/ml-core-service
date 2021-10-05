/**
 * name : static-links/helper.js
 * author : Rakesh
 * created-date : 28-Oct-2020
 * Description : Static links related helper functionality.
 */

/**
    * StaticLinksHelper
    * @class
*/
module.exports = class StaticLinksHelper {

    /**
   * List static links.
   * @method
   * @name staticLinksDocuments
   * @param {Object} [ staticLinksFilter = "all" ] - static link filter query.
   * @param {Array} [ fieldsArray = "all" ] - Projection fields.
   * @param {Array} [ skipFields = "none" ] - Fields to skip.
   * @returns {Array} List of static links data. 
   */

    static staticLinksDocuments(
        staticLinksFilter = "all",
        fieldsArray = "all",
        skipFields = "none"
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let queryObject = (staticLinksFilter != "all") ? staticLinksFilter : {};

                let projection = {}

                if (fieldsArray != "all") {
                    fieldsArray.forEach(field => {
                        projection[field] = 1;
                    });
                }

                if (skipFields !== "none") {
                    skipFields.forEach(field => {
                        projection[field] = 0;
                    })
                }

                let staticLinkData =
                    await database.models.staticLinks.find(queryObject, projection).lean();

                return resolve(staticLinkData);

            } catch (error) {
                return reject(error);
            }
        })


    }

}