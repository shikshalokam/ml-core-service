/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

let entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper");
let formsHelper = require(MODULES_BASE_PATH + "/forms/helper");

module.exports = class UserProfileHelper {

     /**
      * List of user profile.
      * @method
      * @name list
      * @param {Object} [queryParameter = "all"] - Filtered query data.
      * @param {Object} [projection = {}] - Projected data.   
      * @returns {Object} returns a entity types list from the filtered data.
     */

    static list(queryParameter = "all", projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {

                if( queryParameter === "all" ) {
                    queryParameter = {};
                };

                let userProfileData = 
                await database.models.userProfile.find(queryParameter, projection).lean();

                return resolve(userProfileData);

            } catch (error) {
                return reject(error);
            }
        })

    }

    /**
     * Create userProfile
     * @method
     * @name create
     * @param { string } userDetails - Logged in user detail information.
     * @return {Object} - create user profile data
    */

   static create(userDetails) {
       return new Promise(async (resolve, reject) => {
           try {
               
            let userProfileData = {
                "userId" : userDetails.userId,
                "createdBy" : userDetails.userId,
                "metaInformation" : {
                    "firstName" : userDetails.firstName,
                    "lastName" : userDetails.lastName,
                    "email" : userDetails.email,
                    "phoneNumber" : userDetails.phone,
                },
                "externalId" : userDetails.userName,
                "status" : constants.common.USER_PROFILE_NOT_VERIFIED_STATUS,
                "updatedBy" : userDetails.userId   
            }

            let userExtensionDocument = 
            await database.models.userExtension.findOne(
                {
                    userId : userDetails.userId 
                },{ 
                    roles: 1 
                }
            ).lean();
            
           if(
               userExtensionDocument && 
               userExtensionDocument.roles && 
               userExtensionDocument.roles.length > 0 &&
               userExtensionDocument.roles[0].entities &&
               userExtensionDocument.roles[0].entities[0]
            ) {

                let projection = [
                    "entityType",
                    "metaInformation.name",
                    "metaInformation.externalId",
                    "entityTypeId"
                ];

                for(
                    let role = 0;
                    role < userExtensionDocument.roles.length;
                    role++
                ) {
                    
                    let userRole = userExtensionDocument.roles[role];
                    
                    let entities = await entitiesHelper.entityDocuments({
                        _id : { $in : userRole.entities }
                    },projection);

                    if( entities && entities.length > 0 ) {

                        for(let entity = 0 ; entity < entities.length ; entity++ ) {

                            let updateMetaInformation = _metaInformationData(
                                userProfileData,
                                entities[entity]
                            );

                            if( updateMetaInformation.entityType !== "state" ) {
                            
                                let relatedEntities = 
                                await entitiesHelper.relatedEntities(
                                    entities[entity]._id, 
                                    entities[entity].entityTypeId, 
                                    entities[entity].entityType, 
                                    projection
                                );
        
                                if( relatedEntities.length > 0 ) {

                                    let updateMetaData = true;

                                    if( userProfileData.metaInformation.state ) {
                                        
                                        let stateExists= relatedEntities.find(
                                            state=>state.metaInformation.externalId ===
                                            userProfileData.metaInformation.state.externalId
                                        );

                                        if( !stateExists ) {
                                            if( userProfileData.metaInformation[updateMetaInformation.entityType].length > 0 ) {
                                                let findIndexEntity = 
                                                userProfileData.metaInformation[updateMetaInformation.entityType].findIndex(
                                                    data => data.value.toString() === entities[entity]._id.toString()
                                                )

                                                userProfileData.metaInformation[updateMetaInformation.entityType].splice(findIndexEntity);
                                            } else {
                                                delete userProfileData.metaInformation[updateMetaInformation.entityType];
                                            }
                                            updateMetaData = false;
                                        } 
                                    }

                                    if( updateMetaData ) {
                                          relatedEntities.forEach(entity => { 
                                            _metaInformationData(
                                                userProfileData,
                                                entity
                                            );
                                        })
                                    }
                                }
                            } else {
                                break;
                            }
                            
                        }

                    }
                }
             }

            let userCreationData = 
            await database.models.userProfile.create(userProfileData);

            return resolve(userCreationData);
           } catch (err) {
            return reject(err);
           }
       });

   }

    /**
    * User profile whose information is not verified or not sent for verification.
    * @method
    * @name  userProfileNotVerified 
    * @returns {json} Response consists of list of user which status is not
    * verified.
    */

    static userProfileNotVerified( fields = false,userId = false ) {
        return new Promise(async (resolve, reject) => {
            try {

                let projection = {};

                if( fields ) {
                    projection = fields;
                }

                let findQuery = {
                    status: 
                    constants.common.USER_PROFILE_NOT_VERIFIED_STATUS
                };

                if( userId ) {
                    findQuery["userId"] = userId;
                }

                let userProfileDocuments = 
                await database.models.userProfile.find(
                    findQuery,
                    projection
                ).lean();

                return resolve(userProfileDocuments);
              
            } catch (error) {
                return reject(error);
            }
        });
    }

};

/**
  * check state has subEntities
  * @method
  * @name _checkStateWithSubEntities
  * @param { string } stateId - Array of entities.
  * @returns {boolean}
  * */

function _checkStateWithSubEntities(groups, entityTypeId) {
    return new Promise(async (resolve, reject) => {
        try {

            let entityTypes = Object.keys(groups);

            let entityTypeDoc =
                await database.models.entityTypes.findOne({
                    _id: entityTypeId
                }, { immediateChildrenEntityType: 1 }).lean();
            
            if (
                entityTypeDoc && 
                entityTypeDoc.immediateChildrenEntityType && 
                entityTypeDoc.immediateChildrenEntityType.length > 0
            ) {

                Promise.all(entityTypes.map(async function (types) {

                    if (entityTypeDoc.immediateChildrenEntityType.includes(types)) {
                        resolve(true);
                    }
                }));
                resolve(false)
            } else {
                resolve(false);
            }
        } catch (err) {
            return reject(err);
        }
    });
}

  /**
   * Based on entities get label value data.
   * @method
   * @name _entitiesLabelValueData
   * @returns {json} Response consists of label and value of entities.
  */

function _entitiesLabelValueData(entity) {
    return {
        label : entity.metaInformation.name ? entity.metaInformation.name : "",
        value : ObjectId(entity._id),
        externalId: entity.metaInformation.externalId,
    }
}

  /**
   * Create metaInformation for the logged in user.
   * @method
   * @name _metaInformationData
   * @returns {json} Response consists of metaInformation data.
  */

function _metaInformationData(userProfileData,entities) {

    let entityType = entities.entityType;

    if( entityType === "state" ) {
                        
        userProfileData.metaInformation[entityType] = 
        _entitiesLabelValueData(
            entities
        );

    } else {

        if( !userProfileData.metaInformation[entityType]) {
            userProfileData.metaInformation[entityType] = [];
        }
        
        let pushToMeta = true;
            
        if( userProfileData.metaInformation[entityType].length > 0 ) {
            
            let checkEntityPresent = 
            userProfileData.metaInformation[entityType].find(entity=>
                entity.value.toString() === entities._id.toString()
            );
            
            if( checkEntityPresent ) {
                pushToMeta = false;
            }
        }

        if( pushToMeta ) {
            userProfileData.metaInformation[entityType].push(
                _entitiesLabelValueData( entities )
            );
        }

    }

    return {
        entityType : entityType
    };
}






