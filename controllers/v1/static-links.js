/**
 * name : staticLinks.js
 * author : Rakesh
 * created-date : 28-Oct-2020
 * Description : Static links related information.
 */

// Dependencies
const csv = require("csvtojson");
const staticLinksHelper = require(MODULES_BASE_PATH + "/static-links/helper")
const FileStream = require(ROOT_PATH + "/generics/file-stream");

/**
    * StaticLinks
    * @class
*/
module.exports = class StaticLinks extends Abstract {
  constructor() {
    super(schemas["static-links"]);
  }

  static get name() {
    return "static-links";
  }

}