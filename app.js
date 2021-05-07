/**
 * name : app.js
 * author : Aman Jung Karki
 * created-date : 09-Dec-2019
 * Description : Root file.
 */
 console.log("-------Deployment testing starts here------------------");
 console.log(process.env.APPLICATION_PORT)
 console.log(process.env.APPLICATION_ENV)
 console.log(process.env.MONGODB_URL)
 console.log(Uprocess.env.USER_SERVICE_URL)
 console.log(process.env.INTERNAL_ACCESS_TOKEN)
 console.log(process.env.KAFKA_COMMUNICATIONS_ON_OFF)
 console.log(process.env.KAFKA_URL)
 console.log(process.env.SUBMISSION_RATING_QUEUE_TOPIC)
 console.log(process.env.COMPLETED_OBSERVATION_SUBMISSION_TOPIC)
 console.log(process.env.INCOMPLETE_OBSERVATION_SUBMISSION_TOPIC)
 console.log(process.env.COMPLETED_SURVEY_SUBMISSION_TOPIC)
 console.log(process.env.KAFKA_GROUP_ID)
 console.log(process.env.IMPROVEMENT_PROJECT_SUBMISSION_TOPIC)
 console.log(process.env.ELASTICSEARCH_COMMUNICATIONS_ON_OFF)
 console.log(process.env.ELASTICSEARCH_HOST_URL)
 console.log(process.env.ELASTIC_SEARCH_SNIFF_ON_START)
 console.log(process.env.ELASTICSEARCH_ENTITIES_INDEX)
 console.log(process.env.ML_CORE_SERVICE_URL)
 console.log(process.env.ML_PROJECT_SERVICE_URL)
 console.log(process.env.KEYCLOAK_PUBLIC_KEY_PATH)
 console.log("-------Deployment testing ends   here------------------");

 
require("dotenv").config();

//express
const express = require("express");
let app = express();

// Health check
require("./healthCheck")(app);

require("./config");
require("./config/globals")();

let environmentData = require("./envVariables")();

if(!environmentData.success) {
  console.log("Server could not start . Not all environment variable is provided");
  process.exit();
}

let router = require("./routes");

//required modules
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const cors = require("cors");
var fs = require("fs");
var path = require("path");
var expressValidator = require('express-validator');

//To enable cors
app.use(cors());
app.use(expressValidator())

app.use(fileUpload());
app.use(bodyParser.json({ limit: '50MB' }));
app.use(bodyParser.urlencoded({ limit: '50MB', extended: false }));
app.use(express.static("public"));


app.all("*", (req, res, next) => {
  console.log("-------Request log starts here------------------");
  console.log(
    "%s %s on %s from ",
    req.method,
    req.url,
    new Date(),
    req.headers["user-agent"]
  );
  console.log("Request Headers: ", req.headers);
  console.log("Request Body: ", req.body);
  console.log("Request Files: ", req.files);
  console.log("-------Request log ends here------------------");
  next();
});

//add routing
router(app);

//listen to given port
app.listen(process.env.APPLICATION_PORT, () => {
  console.log("Environment: " + process.env.APPLICATION_ENV);
  console.log("Application is running on the port:" + process.env.APPLICATION_PORT);
});

module.exports = app;