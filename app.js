/**
 * name : app.js
 * author : Aman Jung Karki
 * created-date : 09-Dec-2019
 * Description : Root file.
 */

require("dotenv").config();

//express
const express = require("express");
let app = express();

// Health check
require("./healthCheck")(app);

require("./config");
require("./config/globals")();
require("./config/cloud-service");

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
  console.log({"Debugging ML Core Service": true});
  console.log("<------------Request log starts here------------------>");
  console.log("Request URL: ", req.url);
  console.log("Request Headers: ", JSON.stringify(req.headers));
  console.log("Request Body: ", JSON.stringify(req.body));
  // console.log("Request Files: ", req.files);
  console.log("<--------------Request log ends here------------------>");
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