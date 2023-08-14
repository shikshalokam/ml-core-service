/**
 * name             : cloud-services/storage/validator/v1.js
 * author           : Vishnu
 * created-date     : 10-Aug-2023
 * Description      : Storage validator.
 */

module.exports = (req) => {

    let filesValidator = {
        
        actions: function () {
            // Check if the action is provided and valid
            req.checkBody('action')
                .exists().withMessage("action is required")
                .isIn(['signedUrl', 'downloadableUrl']).withMessage("Invalid value for action");
        
            const validOperations = {
                signedUrl: ['read', 'write'],
                downloadableUrl: []
            };
        
            // Check if the request body contains the 'request' field
            req.checkBody('request').exists().withMessage("request data is required");
        
            const { action } = req.body;
        
            if (action === 'signedUrl') {
                // Check if the folderPath is provided for signedUrl
                req.checkBody('folderPath').notEmpty().withMessage("required folderPath");
                // Check if the operation is valid for signedUrl
                req.checkBody('operation')
                    .notEmpty().withMessage("required operation")
                    .isIn(validOperations[action]).withMessage(`Invalid value for operation. Allowed values: ${validOperations[action].join('/')}`);
            }
        
            // Check if the bucketName is provided and not empty
            req.checkBody('bucketName').notEmpty().withMessage("required bucket name");
        }

        
    }

    if (filesValidator[req.params.method]) {
        filesValidator[req.params.method]();
    }

};
