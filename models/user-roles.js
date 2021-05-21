/**
 * name : user-roles.js
 * author : Aman Jung Karki
 * Date : 09-Sep-2020
 * Description : Schema for user roles.
 */

module.exports = {
    name: "userRoles",
    schema: {
      code: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      entityTypes: Array,
      createdBy: String,
      updatedBy: String,
      status: {
        type: String,
        default: "active"
      },
      isDeleted: {
        type: Boolean,
        default: false
      },
      isAPlatformRole: {
        type: Boolean,
        default: false
      }
    }
  };
  