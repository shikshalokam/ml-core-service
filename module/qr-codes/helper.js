/**
 * name : qr-code/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All qrCode related information.
 */

// Dependencies

let qrGeneratorService = require(ROOT_PATH+"/generics/services/qr-generator");
let gotenbergService = require(ROOT_PATH+"/generics/services/gotenberg");
const ejs = require('ejs');
let fs = require("fs");
let filesHelper = require(ROOT_PATH+"/module/files/helper");
let sunbirdService = require(ROOT_PATH+"/generics/services/sunbird");
let BUCKET_NAME = process.env.QR_CODE_BUCKET_NAME;

/**
    * QrCodeHelper
    * @class
*/
module.exports = class QrCodeHelper {

     /**
      * Get qr document.
      * @method
      * @name list
      * @param {Object} filterQueryObject - filter query data.
      * @param {Object} [projection = {}] - projected data.
      * @returns {Promise} returns a promise.
     */

    static list( filterQueryObject = "all", projection = "all" ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let queryObject = {};
                
                if (filterQueryObject != "all") {
                    queryObject = filterQueryObject;
                }
                
                let projectionObject = {};
                
                if (projection != "all") {
                    projection.forEach(element => {
                        projectionObject[element] = 1;
                    });
                }

                let qrCodeData = 
                await database.models.qrCodes.find(
                    queryObject,
                    projectionObject
                ).lean();

                return resolve(qrCodeData);

            } catch (error) {
                return reject(error);
            }
        })


    }
    
    /**
     * Generate qr code.
     * @method
     * @name generate
     * @param  {codeData}  - Code data to generate qr code.
     * @param  {userId}  - Logged in user id.
     * @returns {json} Response consists of Array of generated qr code information.
    */

    static generate( codeData,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                if( !codeData ) {
                    throw {
                        message : 
                        constants.apiResponses.QR_CODE_DATA_NOT_FOUND
                    }; 
                }
                    
                let qrCodeDocument = await this.list({
                    code : codeData.code,
                    status : "active"
                },["_id"]);
                
                let qrCodeCreationData = {...codeData};
                
                if( qrCodeDocument && qrCodeDocument.length > 0 ) {
                    qrCodeCreationData["_id"] = 
                    constants.apiResponses.QR_CODE_EXISTS;
                } else {
                    
                    qrCodeCreationData["createdBy"] = userId;
                    
                    await qrGeneratorService.createQrCode(
                        codeData.code
                    );
                    
                    let data = {    
                        head : codeData.head,
                        code : codeData.code,
                        qrCodeImage : "image.png"
                    }
                    
                    await this.createHtmlFromEjs(
                        [ data ],
                        codeData.code
                    );
                    
                    let gotenbergFormData = 
                    [
                        {
                            value :
                            fs.createReadStream(`${ROOT_PATH}${process.env.QR_CODE_PATH}/${codeData.code}/index.html`),
                            options : {filename: '/index.html'}
                        },{
                            value : 
                            fs.createReadStream(`${ROOT_PATH}${process.env.QR_CODE_PATH}/${codeData.code}/image.png`),
                            options : { filename : '/image.png'
                        }
                    }];
                    
                    let pdfPath = 
                    `${ROOT_PATH}${process.env.QR_CODE_PATH}/${codeData.code}/qrCode.pdf`;
                    
                    await gotenbergService.generatePdf( gotenbergFormData, pdfPath );

                    
                    let uploadFile = await this.upload( codeData.code );
                    
                    qrCodeCreationData["image"] = uploadFile.image;
                    qrCodeCreationData["pdf"] = uploadFile.pdf;
                    
                    let createQrCode = 
                    await database.models.qrCodes.create(
                        qrCodeCreationData
                    );
                    
                    if( !createQrCode ) {
                        throw {
                            message : "Something went wrong"
                        }
                    }
                    qrCodeCreationData["_id"] = createQrCode._id;
            }

            let imageDownloadLink = 
            await filesHelper.getDownloadableUrl(
                qrCodeCreationData.image,
                BUCKET_NAME
            );

            let pdfDownloadLink = 
            await filesHelper.getDownloadableUrl(
                qrCodeCreationData.pdf,
                BUCKET_NAME
            );
            
            return resolve({
                code : qrCodeCreationData.code,
                pdf : pdfDownloadLink,
                image : imageDownloadLink,
                metaInformation : qrCodeCreationData.metaInformation
            });

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
     * Generate qr code.
     * @method
     * @name image
     * @param  {code}  - Unique dial code.
     * @returns {Object} Qr code image url.
    */

    static image( code ) {
        return new Promise(async (resolve, reject) => {
           try {
               
            let qrCodeImage = await this.list({
                code : code,
                status : "active"
            },["image","metaInformation"]);
            
            if( !qrCodeImage[0] ) {
                throw {
                  message : constants.apiResponses.QR_CODE_NOT_FOUND
                }
            };

            let imageDownloadLink = 
            await filesHelper.getDownloadableUrl(
                qrCodeImage[0].image,
                BUCKET_NAME
            );

            return resolve({
                message : constants.apiResponses.QR_CODE_FETCHED,
                result : {
                  url : imageDownloadLink,
                  metaInformation : qrCodeImage[0].metaInformation
                }
            });

           } catch (error) {
               return reject(error);
            }
        })
    }

    /**
     * Generate qr code.
     * @method
     * @name generateCodes
     * @param  {lengthOfCodes}  - Count of dial code to generate.
     * @param  {userToken}  - logged in user token
     * @returns { Array } - unique codes generated data. 
    */

    static generateCodes( lengthOfCodes , userToken ) {
        return new Promise(async (resolve, reject) => {
            try { 

                let generateDialCode = await sunbirdService.generateCodes(
                    {
                        "request" : {
                            "dialcodes" : { 
                                "count" : lengthOfCodes,
                                "publisher" : process.env.SHIKSHALOKAM_PUBLISHER
                            }
                        }
                    },
                    userToken
                );

                if( generateDialCode.responseCode !== constants.common.OK ) {
                    throw {
                        message : constants.apiResponses.DIAL_CODE_NOT_GENERATED
                    }
                }

                return resolve(generateDialCode.result.dialcodes);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
     * Publish code.
     * @method
     * @name publishCode
     * @param  { code }  - Dial code generated.
     * @param  { userToken }  - Logged in user token
     * @returns { String } - Publish code status. 
    */

    static publishCode( code,userToken ) {
        return new Promise(async (resolve, reject) => {
            try { 

                let publishCodeData = await sunbirdService.publishCode(
                    code,
                    userToken,
                    {
                        "request" : {}
                    }
                );

                if( publishCodeData.responseCode !== constants.common.OK ) {
                    throw {
                        message : constants.apiResponses.COULD_NOT_PUBLISH_DIAL_CODE
                    }
                }

                let codeStatus = await sunbirdService.codeStatus(
                    userToken,
                    {
                        "request" : {
                            "dialcode" : {
                                "identifier" : code
                            }
                        }
                    }
                );

                if(
                    codeStatus.responseCode !== constants.common.OK &&
                    codeStatus.result.dialcode.status !== constants.common.BODH_DIAL_CODE_LIVE_STATUS
                ) {
                    throw {
                        message : 
                        constants.apiResponses.DIAL_CODE_NOT_PUBLISHED
                    }
                }

                return resolve(codeStatus.result.dialcode.status);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Create html from ejs.
      * @method
      * @name createHtmlFromEjs
      * @param  {data}  - Data to be sent to ejs.
      * @param  {code}  - unique code data.
      * @return {Promise}
    */

    static createHtmlFromEjs( data,code ) {
        return new Promise(async (resolve, reject) => {
            try {

                let qrCodePath = 
                `${ROOT_PATH}${process.env.QR_CODE_PATH}`;
                
                let pathToEjsFile = ROOT_PATH+"/template/qr-code/index.ejs";

                let ejsData =  await ejs.renderFile(pathToEjsFile,{
                    data : data
                })
                
                fs.appendFile(`${qrCodePath}/${code}/index.html`,ejsData,async function(err){
                    if(err) {
                        throw {
                            message : "Html could not be created for the given ejs"
                        };
                    } else {
                        return resolve({})
                    }
                })


            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Upload images and file in cloud services.
      * @method
      * @name upload
      * @param  {code}  - Code data.
      * @returns {Promise}
    */
   
    static upload( code ) {
        return new Promise(async (resolve, reject) => {
            try {

                let pathToCodeFolder = 
                `${ROOT_PATH}${process.env.QR_CODE_PATH}/${code}`;
                let urlPrefix = "";

                if(
                    process.env.URL_PREFIX_FOR_STORAGE && 
                    process.env.URL_PREFIX_FOR_STORAGE !== ""
                ) {
                    urlPrefix = `${process.env.URL_PREFIX_FOR_STORAGE}/${code}`;
                } else {
                    urlPrefix = `${code}`
                }
                
                let imageFile;
                let pdfFile;

                if( process.env.CLOUD_STORAGE === "AWS" ) {
                    imageFile = fs.createReadStream(`${pathToCodeFolder}/image.png`);
                    pdfFile = fs.createReadStream(`${pathToCodeFolder}/qrCode.pdf`);
                } else {
                    imageFile = `${pathToCodeFolder}/image.png`;
                    pdfFile = `${pathToCodeFolder}/qrCode.pdf`;
                }

                let uploadedImageUrl = 
                await filesHelper.upload( 
                    imageFile, 
                    `${urlPrefix}/${code}.png`,
                    BUCKET_NAME
                );
                 
                 let uploadPdfUrl = 
                 await filesHelper.upload( 
                     pdfFile, 
                     `${urlPrefix}/${code}.pdf`,
                     BUCKET_NAME
                );
                 
                 fs.readdirSync(pathToCodeFolder)
                 .forEach(function(file,index){
                     let filePath = pathToCodeFolder+"/"+file;
                     fs.unlinkSync(filePath);
                 });
                 
                 fs.rmdirSync(pathToCodeFolder);
                 
                 return resolve({
                     image : uploadedImageUrl.name,
                     pdf : uploadPdfUrl.name
                 })

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Get all the pdfs urls.
      * @method
      * @name pdfs
      * @param  {codes}  - Codes array data.
      * @returns {Array} Response consists of pdf urls.
    */

    static pdfs( codes ) {
        return new Promise(async (resolve, reject) => {
            
            try {

                if( codes.length < 1) {
                    throw {
                        message : constants.apiResponses.QR_CODE_DATA_SIZE
                    };
                }

                let pdfData = await this.list({
                    code : { $in : codes },
                    status : "active"
                },["pdf","code","metaInformation"]); 

                if( pdfData.length < 1 ) {
                    throw { 
                        message : constants.apiResponses.QR_CODE_NOT_FOUND
                    }
                }

                let result = [];

                for(let pointerToPdfData = 0;
                    pointerToPdfData < pdfData.length;
                    pointerToPdfData++
                ) {
                    let pdfDownloadableLink = await filesHelper.getDownloadableUrl(
                        pdfData[pointerToPdfData].pdf,
                        BUCKET_NAME
                    );

                    result.push({
                        url : pdfDownloadableLink,
                        code : pdfData[pointerToPdfData].code,
                        metaInformation : pdfData[pointerToPdfData].metaInformation
                    });
                }

                return resolve({
                    message : constants.apiResponses.QR_CODE_FETCHED,
                    result : result
                });
            
            } catch (error) {
                return reject(error);
            }
        })
    }
    
};