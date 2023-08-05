/**
 * name : cloud-services/files/validator/v1.js
 * author : Aman
 * created-date : 07-Apr-2021
 * Description : Files validator.
 */

module.exports = (req) => {

    let filesValidator = {
        preSignedUrls : function() {
            req.checkBody('request').exists().withMessage("request data is required");
            req.checkBody('ref').exists().withMessage("required reference type");
        },
        customBucketUrls : function() {
            // Check if the urlType query parameter is not provided or not one of the allowed values
            req.checkQuery('urlType')
            .exists().withMessage("urlType is required")
            .isIn(['presignedUrl', 'downloadableUrl']).withMessage("Invalid value for urlType");

            // Check if the request body contains the 'request' field
            req.checkBody('request').exists().withMessage("request data is required");

            // If the urlType is 'presignedUrl', check if the request body contains the 'ref' field
            if (req.query.urlType === 'presignedUrl') {
                req.checkBody('folderPath').notEmpty().withMessage("required folderPath");
            }

            // Check if the request body contains the 'bucketName' field and it is not an empty string
            req.checkBody('bucketName').notEmpty().withMessage("required bucket name");
        }
    }

    if (filesValidator[req.params.method]) {
        filesValidator[req.params.method]();
    }

};