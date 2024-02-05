const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { BlobServiceClient } = require("@azure/storage-blob");
const apiResponses = require("../../generics/constants/api-responses");
const azureConnection = `DefaultEndpointsProtocol=https;AccountName=${process.env.CLOUD_STORAGE_ACCOUNTNAME};AccountKey=${process.env.CLOUD_STORAGE_SECRET};EndpointSuffix=core.windows.net`;

module.exports = class fileUploadHelper {
  static uploadFiles(req) {
    return new Promise(async (resolve, reject) => {
      // Apply the upload.single middleware to handle file uploads
      upload.single("file")(req, null, async (err) => {
        if (err) {
          // Handle multer error, if any
          return reject({
            status: httpStatusCode.bad_request.status,
            errorObject: err,
          });
        }
       
        try {

          // Upload the file to Azure Blob Storage
          const blobServiceClient = BlobServiceClient.fromConnectionString(
            azureConnection
          );
          const containerClient = blobServiceClient.getContainerClient(
            process.env.CLOUD_STORAGE_BUCKETNAME
          );

          const blobName = `uploadedFile/${req.files.file.name}`;

          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          const data = Buffer.from(req.files.file.data);

          const uploadResponse = await blockBlobClient.upload(
            data,
            data.length
          );

          let uploadedData = {
            azureURL: blockBlobClient.url,
            uploadRes: uploadResponse,
          };

          return resolve({
            message: apiResponses.FILE_UPLOADED,
            result: uploadedData,
          });
        } catch (error) {
          return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message:
              error.message || httpStatusCode.internal_server_error.message,
            errorObject: error,
          });
        }
      });
    });
  }
};
