module.exports = {
  name: "certificateBaseTemplates",
  schema: {
    code: {
      type : String,
      required : true,
      index: true
    },
    name: {
      type : String
    },
    url: {
      type : String,
    }
  }
};