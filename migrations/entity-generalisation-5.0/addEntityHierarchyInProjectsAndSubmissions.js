let _ = require("lodash");
const request = require('request');
const path = require("path");
let rootPath = path.join(__dirname, '..')
let endPoints = require(rootPath+'/generics/constants/endpoints')
require('dotenv').config({ path: rootPath+'/.env' })
let MongoClient = require("mongodb").MongoClient;
let endPoint = endPoints.GET_LOCATION_DATA;
let userServiceUrl = process.env.USER_SERVICE_URL;
let mongoUrl = process.env.MONGODB_URL;
let dbName = mongoUrl.split("/").pop();
let url = mongoUrl.split(dbName)[0];




(async () => {
    
    let connection = await MongoClient.connect(url, { useNewUrlParser: true });
    let db = connection.db(dbName);
    try {
        
        let collections = {
            "observationSubmissions" : {
                "query" : {
                },
                "projection": {
                    entityId:1,_id:0
                }
            },
            "projects" : {
                "query" : {
                    entityId:{$exists:true}
                },
                "projection": {
                    entityId:1,_id:0
                }
            }
        }

        let entityIds = [];
        //loop project & obeservationSubmission collections and get entityId
        for ( let eachModel in collections ) {
            //fetch each current collection and get entityId
            let collectionDocs = await db.collection(eachModel).find(collections[eachModel].query).project(collections[eachModel].projection).toArray();
            collectionDocs.forEach( eachDoc => {
                entityIds.push(eachDoc.entityId.toString());
            })

            //eliminate duplication of ids
            entityIds = _.uniq(entityIds);
        }
    
        let chunkOfEntityIds = _.chunk(entityIds, 5);
        //loop entity
        for ( let chunkPointer = 0; chunkPointer < chunkOfEntityIds.length; chunkPointer++ ) {
            //chunk of entity ids
            let entityIds = chunkOfEntityIds[chunkPointer];
             
            for ( let entityIdpointer = 0 ; entityIdpointer < entityIds.length; entityIdpointer++ ) {
                let parentData = await getParentEntities(entityIds[entityIdpointer]);
                
                for ( let currentModel in collections ) {

                    let findQuery = {
                        "entityId": entityIds[entityIdpointer]
                    }

                    let updateObject = {
                        "$set" : {}
                    };

                    //update query for project and observationSubmission
                    updateObject["$set"]["entityInformation.hierarchy"] = parentData;
                    //update the projects & observationSubmission collection
                    if ( updateObject && Object.keys(updateObject["$set"]).length > 0 ) {
                        let updateCollection = await db.collection(currentModel).updateMany(findQuery,updateObject);
                    }
                }  
                
            }
            
        }
        console.log("observationsSubmissions & projects collections updated")
 
        
        // call location search api
        function locationSearch ( filterData ) {
            return new Promise(async (resolve, reject) => {
                try {
                    
                  let bodyData={};
                  bodyData["request"] = {};
                  bodyData["request"]["filters"] = filterData;
                  const url = 
                  userServiceUrl + endPoint;
                  const options = {
                      headers : {
                          "content-type": "application/json"
                        },
                      json : bodyData
                  };
          
                  request.post(url,options,requestCallback);
                  let result = {
                      success : true
                  };
          
                  function requestCallback(err, data) {   
                      if (err) {
                          result.success = false;
                      } else {
                          let response = data.body;
                          
                          if( response.responseCode === "OK" &&
                              response.result &&
                              response.result.response &&
                              response.result.response.length > 0
                          ) {
                            result["data"] = response.result.response;
                            result["count"] = response.result.count;      
                          } else {
                              result.success = false;
                          }
                      }
                      return resolve(result);
                  }
          
                  setTimeout(function () {
                      return resolve (result = {
                          success : false
                       });
                  }, 5000);
          
                } catch (error) {
                    return reject(error);
                }
            })
          }
          
          //get parent data of a given entity
          async function getParentEntities( entityId, iteration = 0, parentEntities ) {
          
              if ( iteration == 0 ) {
                  parentEntities = [];
              }
          
              let filterQuery = {
                  "id" : entityId
              };
          
              let entityDetails = await locationSearch(filterQuery);
              if ( !entityDetails.success ) {
                  return parentEntities;
              } else {
                  
                  let entityData = entityDetails.data[0];
                  if ( iteration > 0 ) parentEntities.push(entityData);
                  if ( entityData.parentId ) {
                      iteration = iteration + 1;
                      entityId = entityData.parentId;
                      await getParentEntities(entityId, iteration, parentEntities);
                  }
              }
          
              return parentEntities;
          
          }

        connection.close();
    }
    catch (error) {
        console.log(error)
    }
})().catch(err => console.error(err));
