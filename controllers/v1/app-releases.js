/**
 * name : app-releases.js
 * author : Aman
 * created-date : 04-03-2020
 * Description : App releases. 
 */

 // Dependencies
 const versionHelper = require(MODULES_BASE_PATH + "/app-releases/helper");
 const csv = require('csvtojson');
 const csvFileStream = require(ROOT_PATH + "/generics/file-stream");

 
  /**
     * AppVersion
     * @class
 */
 module.exports = class AppReleases extends Abstract {
   constructor() {
     super(schemas["app-releases"]);
   }
 
   static get name() {
     return "appReleases";
   }
 
 };
 