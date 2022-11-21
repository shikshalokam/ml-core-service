/**
 * name : oracle-cloud.js
 * author : vishnu
 * created-date : 10-Nov-2022
 * Description : All oracle-cloud related functionality
 */

// Dependencies
const AWS = require('aws-sdk');
const OCI_ACCESS_KEY_ID = 
(process.env.OCI_ACCESS_KEY_ID && process.env.OCI_ACCESS_KEY_ID != "") ? 
process.env.OCI_ACCESS_KEY_ID : "";

const OCI_SECRET_ACCESS_KEY = 
(process.env.OCI_SECRET_ACCESS_KEY && process.env.OCI_SECRET_ACCESS_KEY != "") ? 
process.env.OCI_SECRET_ACCESS_KEY : "";

AWS.config.update({
    accessKeyId : OCI_ACCESS_KEY_ID,
    secretAccessKey : OCI_SECRET_ACCESS_KEY,
    region : process.env.OCI_BUCKET_REGION,
    endpoint : process.env.OCI_BUCKET_ENDPOINT,
    s3ForcePathStyle : true,
    signatureVersion : 'v4'
});

const s3 = new AWS.S3();

/**
  * Upload file in oracle cloud.
  * @function
  * @name uploadFile
  * @param file - file to upload.
  * @param filePath - file path
  * @returns {Object} - upload file information
*/

let uploadFile = function( file,filePath,bucketName ) {

    return new Promise( async(resolve,reject)=>{
      
            let bucket = bucketName ? bucketName : process.env.DEFAULT_BUCKET_NAME;
            const uploadParams = {
                Bucket: bucket,
                Key: filePath,
                Body: file
            };
        
            s3.upload(uploadParams,function(err,data){
                if( err ) {
                    return reject({
                        message : "Could not upload file in oracle"
                    });
                } else {
                    let result = {
                        name : data.key,
                        bucket : data.Bucket,
                        location : data.Location
                    };

                    return resolve(result);
                }
            })

    })
}

/**
  * Get downloadable url.
  * @function
  * @name getDownloadableUrl
  * @param filePath - file path
  * @returns {String} - Get downloadable url link
*/

let getDownloadableUrl = function( filePath,bucketName ) {

    return new Promise( async(resolve,reject)=>{

        try {
            let bucket = bucketName ? bucketName : process.env.DEFAULT_BUCKET_NAME;
            let downloadableUrl = 
            `${process.env.OCI_BUCKET_ENDPOINT}/${bucket}/${filePath}`;
            return resolve(downloadableUrl);
        } catch(error) {
            return reject(error);
        }

    })
}

  /**
     * Get oracle s3 cloud signed url.
     * @method
     * @name getS3SignedUrl
     * @param {String} fileName - fileName.
     * @param {String} bucketName - name of the bucket.  
     * @returns {Object} - signed url and s3 file name. 
     */

let signedUrl = ( fileName ,bucketName ) =>{
    return new Promise(async (resolve, reject) => {
        try {
            
            if( fileName == "" ) {
                throw new Error(httpStatusCode.bad_request.status);
            }

            let noOfMinutes = constants.common.NO_OF_MINUTES;
            let expiry = constants.common.NO_OF_EXPIRY_TIME * noOfMinutes;

            try {
                
                const url = await s3.getSignedUrl('putObject', {
                    Bucket : bucketName,
                    Key : fileName,
                    Expires : expiry
                });
                
                let result = {
                    success : true,
                    url : url
                };

                if(url && url != "") {

                    result["name"] = fileName;

                } else {

                    result["success"] = false;

                }

                return resolve(result);

            } catch (error) {
                return resolve({
                    success : false,
                    message : error.message,
                    response : error
                });
            }
                

            } catch (error) {
                return reject(error);
            }
        })
}


module.exports = {
  s3: s3,
  uploadFile : uploadFile,
  getDownloadableUrl : getDownloadableUrl,
  signedUrl : signedUrl
};