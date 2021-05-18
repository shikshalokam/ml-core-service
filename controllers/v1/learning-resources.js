/**
 * name : learning-resources.js
 * author : Rakesh Kumar
 * created-date : 02-Nov-2020
 * Description : Related to learning resources
 */

const learningResourceshelper = require(MODULES_BASE_PATH + "/learning-resources/helper.js");

/**
   * LearningResources
   * @class
*/
module.exports = class LearningResources {

    static get name() {
        return "learning-resources";
    }


    /**
* @apiDefine errorBody
* @apiError {String} status 4XX,5XX
* @apiError {String} message Error
*/
    /**
      * @apiDefine successBody
      * @apiSuccess {String} status 200
      * @apiSuccess {String} result Data
   */

    /**
    * @api {post} /kendra/api/v1/learning-resources/list
    * To get learning resources
    * @apiVersion 1.0.0
    * @apiGroup Learning Resources
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/learning-resources/list?limit=3&page=1
    * @apiParamExample {json} Request:
    * {
    *    "filters": {
    *     "category": ["SLDEV"],
    *     "subcategory": ["Class 1"],
    *     "topic": ["Science"],
    *     "language": ["kannada","English"] 
    *    }
    * }
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
   {
      "message": "Learning resources found successfully.",
      "status": 200,
      "result": {
          "count": 19,
          "content": [
              {
                  "ownershipType": [
                      "createdBy"
                  ],
                  "copyright": "SLDEV",
                  "previewUrl": "https://dev.bodh.shikshalokam.org/resources/play/content/do_113059727462957056137",
                  "keywords": [
                      "Copy Feature"
                  ],
                  "plugins": [
                      {
                          "identifier": "org.ekstep.questionunit.mtf",
                          "semanticVersion": "1.2"
                      }
                  ],
                  "channel": "01305447637218918413",
                  "questions": [
                      "do_11305831684202496011",
                      "do_11305967213246054413",
                      "do_11305968613014732814",
                      "do_11305967010460467212"
                  ],
                  "downloadUrl": "https://sldevsunbird.blob.core.windows.net/sl-dev-assets/ecar_files/do_113059727462957056137/copy-feature_1594207213185_do_113059727462957056137_1.0.ecar",
                  "organisation": [
                      "SLDEV"
                  ],
                  "language": [
                      "English"
                  ],
                  "mimeType": "application/vnd.ekstep.ecml-archive",
                  "variants": {
                      "spine": {
                          "ecarUrl": "https://sldevsunbird.blob.core.windows.net/sl-dev-assets/ecar_files/do_113059727462957056137/copy-feature_1594207213996_do_113059727462957056137_1.0_spine.ecar",
                          "size": 179707
                      }
                  },
                  "editorState": "{\"plugin\":{\"noOfExtPlugins\":12,\"extPlugins\":[{\"plugin\":\"org.ekstep.contenteditorfunctions\",\"version\":\"1.2\"},{\"plugin\":\"org.ekstep.keyboardshortcuts\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.richtext\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.iterator\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.navigation\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.reviewercomments\",\"version\":\"1.0\"},{\"plugin\":\"org.ekstep.questionunit.mtf\",\"version\":\"1.2\"},{\"plugin\":\"org.ekstep.questionunit.mcq\",\"version\":\"1.3\"},{\"plugin\":\"org.ekstep.keyboard\",\"version\":\"1.1\"},{\"plugin\":\"org.ekstep.questionunit.reorder\",\"version\":\"1.1\"},{\"plugin\":\"org.ekstep.questionunit.sequence\",\"version\":\"1.1\"},{\"plugin\":\"org.ekstep.questionunit.ftb\",\"version\":\"1.1\"}]},\"stage\":{\"noOfStages\":2,\"currentStage\":\"2117886e-e529-4255-92db-c9e9ab466d61\",\"selectedPluginObject\":\"ab5eb56a-8aab-4be0-b52a-44a25c37c9d9\"},\"sidebar\":{\"selectedMenu\":\"settings\"}}",
                  "objectType": "Content",
                  "appIcon": "https://sldevsunbird.blob.core.windows.net/sl-dev-assets/content/do_113059728955416576140/artifact/whatsapp-image-2020-05-27-at-4.35.44-pm.jpeg",
                  "assets": [],
                  "collections": [
                      "do_113059753728966656142",
                      "do_113059795214434304147",
                      "do_113059801117532160149"
                  ],
                  "appId": "dev.dev.portal",
                  "contentEncoding": "gzip",
                  "artifactUrl": "https://sldevsunbird.blob.core.windows.net/sl-dev-assets/content/do_113059727462957056137/artifact/1594207212326_do_113059727462957056137.zip",
                  "lockKey": "1555968e-24dc-4d9c-8274-91ff8afb216d",
                  "contentType": "Resource",
                  "lastUpdatedBy": "342cba87-e68c-4b6c-9abc-9ee40eecc37f",
                  "identifier": "do_113059727462957056137",
                  "audience": [
                      "Learner"
                  ],
                  "visibility": "Default",
                  "consumerId": "1546ae3f-84a7-45d7-8d88-ccbbf9d37e3e",
                  "mediaType": "content",
                  "osId": "org.ekstep.quiz.app",
                  "languageCode": [
                      "en"
                  ],
                  "graph_id": "domain",
                  "nodeType": "DATA_NODE",
                  "lastPublishedBy": "246266a9-4bae-4bfd-93cf-7d5d249f3de2",
                  "version": 2,
                  "pragma": [],
                  "license": "CC BY 4.0",
                  "prevState": "Review",
                  "size": 931492,
                  "lastPublishedOn": "2020-07-08T11:20:13.179+0000",
                  "IL_FUNC_OBJECT_TYPE": "Content",
                  "name": "Copy Feature",
                  "attributions": [
                      "CC-BY"
                  ],
                  "status": "Live",
                  "totalQuestions": 4,
                  "code": "org.sunbird.dk6uQW.copy",
                  "prevStatus": "Processing",
                  "origin": "do_11305831369286451217",
                  "description": "First quiz",
                  "medium": "English",
                  "streamingUrl": "https://sldevsunbird.blob.core.windows.net/sl-dev-assets/content/ecml/do_113059727462957056137-latest",
                  "idealScreenSize": "normal",
                  "createdOn": "2020-07-08T10:43:32.598+0000",
                  "contentDisposition": "inline",
                  "lastUpdatedOn": "2020-07-08T11:19:54.959+0000",
                  "originData": "{\"name\":\"First quiz\",\"copyType\":\"deep\",\"license\":\"CC BY 4.0\",\"organisation\":[\"SLDEV\"]}",
                  "SYS_INTERNAL_LAST_UPDATED_ON": "2020-07-08T11:20:20.738+0000",
                  "dialcodeRequired": "No",
                  "lastStatusChangedOn": "2020-07-08T11:20:20.730+0000",
                  "createdFor": [
                      "01305447637218918413"
                  ],
                  "creator": "SL Reviewer Y",
                  "IL_SYS_NODE_TYPE": "DATA_NODE",
                  "os": [
                      "All"
                  ],
                  "totalScore": 7,
                  "pkgVersion": 1,
                  "versionKey": "1594207194959",
                  "idealScreenDensity": "hdpi",
                  "framework": "SLDEV",
                  "s3Key": "ecar_files/do_113059727462957056137/copy-feature_1594207213185_do_113059727462957056137_1.0.ecar",
                  "lastSubmittedOn": "2020-07-08T10:47:10.418+0000",
                  "createdBy": "342cba87-e68c-4b6c-9abc-9ee40eecc37f",
                  "compatibilityLevel": 2,
                  "IL_UNIQUE_ID": "do_113059727462957056137",
                  "resourceType": "Learn",
                  "node_id": 228
              }
          ]
      }
  }
    **/

    /**
     * To get list of resources
     * @method
     * @name list
     * @param  {req}  - requested data.
     * @returns {json} Response consists list of learning resource
    */

    list(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let response = await learningResourceshelper.list(
                    req.userDetails.userToken,
                    req.pageSize,
                    req.pageNo,
                    req.body.filters ? req.body.filters : {},
                    req.query.sortBy ? req.query.sortBy : "",
                    req.searchText ? req.searchText : ""
                );

                return resolve({ result: response.data, message: response.message });

            } catch (error) {

                return reject({
                    status: error.status || httpStatusCode.internal_server_error.status,
                    message: error.message || httpStatusCode.internal_server_error.message,
                    errorObject: error
                });

            }
        });
    }

    /**
  * @api {get} /kendra/api/v1/learning-resources/filters
  * To get learning resources filters
  * @apiVersion 1.0.0
  * @apiGroup Learning Resources
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/learning-resources/filters
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  {
    "message": "Learning resource form fetched successfully.",
    "status": 200,
    "result": [
        {
            "name": "All",
            "icon": "documents-outline",
            "value": []
        },
        {
            "name": "Collections",
            "icon": "documents-outline",
            "value": [
                "application/vnd.ekstep.content-collection"
            ]
        },
        {
            "name": "Documents",
            "icon": "document-text-outline",
            "value": [
                "application/pdf",
                "application/epub"
            ]
        },
        {
            "name": "video",
            "icon": "play-circle-outline",
            "value": [
                "video/mp4",
                "video/x-youtube",
                "video/webm"
            ]
        },
        {
            "name": "interactive",
            "icon": "play-circle-outline",
            "value": [
                "application/vnd.ekstep.ecml-archive",
                "application/vnd.ekstep.h5p-archive",
                "application/vnd.ekstep.html-archive"
            ]
        }
    ]
}
    /**
   * To get learning resources filters
   * @method
   * @name filters
   * @param  {req}  - requested data.
   * @returns {json} Response consists of learning resource filters
  */

    filters(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let response = await learningResourceshelper.filters();

                return resolve({ result: response.data, message: response.message });

            } catch (error) {

                return reject({
                    status: error.status || httpStatusCode.internal_server_error.status,
                    message: error.message || httpStatusCode.internal_server_error.message,
                    errorObject: error
                });

            }
        });
    }



}