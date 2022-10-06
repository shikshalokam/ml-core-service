module.exports = {
    name: "certificateTemplates",
    schema: {
      templateUrl: String,
      issuer: Object,
      status: {
        type : String,
        required : true
      },
      solutionId: {
        type : "ObjectId",
        index : true
      },
      programId: "ObjectId",
      criteria: {
        type : Object,
        required : true
      }
    }
};