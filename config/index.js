/**
 * Project          : Shikshalokam-Kendra
 * Module           : Configuration
 * Source filename  : index.js
 * Description      : Environment related configuration variables
 */

/**
  * Database configuration.
  * @function
  * @name db_connect
*/

let db_connect = function () {
  global.database = require("./db/mongodb")();
  global.ObjectId = database.ObjectId;
  global.Abstract = require("../generics/abstract");
};

/**
  * Elastic search configuration.
  * @function
  * @name elasticsearch_connect
*/

let elasticsearch_connect = function () {
  global.elasticsearch = require("./db/elastic-search")();
};

const configuration = {
  root: require("path").normalize(__dirname + "/.."),
  app: {
    name: "ml-core-service"
  }
};

db_connect();
elasticsearch_connect();

module.exports = configuration;
