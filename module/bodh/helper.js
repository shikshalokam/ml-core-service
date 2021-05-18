/**
 * name : bodh/helper.js
 * author : Akash Shah
 * created-date : 03-Jan-2020
 * Description : All Bodh related helper functions.
 */

// Dependencies
const fs = require("fs");
const { promisify } = require("util");
const httpRequest = require(GENERIC_HELPERS_PATH+'/http-request');
const dictionaryHelper = require(MODULES_BASE_PATH + "/dictionary/helper");
const elasticSearchHelper = require(GENERIC_HELPERS_PATH + "/elastic-search");
const filesHelper = require(MODULES_BASE_PATH + "/files/helper");

// Constants
const bodhContentIndex = gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_BODH_CONTENT_INDEX");
const bodhContentIndexType = gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_BODH_CONTENT_INDEX_TYPE");
const qrCodeHelpers = require(MODULES_BASE_PATH+"/qr-codes/helper");
let sunbirdService = require(ROOT_PATH+"/generics/services/sunbird");

/**
    * BodhHelper
    * @class
*/

module.exports = class BodhHelper {

     /**
      * Forward search request and retrieve search results.
      * @method
      * @name getSearchResults
      * @param {Object} request Contains request url, headers and body.
      * @returns {Promise} returns a promise.
     */

    static getSearchResults(request) {
        return new Promise(async (resolve, reject) => {
            try {

                
                let reqObj = new httpRequest()

                let response = await reqObj.post(
                    request.url,
                    {
                        json : request.body,
                        headers : request.headers
                    }
                )

                return resolve({
                    success : true,
                    message : "Search results from bodh service.",
                    data : response
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }


     /**
      * Parse content for keywords and insert in Elastic search.
      * @method
      * @name parseContentForKeywords
      * @param {Array} content Contains array of content.
      * @returns {Promise} returns a promise.
     */

    static parseContentForKeywords(content = []) {
        return new Promise(async (resolve, reject) => {
            try {

                if(content.length < 0) {
                    throw new Error("Missing content details.");
                }

                let keywordsData = new Array

                content.forEach(eachContent => {
                    keywordsData.push(...eachContent.keywords)
                })

                let keywordsUpdateResult = new Array

                for (let pointerToKeywordsData = 0;
                    pointerToKeywordsData < keywordsData.length;
                    pointerToKeywordsData++) {
                        
                        let addKeywordOperation = await dictionaryHelper
                        .addWordToDictionary(keywordsData[pointerToKeywordsData]);

                        if(!addKeywordOperation.data) {
                            keywordsUpdateResult.push({
                                word : keywordsData[pointerToKeywordsData],
                                status : constants.common.FAILED
                            })
                        } else {
                            keywordsUpdateResult.push({
                                word : keywordsData[pointerToKeywordsData],
                                status : "Success."
                            })
                        }
                        
                }

                return resolve({
                    success : true,
                    message : "Updated Keywords in Elastic Search.",
                    data : keywordsUpdateResult
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }


     /**
      * Parse content insert in Elastic search to use for auto completion.
      * @method
      * @name parseContentForAutocomplete
      * @param {Array} content Contains array of content.
      * @param {Boolean} isACourse Whether or not content is a course.
      * @returns {Promise} returns a promise.
     */

    static parseContentForAutocomplete(content = [], isACourse = false) {
        return new Promise(async (resolve, reject) => {
            try {

                if(content.length < 0) {
                    throw new Error("Missing content details.");
                }

                let contentUpdateResult = new Array

                for (let pointerToContentData = 0;
                    pointerToContentData < content.length;
                    pointerToContentData++) {
                        
                        const eachContent = content[pointerToContentData];

                        let suggestContent = [
                            {
                                input : eachContent.name.trim().toLowerCase(),
                                weight : 3,
                                contexts : {
                                    isACourse : isACourse
                                }
                            },
                            {
                                input : eachContent.description.trim().toLowerCase(),
                                weight : 1,
                                contexts : {
                                    isACourse : isACourse
                                }
                            }
                        ]

                        const addCourseToAutocomplete = await elasticSearchHelper.createOrUpdateDocumentInIndex(
                            bodhContentIndex,
                            bodhContentIndexType,
                            eachContent.IL_UNIQUE_ID,
                            {
                                suggest : suggestContent,
                                rawContent : eachContent
                            }
                        );

                        if(addCourseToAutocomplete.statusCode != httpStatusCode["ok"].status && addCourseToAutocomplete.statusCode != 201) {
                            throw new Error("Failed to add content to auto complete index.")
                        }

                        if(Array.isArray(eachContent.createdFor) && eachContent.createdFor.length > 0) {
                            // Put course detail in ES by organisation index
                            for (let pointerToContentCreatedForOrganisations = 0; pointerToContentCreatedForOrganisations < eachContent.createdFor.length; pointerToContentCreatedForOrganisations++) {
                                const orgId = eachContent.createdFor[pointerToContentCreatedForOrganisations]; 

                                // Check if ES index for organisation content exists   
                                const checkIfOrgIndexExists = await this.autocompleteIndexTypeMapExists(orgId);

                                if(checkIfOrgIndexExists.success && !checkIfOrgIndexExists.data) {
                                    // Create org content index in ES
                                    const createOrgIndexMapping = await this.createAutocompleteIndexTypeMap(orgId);
                                    if(createOrgIndexMapping.success && !createOrgIndexMapping.data) {
                                        throw new Error("Failed to create auto complete index mapping.")
                                    }
                                }

                                const addCourseToAutocomplete = await elasticSearchHelper.createOrUpdateDocumentInIndex(
                                    bodhContentIndex+"-"+orgId,
                                    bodhContentIndexType,
                                    eachContent.IL_UNIQUE_ID,
                                    {
                                        suggest : suggestContent,
                                        rawContent : eachContent
                                    }
                                );
                                if(addCourseToAutocomplete.statusCode != httpStatusCode["ok"].status && addCourseToAutocomplete.statusCode != 201) {
                                    throw new Error("Failed to add content to auto complete index.")
                                }
                            }
                        }

                        if(!addCourseToAutocomplete.data) {
                            contentUpdateResult.push({
                                IL_UNIQUE_ID : eachContent.IL_UNIQUE_ID,
                                status : constants.common.FAILED
                            })
                        } else {
                            contentUpdateResult.push({
                                IL_UNIQUE_ID : eachContent.IL_UNIQUE_ID,
                                status : constants.common.SUCCESS
                            })
                        }
                        
                }

                return resolve({
                    success : true,
                    message : "Updated Keywords in Elastic Search.",
                    data : contentUpdateResult
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }

     /**
      * Log query which missed ES spell check and returned no results from Bodh Service.
      * @method
      * @name logQueryMissFromESAndBodh
      * @param {String} queryString Query typed by user.
      * @param {String} searchServiceUrl Bodh search service URL requested.
      * @returns {Promise} returns a promise.
     */

    static logQueryMissFromESAndBodh(queryString = "", searchServiceUrl = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(queryString == "" || searchServiceUrl == "") {
                    throw new Error("Missing query string or search service url.");
                }

                let today = new Date();

                let fileName = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}.csv`;
                
                let filePath = ROOT_PATH+"/"+process.env.LOGGER_DIRECTORY+"/bodh/search";
                
                fs.existsSync(filePath) || fs.mkdirSync(filePath, {recursive : true});

                const appendToFile = promisify(fs.appendFile);

                let data = `\n"${queryString}","${searchServiceUrl}"`;
                
                let writeToFilesResponse = await appendToFile(filePath+"/"+fileName, data, 'utf8')

                return resolve({
                    success : true,
                    message : "Updated Keywords in Elastic Search.",
                    data : true
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }


     /**
      * Check if mapping for dictionary index exists in Elastic search.
      * @method
      * @name autocompleteIndexTypeMapExists
      * @param {String} organisationId Query typed by user.
      * @returns {Promise} returns a promise.
     */

    static autocompleteIndexTypeMapExists(organisationId = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(bodhContentIndex == "") {
                    throw new Error("Missing bodh content index name");
                }

                if(bodhContentIndexType == "") {
                    throw new Error("Missing bodh content index type name");
                }

                let bodhContentIndexName = bodhContentIndex;
                if(organisationId != "") {
                    bodhContentIndexName = bodhContentIndex+"-"+organisationId;
                }

                const bodhIndexMapping = await elasticSearchHelper.getIndexTypeMapping(bodhContentIndexName, bodhContentIndexType);

                if(bodhIndexMapping.statusCode != httpStatusCode["ok"].status) {
                    throw new Error("Bodh content index type map does not exist.");
                }
            
                return resolve({
                    success : true,
                    message : "Bodh content index type map exists",
                    data : true
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }

     /**
      * Create bodh content index in Elastic search.
      * @method
      * @name createAutocompleteIndexTypeMap
      * @param {String} organisationId Query typed by user.
      * @returns {Promise} returns a promise.
     */

    static createAutocompleteIndexTypeMap(organisationId = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(bodhContentIndex == "") {
                    throw new Error("Missing bodh content index name");
                }

                if(bodhContentIndexType == "") {
                    throw new Error("Missing bodh content index type name");
                }

                let bodhContentIndexName = bodhContentIndex;
                if(organisationId != "") {
                    bodhContentIndexName = bodhContentIndex+"-"+organisationId;
                }

                const createBodhContentIndex =  await elasticSearchHelper.createIndex(bodhContentIndexName);

                if(createBodhContentIndex.statusCode != httpStatusCode["ok"].status) {
                    throw new Error("Could not create bodh content index.");
                }

                let autoCompleteIndexMapping = {
                    properties: {
                        suggest: {
                            type : "completion",
                            contexts: [
                                { 
                                  "name": "isACourse",
                                  "type": "category"
                                }
                            ]
                        }
                    }
                }

                const bodhIndexMapping = await elasticSearchHelper.setIndexTypeMapping(bodhContentIndexName, bodhContentIndexType, autoCompleteIndexMapping);
                
                if(bodhIndexMapping.statusCode != httpStatusCode["ok"].status) {
                    throw new Error("Bodh content index type map does not exist.");
                }
            
                return resolve({
                    success : true,
                    message : "Bodh content index type created",
                    data : true
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }

     /**
      * Get search suggestions for user query string from Elastic search.
      * @method
      * @name getSearchSuggestions
      * @param {String} queryString Query string for auto complete.
      * @param {Object} queryFilters Set of filters for search suggestions.
      * @param {Int} size Limit for search results.
      * @returns {Promise} returns a promise.
     */

    static getSearchSuggestions(queryString = "", queryFilters = {}, size = 10) {
        return new Promise(async (resolve, reject) => {
            try {

                if(queryString == "") throw new Error("Missing query string.");

                let searchContext = {
                    isACourse : (queryFilters["isACourse"]) ? queryFilters["isACourse"] : false
                }

                let queryObject = {
                    _source: "rawContent",
                    suggest: {
                        nameSuggestion: {
                            prefix: queryString.trim().toLowerCase(),
                            completion: {
                                field: "suggest",
                                size: size,
                                skip_duplicates : true,
                                fuzzy: true,
                                contexts : searchContext
                            }
                        }
                    }
                }

                let organisationId = "";
                if(queryFilters["createdFor"]) {
                    if(Array.isArray(queryFilters["createdFor"]) && queryFilters["createdFor"][0] && queryFilters["createdFor"][0] != "") {
                        organisationId = queryFilters["createdFor"][0];
                    } else if(queryFilters["createdFor"] != "") {
                        organisationId = queryFilters["createdFor"];
                    }
                    delete queryFilters["createdFor"];
                }

                let bodhContentIndexName = bodhContentIndex;
                if(organisationId != "") {
                    bodhContentIndexName = bodhContentIndex+"-"+organisationId;
                }

                const searchResponse = await elasticSearchHelper.searchDocumentFromIndex(bodhContentIndexName, bodhContentIndexType, queryObject);

                let suggestions = new Array;

                if(searchResponse.nameSuggestion[0].options.length > 0) {

                    let allowedFilterConditons =  await this.getAutocompleteContextKeys();

                    if(allowedFilterConditons.success && allowedFilterConditons.data) {
                        allowedFilterConditons = allowedFilterConditons.data;
                    } else {
                        allowedFilterConditons = [];
                    }

                    let filters = {};
                    let filterKeys = new Array;

                    allowedFilterConditons.forEach(filterKey => {
                        if(queryFilters[filterKey]) {
                            if (typeof queryFilters[filterKey] === 'string') {
                                filterKeys.push(filterKey);
                                filters[filterKey] = queryFilters[filterKey];
                            } else if (Array.isArray(queryFilters[filterKey]) && queryFilters[filterKey].length > 0) {
                                filterKeys.push(filterKey);
                                filters[filterKey] = queryFilters[filterKey];
                            }
                        }
                    })

                    let searchResults = _.map(searchResponse.nameSuggestion[0].options, '_source.rawContent');

                    // searchResults = _.filter(searchResults, filters);

                    searchResults.forEach(content => {
                        let filterTestPass = true;
                        for (let index = 0; index < filterKeys.length; index++) {
                            const filterKey = filterKeys[index];

                            // If content filter value is a string
                            if(typeof filters[filterKey] === 'string') {

                                // If content value for filter key is an array
                                if(Array.isArray(content[filterKey])) {
                                    if (!content[filterKey].includes(filters[filterKey])) {
                                        filterTestPass = false;
                                        break;
                                    }
                                } else { // If content value for filter key is a string
                                    if(content[filterKey] != filters[filterKey]) {
                                        filterTestPass = false;
                                        break;
                                    }
                                }

                            } else if(Array.isArray(filters[filterKey])) { // If content filter value is an array
                                
                                let allFilterValues = filters[filterKey];
                                let atLeastOneFilterValueMatch = false;

                                // Loop all values for filter key
                                for (let pointerToFilterValues = 0; pointerToFilterValues < allFilterValues.length; pointerToFilterValues++) {
                                    const filterValue = allFilterValues[pointerToFilterValues];
                                    
                                    // If content value for filter key is an array
                                    if(typeof content[filterKey] === 'string') {
                                        if(content[filterKey] == filterValue) {
                                            atLeastOneFilterValueMatch = true;
                                            break;
                                        }
                                    } else if(Array.isArray(content[filterKey])) { // If content value for filter key is a string
                                        if (content[filterKey].includes(filters[filterKey])) {
                                            atLeastOneFilterValueMatch = true;
                                            break;
                                        }
                                    }
                                }

                                if(!atLeastOneFilterValueMatch) {
                                    filterTestPass = false;
                                    break;
                                }
                            }
                        }

                        if(filterTestPass) {
                            suggestions.push(content.name);
                        }
                    })
                }

                return resolve({
                    success : true,
                    message : "Search suggestions fetched successfully.",
                    data : suggestions
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }

     /**
      * Get context keys for auto complete index.
      * @method
      * @name getAutocompleteContextKeys
      * @returns {Promise} returns a promise.
     */

    static getAutocompleteContextKeys() {
        return new Promise(async (resolve, reject) => {
            try {

                return resolve({
                    success : true,
                    message : "Autocomplete field context keys.",
                    data : [
                        "channel",
                        "contentType",
                        "medium",
                        "gradeLevel",
                        "subject",
                        "board"
                    ]
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }

    /**
      * Generate qr code from the content data
      * @method
      * @name generateQrCode
      * @param contentData - Bodh content information
      * @param userId - Logged in user id.
      * @param userToken - Logged in user token.
      * @returns {Arary} returns a array of qr code links.
     */

    static generateQrCode( contentData,userId,userToken ) {
        return new Promise(async (resolve, reject) => {
            try {

                let codes = await qrCodeHelpers.generateCodes(
                    contentData.length,
                    userToken
                );

                await new Promise((resolve)=>setTimeout(() => {
                    resolve();
                }, 3000)); 

                let result = [];

                for( let code = 0 ; code < codes.length ; code ++ ) {
                    
                    await qrCodeHelpers.publishCode(
                        codes[code],
                        userToken
                    );

                    await this.linkContent(
                        codes[code],
                        contentData[code].identifier,
                        userToken
                    );
                    
                    let generateQrCode = await qrCodeHelpers.generate(
                        {
                            code : codes[code],
                            head : contentData[code].name,
                            tail : contentData[code].identifier,
                            metaInformation : { ... contentData[code] },
                            appName : "bodh"
                        },userId);
                        
                    await this.publishContent(
                        contentData[code].identifier,
                        contentData[code].lastPublishedBy
                    );
                        
                    result.push(generateQrCode);
                }
                return resolve({
                    message : constants.apiResponses.QR_CODE_GENERATED,
                    result : result
                });
                
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Link content based on dial code and content id
      * @method
      * @name linkContent
      * @param dialCode - dial code
      * @param identifier - content id
      * @param token - Logged in user token
      * @returns {Promise}
     */

    static linkContent( dialCode,identifier,token ) {
        return new Promise(async (resolve, reject) => {
            try {

                let linkContentData = await sunbirdService.linkContent(
                    token,
                    {
                        "request" : {
                            "content" : {
                                "dialcode" : [ dialCode ],
                                "identifier" : [ identifier ]
                            }
                        }
                    }
                );

                if( linkContentData.responseCode !== constants.common.OK ){
                    throw {
                        message : 
                        constants.apiResponses.COULD_NOT_LINK_BODH_CONTENT
                    }
                }

                return resolve(linkContentData.responseCode);
                
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Publish content based oncontent id
      * @method
      * @name publishContent
      * @param contentId - content id
      * @param lastPublishedBy
      * @returns {Promise}
     */

    static publishContent( contentId, lastPublishedBy ) {
        return new Promise(async (resolve, reject) => {
            try {

                let publishContentData = await sunbirdService.publishContent(
                    {
                        "request" : {
                            "content" : {
                                "lastPublishedBy" : lastPublishedBy
                            }
                        }
                    },
                    contentId
                );

                if( publishContentData.responseCode !== constants.common.OK ){
                    throw {
                        message : 
                        constants.apiResponses.COULD_NOT_PUBLISH_CONTENT_DATA
                    }
                }

                return resolve(publishContentData.responseCode);
                
            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Get request middleware data.
      * @method
      * @name getBodhResult
      * @param {Object} request Contains request url, headers and body.
      * @returns {Object} returns message and result of the bodh api.
     */

    static getBodhResult(request) {
        return new Promise(async (resolve, reject) => {
            try {

                
                let reqObj = new httpRequest();
                let response;

                let options = {
                    headers : request.headers
                }

                let methodName = request.method.toUpperCase();

                if( methodName === constants.common.GET_METHOD ) {
                    
                    response = await reqObj.get(
                        request.url,
                        options
                    );
                } else if( methodName === constants.common.POST_METHOD ) {
                    options["json"] = request.body;

                    response = await reqObj.post(
                        request.url,
                        options
                    );
                }

                return resolve({
                    success : true,
                    message : 
                    constants.apiResponses.FETCH_BODH_REQUEST_MIDDLEWARE,
                    result : response.data
                });
                
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Check whether user is allowed in particular organisation.
      * @method
      * @name userIsAllowed
      * @param {String} token - logged in user token.
      * @param {String} userId - user Id.
      * @param {String} organisationId
      * @returns {Object} - isAllowed and organisationId
     */

    static userIsAllowed( token,userId,organisationId ) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileInformation = 
                await sunbirdService.getUserProfile(
                    token,
                    userId
                );

                if( userProfileInformation.responseCode !== constants.common.OK ) {
                    
                    throw {
                        status : httpStatusCode.bad_request.status,
                        message : constants.apiResponses.USER_NOT_FOUND
                    }
                }

                let organisationIndex = 
                userProfileInformation.result.response.organisations.findIndex(
                    (organisation) => organisation.organisationId === organisationId
                )

                let result = {
                    isAllowed : false
                };

                if( organisationIndex !== -1 ) {
                    result.isAllowed = true;
                    result["organisationId"] = organisationId;
                }

                return resolve({
                    success : true,
                    message : constants.apiResponses.USER_ALLOWED,
                    data: result
                })
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }

     /**
      * Courses enrolled by users.
      * @method
      * @name enrol
      * @param {String} requestedData 
      * @returns {Object} - message and result. Result is an array consisting of userId and
      * success message.Success can be true or false.  
     */

    static enrol( requestedData,token ) {
        return new Promise(async (resolve, reject) => {
            try {

                let results = [];
                let enrollmentIds = [];

                await Promise.all(requestedData.userIds.map(async function (userId) {

                    let userCourse = 
                    await cassandraDatabase.models.user_courses.findOneAsync(
                        {
                            userid : userId,
                            batchid : requestedData.batchId
                        },{
                            allow_filtering: true
                        }
                    );

                    let obj = {
                        userId : userId,
                        success : false
                    };

                    if( userCourse && userCourse.id ) {
                        obj["success"] = true;
                        enrollmentIds.push(userCourse.id);
                    }

                    results.push(obj);
                }));

                let indexSyncedData = 
                await sunbirdService.indexSync({
                    "params": {},
                    "request": {
                        "objectType": "user_course",
                        "objectIds": enrollmentIds
                    }
                },token
                );

                if( indexSyncedData.responseCode !== constants.common.OK ) {
                    
                    throw {
                        status : httpStatusCode.bad_request.status,
                        message : constants.apiResponses.COULD_NOT_SYNCED_INDEX
                    }
                }

                return resolve({
                    message :  constants.apiResponses.BATCH_ENROLL_FETCHED,
                    result : results
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Create content for platform
      * @method
      * @name createContent
      * @param {String} requestedData
      * @param {String} token 
      * @returns {Object} Return content id. 
     */

    static createContent( requestedData,token ) {
        return new Promise(async (resolve, reject) => {
            try {

                let contentData = {
                    "request" : {
                        "content" : requestedData
                    }
                };

                let createdContentData = 
                await sunbirdService.createContent(
                    contentData,
                    token
                );

                if( createdContentData.responseCode !== constants.common.OK ) {
                    
                    throw {
                        status : httpStatusCode.bad_request.status,
                        message : createdContentData.result.messages[0]
                    }
                }

                return resolve({
                    message :  constants.apiResponses.CREATED_BODH_CONTENT,
                    result : {
                        contentId : createdContentData.result.content_id
                    }
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Upload scrom content for platform
      * @method
      * @name uploadScromContent
      * @param {String} file - required file
      * @param {String} contentId - content id
      * @param {String} token 
      * @returns {Object} - Return content url.  
     */

    static uploadScromContent( file,name,token,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                let saveRequestedZipFile = await filesHelper.saveZipFile(
                    file.name,
                    file.data
                ); 

                if( !saveRequestedZipFile.success ) {
                    throw {
                        status : httpStatusCode.bad_request.status,
                        message : constants.apiResponses.COULD_NOT_SAVE_ZIP_FILE
                    }
                }

                let zipPathName = `${ROOT_PATH}${process.env.ZIP_PATH}`

                let unZipFile = await filesHelper.unzip(
                    `${zipPathName}/${file.name}`,
                    `${zipPathName}`,
                    true
                );

                if( !unZipFile.success ) {
                    return resolve({
                        status : httpStatusCode.bad_request.status,
                        message : constants.apiResponses.COULD_NOT_UNZIP_FOLDER
                    })
                }

                let fileName = file.name.replace('.zip','');

                let renameFile = 
                await filesHelper.rename(
                    `${zipPathName}/${fileName}/story.html`,
                    `${zipPathName}/${fileName}/index.html`
                );

                if( !renameFile.success ) {
                    return resolve({
                        status : httpStatusCode.bad_request.status,
                        message : constants.apiResponses.COULD_NOT_RENAME_FILE
                    })
                }

                let zipFile = 
                await filesHelper.zip(
                    `${zipPathName}/${fileName}`,
                    `${zipPathName}/${file.name}`
                );

                filesHelper.removeFolder(
                    `${zipPathName}/${fileName}`
                );

                if ( !zipFile.success ) {
                    return resolve({
                        status : httpStatusCode.bad_request.status,
                        message : constants.apiResponses.COULD_NOT_ZIP_FOLDER
                    })
                } 

                let contentCreateData = {
                    code : gen.utils.generateUniqueId(),
                    contentType : constants.common.BODH_CONTENT_TYPE,
                    name : name,
                    mimeType : constants.common.BODH_MIME_TYPE,
                    createdBy : userId
                };

                let contentCreationData = await this.createContent(
                    contentCreateData,
                    token
                );

                let contentId = contentCreationData.result.contentId;

                let uploadedContentData = await sunbirdService.uploadContent(
                    `${zipPathName}/${file.name}`,
                    contentId,
                    token,
                    constants.common.FORM_DATA_CONTENT_TYPE,
                    constants.common.BODH_MIME_TYPE
                );

                if( uploadedContentData.responseCode !== constants.common.OK ) {
                    
                    throw {
                        status : httpStatusCode.bad_request.status,
                        
                        message :
                        uploadedContentData.result && 
                        uploadedContentData.result.messages && 
                        uploadedContentData.result.messages[0] ? 
                        uploadedContentData.result.messages[0] : uploadedContentData.responseCode
                    }
                }

                fs.unlinkSync(`${zipPathName}/${file.name}`);

                return resolve({
                    message :  constants.apiResponses.CONTENT_UPLOADED_SUCCESSFULLY,
                    result : {
                        contentId : contentId,
                        contentUrl : uploadedContentData.result.content_url
                    }
                });

            } catch (error) {
                filesHelper.removeFolder(`${ROOT_PATH}${process.env.ZIP_PATH}`)
                return reject(error);
            }
        })
    }

};