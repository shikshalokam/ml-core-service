module.exports = {
    name: "programUsers",
    schema: {
      programId: {
        type : "ObjectId",
        required: true,
        index: true
      },
      consentForPIIDataSharing: {
        agree: Boolean,
        date: Date
      },
      consentHistory: {
          type: Array,
          default: []
      },
      userId: {
        type: String,
        index: true
      },
      noOfResourcesStarted: {
        type:Number,
        index: true
      },
      userProfile: Object,
      userRoleInformation: Object,
      appInformation: Object
    },
    compoundIndex: [
        {
            "name" :{ userId: 1, programId: 1 },
            "indexType" : { unique: true }
        }
      ]
};
  
  