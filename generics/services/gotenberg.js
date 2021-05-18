/**
 * name : gotenberg.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : Gotenberg service.
 */

//dependencies

const request = require('request');
let fs = require("fs");

/**
  * Create user profile. 
  * @function
  * @name createUserProfile
  * @param formData - formData for gotenberg service
  * @param pdfPath - Path to save the pdf
  * @returns {Promise}
*/

var generatePdf = async function ( formData,pdfPath ) {
    return new Promise(async (resolve,reject)=>{
        let options = 
        {
            url: process.env.GOTENBERG_HOST,
            method: 'POST',
            headers: { "Content-Type": "multipart/form-data" },
            formData : { 
                "files" : formData, 
                "marginTop": 0,
                "marginBottom": 0,
                "marginLeft": 0,
                "marginRight": 0
            },
            encoding : null
        };

        request(options,callback);
        
        function callback(error, response, body) {
            if (error) {
                return reject({ message : "Gotenberg service is down !!"})
            } else {
                fs.writeFile(pdfPath,body, function (err,data) {
                    if(err) {
                        return reject({
                            message : "Could not append pdf in given path"
                        })
                    } else {
                        return resolve({})
                    }
                })
            }
        }
    })
    
}

module.exports = {
    generatePdf: generatePdf
};