/**
 * name : db-config.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : Database configuration file.
 */


//dependencies
const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const mongooseAutoPopulate = require("mongoose-autopopulate");
const mongooseTimeStamp = require("mongoose-timestamp");
const mongooseTtl = require("mongoose-ttl");
let objectId = mongoose.Types.ObjectId;

/**
 * Mongodb connection.
 * @function 
 * @name databaseConfiguration
 * @return {Object} consisting of database,createModel,ObjectId and models.
 */

var databaseConfiguration = function () {

  mongoose.set('useCreateIndex', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useUnifiedTopology', true);
  
  var db = mongoose.createConnection(
    process.env.MONGODB_URL,
    {
      useNewUrlParser: true
    }
  );

  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("Connected to database!");
  });

  var createModel = function (opts) {
    if (typeof opts.schema.__proto__.instanceOfSchema === "undefined") {
      var schema = mongoose.Schema(opts.schema, opts.options);
    } else {
      var schema = opts.schema;
    }

    schema.plugin(mongooseTimeStamp, {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    });
    
    schema.plugin(mongooseAutoPopulate);
    schema.plugin(mongooseDelete, { overrideMethods: true, deletedAt: true });

    if (opts.options) {
      if (
        opts.options.expireAfterSeconds ||
        opts.options.expireAfterSeconds === 0
      ) {
        console.log("Expire Configured for " + opts.name);
        schema.plugin(mongooseTtl, {
          ttl: opts.options.expireAfterSeconds * 1000
        });
      }
    }
    
    var model = db.model(opts.name, schema, opts.name);
    return model;
  };

  var getCollection = function (modelName) {
    return db.collection(modelName);
  } 

  return {
    database: db,
    createModel: createModel,
    ObjectId: objectId,
    models: db.models,
    getCollection : getCollection
  };
};

module.exports = databaseConfiguration;
