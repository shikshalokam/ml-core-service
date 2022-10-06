module.exports = {
    name: "certificateTemplates",
    schema: {
      templateUrl: String,
      issuer: Object,
      status: String,
      solutionId: {
        type : "ObjectId",
        index : true
      },
      programId: "ObjectId",
      criteria: Object
    }
};