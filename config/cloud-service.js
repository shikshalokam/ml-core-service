const cloudService  = require('client-cloud-services');

let cloudConfig = {
    provider: process.env.SUNBIRD_CLOUD_STORAGE_PROVIDER,
    identity: process.env.CLOUD_PRIVATE_STORAGE_ACCOUNTNAME,
    credential: process.env.CLOUD_PRIVATE_STORAGE_SECRET,
    reportsContainer: process.env.CLOUD_STORAGE_PRIVATEREPORTS_BUCKETNAME,
    labelsContainer: process.env.CLOUD_STORAGE_RESOURCEBUNDLE_BUCKETNAME,
    region: process.env.CLOUD_PRIVATE_STORAGE_REGION || null,
    projectId: process.env.CLOUD_PRIVATE_STORAGE_PROJECT || null,
    endpoint: process.env.CLOUD_PRIVATE_ENDPOINT || null
};
console.log("cloudConfig :",cloudConfig)
let cloudClient = cloudService.init(cloudConfig);
console.log("Yeahhhhh cloudClient : ",cloudClient)
let presignedUrl = cloudClient.getSignedUrl("telemetry-data-store","observation/distinctCount/dataTest.jpeg",262800,"WRITE")
let downloadableUrl = cloudClient.getDownloadableUrl("telemetry-data-store","observation/distinctCount/dataTest.jpeg",262800)
// let presignedUrl = cloudClient.getSignedUrl("dev-mentoring","reports/cspSample.pdf")

console.log("presignedUrl :",presignedUrl)
console.log("downloadableUrl :",downloadableUrl)

// async function someFunction() {
//     try {
//       let presignedUrl = await cloudClient.getSignedUrl("dev-mentoring", "reports/cspSample.pdf");
//       console.log("presignedUrl :", presignedUrl);
//     } catch (error) {
//       // Handle any errors that might occur during the asynchronous operation
//       console.error("Error:", error);
//     }
// }
// someFunction();
exports.cloudClient = cloudClient;