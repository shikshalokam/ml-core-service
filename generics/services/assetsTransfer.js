

 /**
   * Get users assets based on Type .
   * @method
   * @name generateUpdateOperations
   * @param {Object} fromUserData -   from userData.
   * @param {Object} reqData - request body data data.
   * @param {Object} toUserData - to user Data from userExtension.
   * @param {Array} allAssetsData - PlatformRoles of from user.

   * @returns {Array} returns array of queries to Update.
   */

async function generateUpdateOperations(fromUserData,reqData, toUserData,allAssetsData) {
    const bulkOperations = [];
  
    fromUserData.platformRoles.forEach(role => {
      const roleCodeToUpdate = role.code;
      const arrayToMove = allAssetsData.filter(roleData => roleData.code === roleCodeToUpdate);
      const toUserRoleExists = toUserData.platformRoles.some(toRole => toRole.code === roleCodeToUpdate);


      if (!toUserRoleExists) {
        // If role code doesn't exist in toUserData, transfer the entire object
        bulkOperations.push({
          updateOne: {
            filter: { userId: reqData.toUserProfile.userId },
            update: {
              $push: {
                "platformRoles": role,
              },
            },
          },
        });
  
        // Remove the object from fromUserData
        bulkOperations.push({
          updateOne: {
            filter: { userId: reqData.fromUserProfile.userId },
            update: {
              $pull: {
                "platformRoles": { code: roleCodeToUpdate },
              },
            },
          },
        });
      }else {


      const updateToQuery = {
        userId: reqData.toUserProfile.userId,
        "platformRoles.code": roleCodeToUpdate,
      };
  
      const updateToFields = {
        $push: {
          "platformRoles.$[elem].programs": { $each: arrayToMove?.[0]?.programs },
        },
      };
  
      const arrayFilters = [{ "elem.code": roleCodeToUpdate }];
  
      const deleteProgramFromUserQuery = {
        userId: reqData.fromUserProfile.userId,
        "platformRoles.code": roleCodeToUpdate,
      };
  
      const deleteProgramFromUserField = {
        $pull: {
          "platformRoles.$[elem].programs": { $in: arrayToMove?.[0]?.programs },
        },
      };
  
      // Create bulk write operations
      bulkOperations.push({
        updateOne: {
          filter: updateToQuery,
          update: updateToFields,
          arrayFilters: arrayFilters,
        },
      });
  
      bulkOperations.push({
        updateOne: {
          filter: deleteProgramFromUserQuery,
          update: deleteProgramFromUserField,
          arrayFilters: arrayFilters,
        },
      });
    }
    });
  
  
    return bulkOperations;
  }
  
/**
   * Get users assets based on Type .
   * @method
   * @name createProgramRolesArray
   * @param {Object} fromUserData -   from userData.
   * @param {String} findProgramManagerId - Id of Role.
   * @param {Array} allAssetsData - PlatformRoles of from user.

   * @returns {Array} returns PlatformRoles array.
   */

function createProgramRolesArray(fromUserData, findProgramManagerId) {
    const programRolesArray = [];

    for (const roleCode of fromUserData.platformRoles) {
        const matchingRole = findProgramManagerId.find(role => role.code === roleCode.code);

        if (matchingRole) {
            const roleId = matchingRole._id;

            const roleDetails = {
                roleId: roleId,
                code: roleCode.code,
                programs: roleCode.programs,
            };

            if (roleCode.code === constants.common.PROGRAM_DESIGNER) {
                roleDetails.isAPlatformRole = true;
                roleDetails.entities = [];
            }

            programRolesArray.push(roleDetails);
        }
    }

    return programRolesArray;
}

  
/**
   * Get users assets based on Type .
   * @method
   * @name createProgramRolesArray
   * @param {Object} fromUserData -   from array.
   * @param {Object} toUserArray - to array.
   * @returns {Array} returns missing roles as an array.
   */

function checkRolesPresence(fromUserArray, toUserArray) {
  const missingRoles = [];

  toUserArray.forEach(toRole => {
    const isFromRolePresent = fromUserArray.some(fromRole => fromRole.code === toRole.code);

    if (!isFromRolePresent) {
      missingRoles.push(toRole.code);
    }
  });
  return missingRoles;
}


module.exports={
    generateUpdateOperations:generateUpdateOperations,
    createProgramRolesArray:createProgramRolesArray,
    checkRolesPresence:checkRolesPresence,
}
