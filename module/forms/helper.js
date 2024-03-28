module.exports = class FormHelper {

    /**
     * Form list.
     * @method
     * @name formsDocument
     * @param {Object} [queryParameter = "all"] - Filtered query data.
     * @param {Object} [projection = "all"] - Projected data.
     * @param {Object} [skipFields = "none"] - Field not to include.      
     * @returns {Object} returns a form data.
    */

   static formsDocument(filterQuery = "all", fieldsArray = "all", skipFields = "none") {
       return new Promise(async (resolve, reject) => {
           try {
               
                let queryObject = (filterQuery != "all") ? filterQuery : {};
                
                let projection = {}
                
                if (fieldsArray != "all") {
                    fieldsArray.forEach(field => {
                        projection[field] = 1;
                    });
                }
                
                if( skipFields !== "none" ) {
                    skipFields.forEach(field=>{
                        projection[field] = 0;
                    })
                }

               let formData = 
               await database.models.forms.find(queryObject, projection).lean();

               return resolve(formData);

           } catch (error) {
               return reject(error);
           }
       })

   }

   /**
   * Form details.
   * @method
   * @name details
   * @param formName - form name.
   * @returns {Array} Details of form.
   */
  
  static details( formName ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const forms = await this.formsDocument(
                {
                    name : formName
                },["value"]
            );

            if( !(forms.length > 0)) {
                throw {
                    message : constants.apiResponses.FORM_NOT_FOUND,
                    status : httpStatusCode['bad_request'].status
                }
            }

            return resolve({
                message : constants.apiResponses.FORMS_FETCHED,
                result : forms[0].value
            });
            
        } catch (error) {
            return reject(error);
        }
    });
  }
  
}