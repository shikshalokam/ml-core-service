module.exports = {
    name: "programs",
    schema: {
      externalId: String,
      name: {
        type : String,
        index : true
      },
      description: {
        type : String,
        index : true
      },
      owner: String,
      createdBy: String,
      updatedBy: String,
      status: {
        type : String,
        index : true
      },
      resourceType: [String],
      language: [String],
      keywords: [String],
      concepts: ["json"],
      imageCompression: {},
      components: ["json"],
      components: ["json"],
      isAPrivateProgram : {
        default : false,
        type : Boolean,
        index : true
      },
      scope : {
        entityType : String,
        entityTypeId : "ObjectId",
        entities : {
          type : Array,
          index : true
        },
        roles : [{
          _id : "ObjectId",
          code : {
            type : String,
            index : true
          }
        }]
      },
      isDeleted: {
        default : false,
        type : Boolean,
        index : true
      }
    }
  };
  