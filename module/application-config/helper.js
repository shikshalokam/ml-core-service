/**
 * name : appication-config/helper.js
 * author : Rakesh Kumar
 * created-date : 12-Dec-2019
 * Description : All application related helper functions.
 */


/**
 * load modules.
 */


const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications");
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const csv = require("csvtojson");
const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search");
const existingLanguages = require(ROOT_PATH + "/generics/helpers/languages.json");

const DEFAULT_LANGUAGE_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("SAMIKSHA_LANGUAGE_INDEX");

const DEFAULT_LANGUGAE_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("SAMIKSHA_LANGUAGE_TYPE");

const UNNATI_LANGUAGE_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("UNNATI_LANGUAGE_INDEX");

const UNNATI_LANGUAGE_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("UNNATI_LANGUAGE_TYPE");



const upload_type = 
gen.utils.checkIfEnvDataExistsOrNot("APPLICATION_CONFIG_UPLOAD_TYPE");
/**
    * appicationConfigHelper
    * @class
*/

module.exports = class appicationConfigHelper {


    /**
      * upload all the application configaration.
      * @method
      * @name uploadConfigurations
      * @param {Object[]} files consists array of languages to upload. 
      * @returns {Promise} returns a promise.
     */

    static uploadConfigurations(req) {
        return new Promise(async function(resolve, reject) {
            try {

                let configData = await csv().fromString(req.files.configFile.data.toString());
                let type = req.query['config-type'];
                let uploadType = upload_type;

              
                // console.log("req.headers",req.headers.uploadType);
                if(req.headers.uploadType){
                    uploadType = req.headers.uploadType;
                }
                    await Promise.all(configData.map( async function(ele,index){
                    
                        let keys = Object.keys(ele);
                        if(keys.includes('key') && keys.includes('value') && keys.includes('isActive')){
                            ele.id= ele.value;

                            if(ele.is_active) {
                                ele.is_active = ( ele.is_active == 'true' || ele.is_active == 'TRUE' );
                            }else{
                                ele.is_active =true;
                            }
                            
                            ele.created_at = Date.now();

                            ele.updateType = uploadType;

                            await kafkaCommunication.pushApplicationConfigToKafka(ele);

                        }else{
                            reject({
                                error:constants.common.FAILED,
                                message:"Invalid csv please check the headers"
                            })
                        }
                    }));
                return resolve(configData)
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * List all application Configrations.
      * @method
      * @name listConfigurations
      * @returns {Promise} returns a promise.
     */


    static listConfigurations() {

        return new Promise(async (resolve, reject) => {
            try {
                let document = 
                await elasticSearchHelper.getAllApplicationConfig()

               let group = document.reduce((p,c) => (p[c.type] ? p[c.type].push(c) : p[c.type] = [c],p) ,{}),
                newData = Object.keys(group).map(k => ({info: k, obj: group[k]}));

                return resolve({
                    message: `config list fetched successfully`,
                    result: group
                })

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * upload all the languages.
      * @method
      * @name upload
      * @param {Object[]} files consists array of languages to upload. 
      * @returns {Promise} returns a promise.
     */

    static uploadLanguages(files,appname = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let languageData = await csv()
                .fromString(files.language.data.toString());

                let languages = {};

                for (let pointerToLanguage = 0; 
                    pointerToLanguage < languageData.length; 
                    pointerToLanguage++) 
                    {
                        let splitKeyDataToArray = 
                        languageData[pointerToLanguage].key.split("_");

                        Object.keys(languageData[pointerToLanguage])
                        .forEach(eachLanguage => {

                            if (eachLanguage !== "key") {

                                if (!languages[eachLanguage]) {
                                    languages[eachLanguage] = {};
                                    languages[eachLanguage]["id"] = eachLanguage;
                                    languages[eachLanguage]["action"] = "language"
                                }

                                if (!languages[eachLanguage][splitKeyDataToArray[0]]) {
                                    languages[eachLanguage][splitKeyDataToArray[0]] = {};
                                }

                                languages[eachLanguage][splitKeyDataToArray[0]][splitKeyDataToArray[1]] = 
                                languageData[pointerToLanguage][eachLanguage];

                            }
                        })
                    }

                let allSetOfLanguages = Object.values(languages)

                let responseData = [];

                for (let pointerToAllSetOfLanguage = 0; 
                    pointerToAllSetOfLanguage < allSetOfLanguages.length; 
                    pointerToAllSetOfLanguage++) {

                    let pushLanguagesToKafka = 
                    await kafkaCommunication.pushLanguagesToKafka(
                        _.merge(allSetOfLanguages[pointerToAllSetOfLanguage],
                            {
                                appname:appname
                            })
                    );

                    let result = {};

                    result["language"] = allSetOfLanguages[pointerToAllSetOfLanguage].id;

                    if (pushLanguagesToKafka) {
                        if (pushLanguagesToKafka.status != "success") {

                            let errorObject = {
                                slackErrorName: 
                                gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),

                                color: 
                                gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR"),
                                message: `Fail to upload languages`
                              };

                            result["message"] = "Fail to upload";
                            slackClient.sendMessageToSlack(errorObject)
                            return;
                        } else {
                            result["message"] = "Successfully Uploaded"
                        }
                    } else {
                        result["message"] = "kafka topic created and languages is uploaded"
                    }

                    responseData.push(result)
                }


                return resolve(responseData)


            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * List language details.
      * @method
      * @name list
      * @param {String} languageId Specific language id. 
      * @returns {Promise} returns a promise.
     */

    static listLanguage(languageId,appname) {
        return new Promise(async (resolve, reject) => {
            try {

                let languageInfo = {
                    id: languageId,
                    index: DEFAULT_LANGUAGE_INDEX,
                    type: DEFAULT_LANGUGAE_TYPE
                }

                if(appname === "unnati") {
                    languageInfo["index"] = UNNATI_LANGUAGE_INDEX;
                    languageInfo["type"] = UNNATI_LANGUAGE_TYPE;
                }
                

                let getLanguageDocument = 
                await elasticSearchHelper.getData(languageInfo);

                let data = {};

                if (getLanguageDocument.statusCode === httpStatusCode.ok.status) {
                    data = getLanguageDocument.body._source.translate
                }

                return resolve({
                    message: `${languageId} language data fetched successfully`,
                    data: data
                })

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * List all languages.
      * @method
      * @name list
      * @param {String} appname name of the app. 
      * @returns {Promise} returns a promise.
     */

    static listAllLanguages(appname) {
        return new Promise(async (resolve, reject) => {
            try {

                let getLanguageDocument = 
                await elasticSearchHelper.getAllLanguagesData(appname)

                let data = [];

                if(getLanguageDocument.length>0) {
                    
                    for (let pointerToLanguage = 0; 
                        pointerToLanguage < getLanguageDocument.length; 
                        pointerToLanguage++) {
    
                            let languageId = getLanguageDocument[pointerToLanguage].id;
                            if (existingLanguages[languageId] !== undefined) {
                                data.push({
                                    id: languageId,
                                    name: existingLanguages[languageId]
                                })
                            }
                    }
                }

                return resolve({
                    message: `Languages lists fetched successfully`,
                    result: data
                })

            } catch (error) {
                return reject(error);
            }
        })
    }

}