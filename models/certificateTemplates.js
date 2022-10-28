module.exports = {
    name: "certificateTemplates",
    schema: {
      templateUrl: String,
      issuer: {
        type : Object,
        required : true
      },
      status: {
        type : String,
        required : true
      },
      solutionId: {
        type : "ObjectId",
        index : true,
        unique : true
      },
      programId: "ObjectId",
      criteria: {
        type : Object,
        required : true
      }
    }
};