/**
 * name : entityToLocationId.js
 * author : Priyanka Pradeep
 * created-date : 02-Sep-2022
 * Description : Migration script for convert entity to locationId.
 */

const path = require("path");
let rootPath = path.join(__dirname, '../../')
require('dotenv').config({ path: rootPath+'/.env' })
let _ = require("lodash");
let mongoUrl = process.env.MONGODB_URL;
let dbName = mongoUrl.split("/").pop();
let url = mongoUrl.split(dbName)[0];
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

(async () => {

    let connection = await MongoClient.connect(url, { useNewUrlParser: true });
    let db = connection.db(dbName);
    console.log(dbName,"dbName")
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
            
            let entityIds = chunkOfEntityIds[chunkPointer];
            //convert to obejctId
            let entityIdToObjectId = await convertToObjectId(entityIds);
            //fetch entity documents
            let entityDocuments = await db.collection('entities').find({_id:{ $in : entityIdToObjectId}}).project({ 
                "registryDetails.locationId":1,
                "registryDetails.code":1,
            }).toArray();

            //loop the entity documents
            for ( let entityPointer = 0; entityPointer < entityDocuments.length; entityPointer++ ) {
                
                let currentEntity = entityDocuments[entityPointer];
                //loop all the collections
                for ( let currentModel in collections ) {

                    let findQuery = {
                        "entityId": currentEntity._id
                    }

                    let updateObject = {
                        "$set" : {}
                    };

                    //update query for project
                    if ( currentModel == "projects") {
                        updateObject["$set"]["entityId"] = currentEntity.registryDetails.locationId;
                        updateObject["$set"]["entityInformation._id"] = currentEntity.registryDetails.locationId;
                        updateObject["$set"]["entityInformation.externalId"] = currentEntity.registryDetails.code;
                    
                    } else if ( currentModel == "observationSubmissions" ) {
                        updateObject["$set"]["entityId"] = currentEntity.registryDetails.locationId;
                        updateObject["$set"]["entityExternalId"] = currentEntity.registryDetails.code;
                        updateObject["$set"]["entityInformation.externalId"] = currentEntity.registryDetails.code;
                    }

                    //update the projects & observationSubmission collection
                    if ( updateObject && Object.keys(updateObject["$set"]).length > 0 ) {
                        let updateCollection = await db.collection(currentModel).updateMany(findQuery,updateObject);
                    }
                }  
            }
        }

        console.log("observations & projects collections updated")
 
        //update programs, solutions & observation collections
        let otherCollections = {
            "programs" : {
                "query" : {
                    'scope.entities':{$exists:true, $ne : []}
                },
                "projection": {
                    'scope.entities':1,_id:1
                }
            },
            "observations" : {
                "query" : {
                    entities:{$exists:true, $ne: []}
                },
                "projection": {
                    entities:1,_id:1
                }
            },
            "solutions.1" : {
                "query" : {
                    'scope.entities':{$exists:true, $ne : []}
                },
                "projection": {
                    'scope.entities':1,_id:1
                },
                "field": "scope.entities"
            },
            "solutions.2" : {
                "query" : {
                    'entities':{$exists:true, $ne : []}
                },
                "projection": {
                    entities:1,_id:1
                },
                "field": "entities"
            }
            
        }

        //loop observation, solutions and programs collections
        for ( let eachCollection in otherCollections ) {
            
            let getName = eachCollection.split(".");
            let collectionName = getName[0];
            let otherCollectionDocs = await db.collection(collectionName).find(otherCollections[eachCollection].query).project(otherCollections[eachCollection].projection).toArray();
            let chunkOfOtherCollection = _.chunk(otherCollectionDocs, 10);

            for (let pointerToOtherCollection = 0; pointerToOtherCollection < chunkOfOtherCollection.length; pointerToOtherCollection++ ) {
                let eachChunkCollections = chunkOfOtherCollection[pointerToOtherCollection];
                //loop each collection
                for ( let pointerToChunk = 0; pointerToChunk < eachChunkCollections.length; pointerToChunk++ ) {
                    
                    let eachDocument = eachChunkCollections[pointerToChunk];
                    let query = {
                        _id: eachDocument._id
                    }

                    let updateQuery = {
                        "$set" : {}
                    }

                    let eachEntityIds = [];
                    if ( eachCollection == "observations") {
                        eachEntityIds = eachDocument.entities;
                    } else if ( eachCollection == "programs" ) {
                        eachEntityIds = eachDocument.scope.entities;
                    } else if ( eachCollection == "solutions.1" && otherCollections[eachCollection].field == "scope.entities") {
                        eachEntityIds = eachDocument.scope.entities;
                    } else if ( eachCollection == "solutions.2" && otherCollections[eachCollection].field == "entities") {
                        eachEntityIds = eachDocument.entities;
                    }
 
                    let entityIdToObjectId = await convertToObjectId(eachEntityIds);
                    //fetch entity
                    let entityDocs = await db.collection('entities').find({_id:{ $in : entityIdToObjectId}, registryDetails:{$exists:true}}).project({ 
                        "registryDetails.locationId":1,
                        "registryDetails.code":1,
                    }).toArray();

                    let newEntityIds = [];
                    if ( entityDocs && entityDocs.length > 0 ) {
                        entityDocs.forEach( entity => {
                            newEntityIds.push(entity.registryDetails.locationId);
                        })
                    }

                    if ( eachCollection == "observations" ) {
                        updateQuery["$set"] = {
                            "entities" : newEntityIds
                        }
                    } else if ( eachCollection == "programs") {
                        updateQuery["$set"] = {
                          "scope.entities" : newEntityIds
                        }
                    } else if ( eachCollection == "solutions.1" && otherCollections[eachCollection].field == "scope.entities") {
                        updateQuery["$set"] = {
                          "scope.entities" : newEntityIds
                        }
                    } else if ( eachCollection == "solutions.2" && otherCollections[eachCollection].field == "entities") {
                        updateQuery["$set"] = {
                          "entities" : newEntityIds
                        }
                    }

                    //update collection 
                    if ( updateQuery && Object.keys(updateQuery["$set"]).length > 0 ) {
                        let updateCollections = await db.collection(collectionName).updateMany(query,updateQuery);
                    }
                }
            }

            console.log(eachCollection,"updated")
        }

        //update observationInformation in project task
        let projectDocument = await db.collection('projects').find({
            "tasks.type" : "observation",
            "tasks.observationInformation":{$exists:true}
        }).project({_id:1}).toArray();

        let chunkOfProjectDocument = _.chunk(projectDocument, 10);
        let projectIds;

        for (let pointerToProject = 0; pointerToProject < chunkOfProjectDocument.length; pointerToProject++) {
            
            projectIds = await chunkOfProjectDocument[pointerToProject].map(
                projectDoc => {
                  return projectDoc._id;
                }
            );

            let projectDocuments = await db.collection('projects').find({
                _id: { $in : projectIds }
            }).project({ 
                "_id": 1,
                "tasks._id" : 1,
                "tasks.observationInformation" : 1
            }).toArray();

            await Promise.all(
                projectDocuments.map(async eachProject => {

                let tasks = eachProject.tasks;
                for ( let taskCounter = 0; taskCounter < tasks.length; taskCounter++) {
                    let currentTask = tasks[taskCounter];
                    if ( currentTask.observationInformation ) {

                        let observationInformation = currentTask.observationInformation;

                        let taskUpdateObject = {
                            "$set" : {}
                        };

                        if ( observationInformation.entityId ) {

                            let entityDocuments = await db.collection('entities').find({_id: ObjectId(observationInformation.entityId) }).project({ 
                                "registryDetails.locationId":1
                            }).toArray();

                            if ( entityDocuments.length > 0 ) {
                                observationInformation.entityId = entityDocuments[0].registryDetails.locationId;
                            }
                        }

                        taskUpdateObject["$set"]["tasks.$.observationInformation"] = observationInformation;

                        if ( taskUpdateObject["$set"] && Object.keys(taskUpdateObject["$set"]).length > 0 ) {
                            
                            let updateTaskData = await db.collection('projects').findOneAndUpdate({
                                "_id": eachProject._id,
                                "tasks._id": currentTask._id
                            }, taskUpdateObject);
                        }
                    }
                }
            }))

        }
        console.log("project task updated")
        console.log("completed")

        function convertToObjectId(ids){
            return ids.map(id => ObjectId(id));
        }

        connection.close();
    }
    catch (error) {
        console.log(error)
    }
})().catch(err => console.error(err));
