/**
 * name : file-stream.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : json2csvtransform (Streaming API).
 */

const json2Csv = require('json2csv').Transform;
const stream = require("stream");
const fs = require("fs");
const moment = require("moment-timezone");
const DEFAULT_REPORTS_PATH = process.env.CSV_REPORTS_PATH;

/**
    * FileStream
    * @class
*/

let FileStream = class FileStream {

  constructor(fileName) {
    const currentDate = new Date();
    const fileExtensionWithTime = moment(currentDate).tz("Asia/Kolkata").format("YYYY_MM_DD_HH_mm") + ".csv";
    
    const filePath = `${DEFAULT_REPORTS_PATH}/${moment(currentDate).tz("Asia/Kolkata").format("YYYY_MM_DD")}/`;
    this.ensureDirectoryPath(filePath);
    this.input = new stream.Readable({ objectMode: true });
    this.fileName = filePath + fileName + "_" + fileExtensionWithTime;
    this.output = fs.createWriteStream(this.fileName, { encoding: 'utf8' });
    this.processor = null;
  }

  initStream() {
    this.input._read = () => { };
    const opts = {};
    const transformOpts = { objectMode: true };
    const json2csv = new json2Csv(opts, transformOpts);
    this.processor = this.input.pipe(json2csv).pipe(this.output);
    return this.input;
  }

  getProcessorPromise() {
    const processor = this.processor;
    return new Promise(function (resolve, reject) {
      processor.on('finish', resolve);
    });
  }

  fileNameWithPath() {
    return this.fileName;
  }

  ensureDirectoryPath(filePath) {
    try {
      fs.mkdirSync(filePath, { recursive: true });
    } catch (err) {
      console.log(err)
      if (err.code !== 'EEXIST') throw err
    }
  }

};

module.exports = FileStream;
