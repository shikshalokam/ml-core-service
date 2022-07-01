const { CONFIG } = require("../constant/config");

const mongoose = require("mongodb").MongoClient;


const connect = async () => {
  try {
    const db = await mongoose.connect(CONFIG.DB.DB_HOST);
    database = db.db(CONFIG.DB.DB_NAME);
  } catch (err) {
    console.log("Error While connecting to DB", err);

  }
};

const createDBInstance = async () => {
  await connect();
};

const getDBInstance = () => {
  return database;
};

module.exports = {
  createDBInstance,
  getDBInstance,
};
