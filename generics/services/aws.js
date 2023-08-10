// /**
//  * name : aws.js
//  * author : Aman Jung Karki
//  * created-date : 23-feb-2020
//  * Description : All aws related functionality
//  */

// // Dependencies
// const AWS = require('aws-sdk');
// const AWS_ACCESS_KEY_ID = 
// (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID != "") ? 
// process.env.AWS_ACCESS_KEY_ID : "";

// const AWS_SECRET_ACCESS_KEY = 
// (process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_SECRET_ACCESS_KEY != "") ? 
// process.env.AWS_SECRET_ACCESS_KEY : "";

// const s3 = new AWS.S3({
//   accessKeyId: AWS_ACCESS_KEY_ID,
//   secretAccessKey: AWS_SECRET_ACCESS_KEY,
//   signatureVersion: 'v4',
//   region: process.env.AWS_BUCKET_REGION,
// });

// /**
//   * Upload file in aws cloud.
//   * @function
//   * @name uploadFile
//   * @param file - file to upload.
//   * @param filePath - file path
//   * @returns {Object} - upload file information
// */

// let uploadFile = function( file,filePath,bucketName ) {

//     return new Promise( async(resolve,reject)=>{
      
//             let bucket = bucketName ? bucketName : process.env.DEFAULT_BUCKET_NAME;
//             const uploadParams = {
//                 Bucket: bucket,
//                 Key: filePath,
//                 Body: file
//             };
        
//             s3.upload(uploadParams,function(err,data){
//                 if( err ) {
//                     return reject({
//                         message : "Could not upload file in aws"
//                     });
//                 } else {
//                     let result = {
//                         name : data.key,
//                         bucket : data.Bucket,
//                         location : data.Location
//                     };

//                     return resolve(result);
//                 }
//             })

//     })
// }

// /**
//   * Get downloadable url.
//   * @function
//   * @name getDownloadableUrl
//   * @param filePath - file path
//   * @returns {String} - Get downloadable url link
// */

// let getDownloadableUrl = function( filePath,bucketName ) {

//     return new Promise( async(resolve,reject)=>{

//         try {
//            let bucket = bucketName ? bucketName : process.env.DEFAULT_BUCKET_NAME;
//            let downloadableUrl = 
//            `https://${bucket}.${process.env.AWS_BUCKET_ENDPOINT}/${filePath}`;

//            return resolve(downloadableUrl);
//         } catch(error) {
//             return reject(error);
//         }

//     })
// }

//   /**
//      * Get aws s3 cloud signed url.
//      * @method
//      * @name getS3SignedUrl
//      * @param {String} fileName - fileName.
//      * @param {String} bucketName - name of the bucket.  
//      * @returns {Object} - signed url and s3 file name. 
//      */

// let signedUrl = ( fileName ,bucketName ) =>{
//     return new Promise(async (resolve, reject) => {
//         try {
            
//             if( fileName == "" ) {
//                 throw new Error(httpStatusCode.bad_request.status);
//             }

//             let noOfMinutes = constants.common.NO_OF_MINUTES;
//             let expiry = constants.common.NO_OF_EXPIRY_TIME * noOfMinutes;

//             try {
                
//                 const url = await s3.getSignedUrl('putObject', {
//                     Bucket : bucketName,
//                     Key : fileName,
//                     Expires : expiry
//                 });
                
//                 let result = {
//                     success : true,
//                     url : url
//                 };

//                 if(url && url != "") {

//                     result["name"] = fileName;

//                 } else {

//                     result["success"] = false;

//                 }

//                 return resolve(result);

//             } catch (error) {
//                 return resolve({
//                     success : false,
//                     message : error.message,
//                     response : error
//                 });
//             }
                

//             } catch (error) {
//                 return reject(error);
//             }
//         })
// }


// module.exports = {
//   s3: s3,
//   uploadFile : uploadFile,
//   getDownloadableUrl : getDownloadableUrl,
//   signedUrl : signedUrl
// };