/**
 * name : user-extensions.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All user extension related information.
 */

const userProfileHelper = require(MODULES_BASE_PATH + "/user-profile/helper.js");

/**
    * UserProfile
    * @class
*/

module.exports = class UserProfile extends Abstract {

  constructor() {
    super(schemas["user-profile"]);
  }


  static get name() {
    return "user-profile";
  }

};

