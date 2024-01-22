



// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");

module.exports = class AssetsHelper {
  
     static fetchPrograms(queryData,bodyData) {
        return new Promise(async (resolve, reject) => {
          try {
              let organizationAssets;

              switch(queryData){
                case "program":
                  organizationAssets= await programsHelper.queryForOrganizationPrograms(
                    bodyData
                );
                break;
                case "solution":
                  organizationAssets= await solutionsHelper.queryForOrganizationSolutions(
                    bodyData
                  )
                   
                break;
                case "":
                  let allOrganizationProgram =await programsHelper.queryForOrganizationPrograms(
                    bodyData
                );
                let allOrganizationSolutions =await solutionsHelper.queryForOrganizationSolutions(
                  bodyData
                )
                organizationAssets=[...allOrganizationProgram.data,...allOrganizationSolutions.data];

                break;
              }
            
             
           if(queryData !== ""){
            return resolve({
              result: organizationAssets,
            });
          }else{
            return resolve({
              success: true,
              message: constants.apiResponses.ASSETS_SUCCESSFULLY,
              result: organizationAssets,
              
            });
          }
          } catch (error) {
            return reject(error);
          }
        });
      }
}