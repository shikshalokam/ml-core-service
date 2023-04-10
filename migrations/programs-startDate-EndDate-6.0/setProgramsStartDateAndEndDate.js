let _ = require("lodash");
const path = require("path");
let MongoClient = require("mongodb").MongoClient;
let mongoUrl = process.env.MONGODB_URL;
let dbName = mongoUrl.split("/").pop();
let url = mongoUrl.split(dbName)[0];

(async () => {
    
    let connection = await MongoClient.connect(url, { useNewUrlParser: true });
    let db = connection.db(dbName);
    try {
        // get all active programs with createdAt value
        let collectionDocs = await db.collection("programs").find({ 
            status: "active",   
            createdAt: {"$exists": true}
        }).project({_id:1,createdAt:1}).toArray();
        
        //reduce array to small chunks
        let chunkOfprogramsDetails = _.chunk(collectionDocs, 50);
        
        //loop each chunk
        for ( let chunkPointer = 0; chunkPointer < chunkOfprogramsDetails.length; chunkPointer++ ) {
        
            let currentChunk = chunkOfprogramsDetails[chunkPointer];
            //loop each program details
            for ( let currentChunkIndex = 0 ; currentChunkIndex < currentChunk.length; currentChunkIndex++ ) {

                let monthToAdd = 12; // ---------------------set to one year -----------------------------
                let id = currentChunk[currentChunkIndex]._id;
                const startDate = currentChunk[currentChunkIndex].createdAt
                const endDate = new Date(currentChunk[currentChunkIndex].createdAt);
                endDate.setFullYear( endDate.getFullYear(), endDate.getMonth() + monthToAdd );

                //update programs
                await db.collection("programs").findOneAndUpdate(
                    { '_id': id }, 
                    { $set: { startDate: startDate, endDate : endDate} }
                );
            }
        }
        console.log("-----------------------Finished----------------------")
        console.log(" finished programs updation of startDate and endDate")
        console.log("-----------------------------------------------------")
        connection.close();
    }
    catch (error) {
        console.log(error)
    }
})().catch(err => console.error(err));
