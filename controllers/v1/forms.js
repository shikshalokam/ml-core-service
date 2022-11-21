/**
 * name : forms.js
 * author : Rakesh Kumar
 * created-date : 03-March-2020
 * Description : Forms information. 
 */

 // Dependencies

 const formsHelper = require(MODULES_BASE_PATH + "/forms/helper");
 
  /**
     * Forms
     * @class
 */
 module.exports = class Forms extends Abstract {
   
   constructor() {
     super(schemas["forms"]);
   }
 
   static get name() {
     return "forms";
   }

  /**
   * @api {get} /kendra/api/v1/forms/details/:formName
   * Form details
   * @apiVersion 0.0.1
   * @apiName Form details
   * @apiGroup Forms
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /kendra/api/v1/forms/details/projects
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   * "status": 200,
    "message": "Forms fetched successfully",
    "result": [
    {
        "field" : "title",
        "label" : "Title",
        "value" : "",
        "visible" : true,
        "editable" : true,
        "input" : "text",
        "validation" : {
            "required" : true
        }
    },
    {
        "field" : "description",
        "label" : "Description",
        "value" : "",
        "visible" : true,
        "editable" : true,
        "input" : "textarea",
        "validation" : {
            "required" : true
        }
    },
    {
        "field" : "categories",
        "label" : "Categories",
        "value" : "",
        "visible" : true,
        "editable" : true,
        "input" : "select",
        "options" : [],
        "validation" : {
            "required" : false
        }
    }
  ]
    }
   */

  /**
   * List forms.
   * @method
   * @name details
   * @param {Object} req - Requested data.
   * @param {Object} req.params._id - Form name.
   * @returns {JSON} List forms.
  */

 async details(req) {
   return new Promise(async (resolve, reject) => {
     try {
       
        let forms = await formsHelper.details(req.params._id);
        return resolve(forms);
      
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
  });
}

/**
   * @api {post} /kendra/api/v1/forms/create
   * Form Create
   * @apiVersion 0.0.1
   * @apiName Form Create
   * @apiGroup Forms
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /kendra/api/v1/forms/create
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   *  "status": 200,
      "message": "Forms created successfully",
      "result": {
        "_id": "5f33c3d85f637784791cd830"
      }
    }
   */

  /**
   * Create form.
   * @method
   * @name create
   * @param {Object} req - Requested data.
   * @returns {JSON} Form details.
  */

  async create(req) {
    return new Promise(async (resolve, reject) => {
      try {
        
          let createForm = await formsHelper.create(req.body);
          return resolve(createForm);
       
       } catch (error) {
          return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error
         });
       }
   });
  }
  
  /**
   * @api {post} /kendra/api/v1/forms/update/scope
   * Form Update
   * @apiVersion 0.0.1
   * @apiName Form Update
   * @apiGroup Forms
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /kendra/api/v1/forms/update/scope
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   *  "status": 200,
      "message": "Forms updated successfully"
    }
   */

  /**
   * Update form.
   * @method
   * @name update
   * @param {Object} req - Requested data.
   * @param {Object} req.params._id - Form name.
   * @returns {JSON} Form details.
  */

   async update(req) {
    return new Promise(async (resolve, reject) => {
      try {
        
          let updateForm = await formsHelper.update(
            req.params._id, 
            req.body
          );
          return resolve(updateForm);
       
       } catch (error) {
          return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error
         });
       }
   });
  }
};
 