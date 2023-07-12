let _ = require("lodash");
const path = require("path");
let MongoClient = require("mongodb").MongoClient;
let mongoUrl = process.env.MONGODB_URL;
let dbName = mongoUrl.split("/").pop();
let url = mongoUrl.split(dbName)[0];
var fs = require("fs");

(async () => {
  let connection = await MongoClient.connect(url, { useNewUrlParser: true });
  let db = connection.db(dbName);
  let updatedProgramIds = [];
  let updatedSolutionIds = [];
  try {
    console.log("-----------------------Started----------------------");
    // get all active programs with createdAt value
    let collectionDocs = await db
      .collection("programs")
      .find({
        status: "active",
      })
      .project({ _id: 1, createdAt: 1, components: 1 })
      .toArray();

    //reduce array to small chunks
    let chunkOfprogramsDetails = _.chunk(collectionDocs, 50);

    //loop each chunk
    for (
      let chunkPointer = 0;
      chunkPointer < chunkOfprogramsDetails.length;
      chunkPointer++
    ) {
      let currentChunk = chunkOfprogramsDetails[chunkPointer];
      //loop each program details
      for (
        let currentChunkIndex = 0;
        currentChunkIndex < currentChunk.length;
        currentChunkIndex++
      ) {
        let id = currentChunk[currentChunkIndex]._id;
        let endDate = "";
        let startDate = "";
        let monthToAdd = 12; // ---------------------set to one year -----------------------------
        //checking if program has components or not
        if (currentChunk[currentChunkIndex].components.length === 0) {
          //if it will not have components then createdAt will become startDate and endDate will 1 year from startDate
          startDate = currentChunk[currentChunkIndex].createdAt;
          endDate = new Date(currentChunk[currentChunkIndex].createdAt);
          endDate.setFullYear(
            endDate.getFullYear(),
            endDate.getMonth() + monthToAdd
          );
        } else {
          //if program has components then will query solutions for components and will get details of solutions
          const solutions = await db
            .collection("solutions")
            .find({
              _id: { $in: currentChunk[currentChunkIndex].components },
            })
            .project({
              _id: 1,
              startDate: 1,
              endDate: 1,
              createdAt: 1,
              status: 1,
            })
            .sort({ endDate: -1 })
            .toArray();

          //looping throught each solution to check if solution need update or not
          for (let i = 0; i < solutions.length; i++) {
            //this will be used to check if solution needs to be updated or not
            let update = false;
            let query = { $set: {} };
            //checking if have startdate
            if (!solutions[i].hasOwnProperty("startDate")) {
              //if it will not have startDate then createdAt will become startdate
              update = true;
              solutions[i].startDate = solutions[i].createdAt;
              query["$set"].startDate = solutions[i].startDate;
            }
            //checking if endDate is present or not
            if (!solutions[i].hasOwnProperty("endDate")) {
              // if it dosent have endDate then endDate will be calculated as runTime + 1year
              solutions[i].endDate = new Date();
              solutions[i].endDate.setFullYear(
                solutions[i].endDate.getFullYear(),
                solutions[i].endDate.getMonth() + monthToAdd
              );
              query["$set"].endDate = solutions[i].endDate;
              update = true;
            }
            //if update is required then it will upate the solution
            if (update) {
              await db
                .collection("solutions")
                .findOneAndUpdate({ _id: solutions[i]._id }, query);
              updatedSolutionIds.push(solutions[i]._id);
            }
          }

          //get start and end date from solution startDate and endDate
          let dates = getStartAndEndDates(solutions);
          startDate = dates.startDate;
          endDate = dates.endDate;
        }

        // update programs
        await db
          .collection("programs")
          .findOneAndUpdate(
            { _id: id },
            { $set: { startDate: startDate, endDate: endDate } }
          );
        console.log("program Updated : ", id);
        updatedProgramIds.push(id);
      }
    }
    //write updated program ids to file
    fs.writeFile(
      "updatedProgramIds.json",

      JSON.stringify({
        Programs: updatedProgramIds,
        solutions: updatedSolutionIds,
      }),

      function (err) {
        if (err) {
          console.error("Crap happens");
        }
      }
    );
    console.log("-----------------------Finished----------------------");
    console.log(" finished programs updation of startDate and endDate");
    console.log("-----------------------------------------------------");
    connection.close();
  } catch (error) {
    console.log(error);
  }
})().catch((err) => console.error(err));
//fucntion to get start and end dates in sorted order and return index 0 of each
function getStartAndEndDates(solutions) {
  const dates = {};
  const startDate = solutions.sort((a, b) => a.startDate - b.startDate);
  dates.startDate = startDate[0].startDate;
  const endDate = solutions.sort((a, b) => b.endDate - a.endDate);
  dates.endDate = endDate[0].endDate;
  return dates;
}
