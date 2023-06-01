/**
 * name : utils.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All utility functions.
 */

// Dependencies
const {validate : uuidValidate,v4 : uuidV4} = require('uuid');
const md5 = require("md5");

 /**
  * convert string to camelCaseToTitleCase.
  * @function
  * @name camelCaseToTitleCase
  * @param {String} in_camelCaseString - String of camel case.
  * @returns {String} returns a titleCase string. ex: helloThereMister, o/p: Hello There Mister
*/

function camelCaseToTitleCase(in_camelCaseString) {
  var result = in_camelCaseString // "ToGetYourGEDInTimeASongAboutThe26ABCsIsOfTheEssenceButAPersonalIDCardForUser456InRoom26AContainingABC26TimesIsNotAsEasyAs123ForC3POOrR2D2Or2R2D"
    .replace(/([a-z])([A-Z][a-z])/g, "$1 $2") // "To Get YourGEDIn TimeASong About The26ABCs IsOf The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times IsNot AsEasy As123ForC3POOrR2D2Or2R2D"
    .replace(/([A-Z][a-z])([A-Z])/g, "$1 $2") // "To Get YourGEDIn TimeASong About The26ABCs Is Of The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
    .replace(/([a-z])([A-Z]+[a-z])/g, "$1 $2") // "To Get Your GEDIn Time ASong About The26ABCs Is Of The Essence But APersonal IDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
    .replace(/([A-Z]+)([A-Z][a-z][a-z])/g, "$1 $2") // "To Get Your GEDIn Time A Song About The26ABCs Is Of The Essence But A Personal ID Card For User456In Room26A ContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
    .replace(/([a-z]+)([A-Z0-9]+)/g, "$1 $2") // "To Get Your GEDIn Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3POOr R2D2Or 2R2D"

    // Note: the next regex includes a special case to exclude plurals of acronyms, e.g. "ABCs"
    .replace(/([A-Z]+)([A-Z][a-rt-z][a-z]*)/g, "$1 $2") // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"
    .replace(/([0-9])([A-Z][a-z]+)/g, "$1 $2") // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC 26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"

    // Note: the next two regexes use {2,} instead of + to add space on phrases like Room26A and 26ABCs but not on phrases like R2D2 and C3PO"
    .replace(/([A-Z]{2,})([0-9]{2,})/g, "$1 $2") // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
    .replace(/([0-9]{2,})([A-Z]{2,})/g, "$1 $2") // "To Get Your GED In Time A Song About The 26 ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
    .trim();

  // capitalize the first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}


 /**
  * Convert string from hyphen case to camelCase.
  * @function
  * @name hyphenCaseToCamelCase
  * @param {String} string - String in hyphen case.
  * @returns {String} returns a camelCase string.
*/

function hyphenCaseToCamelCase(string) {
  return string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

 /**
  * convert string to lowerCase.
  * @function
  * @name lowerCase
  * @param {String} str 
  * @returns {String} returns a lowercase string. ex: HELLO, o/p: hello
*/

function lowerCase(str) {
  return str.toLowerCase()
}

 /**
  * check whether the given string is url.
  * @function
  * @name lowerCase
  * @param {String} str 
  * @returns {Boolean} returns a Boolean value. ex:"http://example.com:3000/pathname/?search=test" , o/p:true
*/

function checkIfStringIsUrl(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}

 /**
  * check whether the data is present in env.
  * @function
  * @name checkIfEnvDataExistsOrNot
  * @param {String} str 
  * @returns {String} returns a env data if found else default value. 
*/

function checkIfEnvDataExistsOrNot(data){
  
  let value;

  if(process.env[data] && process.env[data] !== ""){
    value  = process.env[data]
  } else {
    let defaultEnv = "DEFAULT_"+data;
    value = process.env[defaultEnv]
  }

  return value;
}

 /**
  * check whether the id is mongodbId or not.
  * @function
  * @name isValidMongoId
  * @param {String} id 
  * @returns {Boolean} returns whether id is valid mongodb id or not.  
*/

function isValidMongoId(id) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

  /**
   * Convert string to mongodb object id.
   * @method
   * @name convertStringToObjectId
   * @param id - string id
   * @returns {ObjectId} - returns objectId 
  */

function convertStringToObjectId(id) {
    
  let checkWhetherIdIsValidMongoId = gen.utils.isValidMongoId(id);
  if(checkWhetherIdIsValidMongoId) {
      id = ObjectId(id);
  }

  return id;
}

/**
   * Generate unique id.s
   * @method
   * @name generateUniqueId
   * @returns {String} - unique id 
  */

function generateUniqueId() {
  return uuidV4();
}

 /**
  * check whether the url is a valid sunbird API
  * @function
  * @name checkIfURLIsSunbirdAPI
  * @param {String} url 
  * @returns {Boolean} returns whether url is valid sunbird API or not.  
*/

function checkIfURLIsSunbirdAPI(url) {
  return (url.startsWith(process.env.sunbird_url)) ? true : false;
}

 /**
  * Get epoch time from current date.
  * @function
  * @name epochTime
  * @returns {Date} returns epoch time.  
*/

function epochTime() {
  var currentDate = new Date();
  currentDate = currentDate.getTime();
  return currentDate;
}

/**
  * Parse a single column.
  * @function
  * @name valueParser - Parse value
  * @param {String} dataToBeParsed - data to be parsed. 
  * @returns {Object} returns parsed data
*/

function valueParser(dataToBeParsed) {

  let parsedData = {}

  Object.keys(dataToBeParsed).forEach(eachDataToBeParsed => {
    parsedData[eachDataToBeParsed] = dataToBeParsed[eachDataToBeParsed].trim()
  })

  if(parsedData._arrayFields && parsedData._arrayFields.split(",").length > 0) {
    parsedData._arrayFields.split(",").forEach(arrayTypeField => {
      if (parsedData[arrayTypeField]) {
        parsedData[arrayTypeField] = parsedData[arrayTypeField].split(",")
      }
    })
  }

  return parsedData
}

 /**
  * check whether string is valid uuid.
  * @function
  * @name checkValidUUID
  * @param {String} uuids 
  * @returns {Boolean} returns a Boolean value true/false
*/

function checkValidUUID(uuids) {

  var validateUUID = true;
  if(Array.isArray(uuids)){
      for (var i = 0; uuids.length > i; i++) {
          if(!uuidValidate(uuids[i])){
            validateUUID = false
          }
      }
  }else {
     validateUUID = uuidValidate(uuids);
  }
  return validateUUID;
}

function convertStringToBoolean(stringData) {
  let stringToBoolean = (stringData === "TRUE" || stringData === "true");
  return stringToBoolean;
}

/**
  * md5 hash
  * @function
  * @name md5Hash
  * @returns {String} returns hashed value.  
*/

function md5Hash(value) {
  return md5(value);
}

/**
  * filter out location id and code
  * @function
  * @name filterLocationIdandCode
  * @returns {Object} - Object contain locationid and location code array.  
*/

function filterLocationIdandCode(dataArray) {
  let locationIds = [];
  let locationCodes = [];
  dataArray.forEach(element=>{
      if (this.checkValidUUID(element)) {
          locationIds.push(element);
      } else {
          locationCodes.push(element);
      }
  });
  return ({
    ids : locationIds,
    codes : locationCodes
  });
}

function arrayIdsTobjectIds(ids) {
  return ids.map(id => ObjectId(id));
}

/**
  * check whether string contains only number
  * @function
  * @name checkIfStringIsNumber
  * @returns {Boolean} returns a Boolean value true/false
*/

function checkIfStringIsNumber(str) {
  return /^[0-9]+$/.test(str);
}

/**
  * array of object to array objectId
  * @function
  * @name arrayOfObjectToArrayOfObjectId
  * @returns {Boolean} returns a Boolean value true/false
*/

function arrayOfObjectToArrayOfObjectId(ids) {
  return ids.map(obj => obj._id);
}

/**
  * Returns array of objects in string format and accepts array of objectId
  * @function
  * @name convertArrayObjectIdtoStringOfObjectId
  * @returns {Boolean} returns a array of objectIds in string format
  * Input = [ObjectId(6319a4d53c40dd000978dacb), ObjectId(6319a4d53c40dd000978dacb)] This array will contain buffer of objectId
  * Output = ["6319a4d53c40dd000978dacb","6319a4d53c40dd000978dacb"] This is the output in format of string
*/

function convertArrayObjectIdtoStringOfObjectId(ids) {
  return ids.map(obj => obj._id.toString());
}

module.exports = {
  camelCaseToTitleCase : camelCaseToTitleCase,
  lowerCase : lowerCase,
  checkIfStringIsUrl : checkIfStringIsUrl,
  checkIfEnvDataExistsOrNot : checkIfEnvDataExistsOrNot,
  hyphenCaseToCamelCase : hyphenCaseToCamelCase,
  isValidMongoId : isValidMongoId,
  convertStringToObjectId : convertStringToObjectId,
  generateUniqueId : generateUniqueId,
  checkIfURLIsSunbirdAPI : checkIfURLIsSunbirdAPI,
  epochTime : epochTime,
  valueParser : valueParser,
  checkValidUUID : checkValidUUID,
  convertStringToBoolean : convertStringToBoolean,
  md5Hash : md5Hash,
  filterLocationIdandCode : filterLocationIdandCode,
  arrayIdsTobjectIds : arrayIdsTobjectIds,
  checkIfStringIsNumber : checkIfStringIsNumber,
  arrayOfObjectToArrayOfObjectId : arrayOfObjectToArrayOfObjectId,
  convertArrayObjectIdtoStringOfObjectId:convertArrayObjectIdtoStringOfObjectId
};
