/**
 * name : globals.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : All globals data.
 */


//dependencies

const fs = require("fs");
const path = require("path");
let requireAll = require("require-all");

gen = Object.assign(global, {});

/**
 * Expose all globals data .
 */

module.exports = function () {

  global.async = require("async");
  global.ROOT_PATH = path.join(__dirname, '..');
  global.MODULES_BASE_PATH = ROOT_PATH + "/module";
  global.GENERIC_HELPERS_PATH = ROOT_PATH + "/generics/helpers";
  global._ = require("lodash");
  gen.utils = require(ROOT_PATH + "/generics/helpers/utils");
  require(".");

  global.locales = [];

  global.httpStatusCode = 
  require(ROOT_PATH + "/generics/http-status-codes");

  // bootstrap all models
  global.models = requireAll({
    dirname: ROOT_PATH + "/models",
    filter: /(.+)\.js$/,
    resolve: function (Model) {
      return Model;
    }
  });

  //load base v1 controllers
  fs.readdirSync( ROOT_PATH + "/controllers/v1/").forEach(function (file) {
    checkWhetherFolderExistsOrNor(ROOT_PATH + "/controllers/v1/", file);
  });

   //load base v2 controllers
   fs.readdirSync( ROOT_PATH + "/controllers/v2/").forEach(function (file) {
    checkWhetherFolderExistsOrNor(ROOT_PATH + "/controllers/v2/", file);
  });

  function checkWhetherFolderExistsOrNor(pathToFolder, file) {

    let folderExists = fs.lstatSync(pathToFolder + file).isDirectory();

    if (folderExists) {
      fs.readdirSync(pathToFolder + file).forEach(function (folderOrFile) {
        checkWhetherFolderExistsOrNor(pathToFolder + file + "/", folderOrFile);
      })

    } else {
      if (file.match(/\.js$/) !== null) {
        var name = file.replace('.js', '');
        global[name + 'BaseController'] = require(pathToFolder + file);
      }
    }

  }

  // load schema files
  global.schemas = new Array
  fs.readdirSync(ROOT_PATH + '/models/').forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      var name = file.replace('.js', '');
      global.schemas[name] = require(ROOT_PATH + '/models/' + file);
    }
  });

  // boostrap all controllers
  global.controllers = requireAll({
    dirname: ROOT_PATH + "/controllers",
    resolve: function (Controller) {
      return new Controller();
    }
  });

  // Load all message constants
  global.constants = new Array
  fs.readdirSync(ROOT_PATH + "/generics/constants")
  .forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      let name = file.replace('.js', '');
      name = gen.utils.hyphenCaseToCamelCase(name);
      global.constants[name] = 
      require(ROOT_PATH + "/generics/constants/" + file);
    }
  });

  //define cache as global variable
  global.cache = require(ROOT_PATH+"/generics/helpers/cache");

};
