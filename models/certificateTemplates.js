module.exports = {
    name: "certificateTemplates",
    schema: {
      templateUrl: {
        type : String,
        index : true
      },
      issuer: Object,
      status: String,
      solutionId: "ObjectId",
      programId: "ObjectId",
      criteria: Object
    }
  };