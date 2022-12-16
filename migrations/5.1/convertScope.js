/**
 * name : convertScope.js
 * author : Priyanka Pradeep
 * created-date : 21-Nov-2022
 * Description : Migration script for convert scope in programs & solutions.
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

        let updatedSolutionIds = [];
        let updatedProgramIds = [];
        let pushedToArray;

        let collections = ['programs', 'solutions'];
        for ( let pointerToCollection = 0; pointerToCollection < collections.length; pointerToCollection++ ) {
            let currentCollectionName = collections[pointerToCollection];

            if ( currentCollectionName == 'programs' ) {
                pushedToArray = updatedProgramIds;
            } else {
                pushedToArray = updatedSolutionIds;
            }
            
            let collectionDocs = await db.collection(currentCollectionName).find({scope : {$exists: true}}).project({_id : 1}).toArray();
            let chunkOfCollection = _.chunk(collectionDocs, 2);

            for ( let chunkPointer = 0; chunkPointer < chunkOfCollection.length; chunkPointer++ ) {
                collectionIds = await chunkOfCollection[chunkPointer].map(
                    doc => {
                      return doc._id;
                    }
                );

                let eachCollection = await db.collection(currentCollectionName).find({
                    _id: { $in : collectionIds }
                }).project({ 
                    "scope":1
                }).toArray();

                for ( let chunkCollectionPointer = 0 ; chunkCollectionPointer < eachCollection.length; chunkCollectionPointer++ ) {
                    
                    let collection = eachCollection[chunkCollectionPointer];
                    let updateScope =  false;
                    let scope = collection.scope ? collection.scope : {};

                    if ( scope && Object.keys(scope).length > 0 ) {
                        //remove entityTypeId from scope
                        if ( scope.entityTypeId ) {
                            delete scope.entityTypeId;
                            updateScope = true;
                        }
                        
                        //change the format of role
                        if ( scope.roles && scope.roles.length > 0 ) {
                            
                            let roles = [];
                            for ( const role of scope['roles'] ) {
                                if ( role && Object.keys(role).length > 0 && role.code) {
                                    roles.push(role.code)
                                }
                            }

                            if ( roles.length > 0 ) {
                                scope.roles = roles;
                                updateScope = true;
                            }
                        }
                        
                        //update scope
                        if ( updateScope ) {
                            let updateObject = {
                                "$set" : {}
                            };
                            updateObject["$set"]["scope"] = scope;

                            await db.collection(currentCollectionName).findOneAndUpdate({
                                "_id": collection._id,
                            },updateObject);

                            pushedToArray.push(collection._id);
                        }
                    }
                }
            }
        }
        
        console.log(updatedProgramIds.length,"updatedProgramIds length")
        console.log(updatedSolutionIds.length,"updatedSolutionIds length")
        console.log("completed")
        connection.close();
    }
    catch (error) {
        console.log(error)
    }
})().catch(err => console.error(err));
