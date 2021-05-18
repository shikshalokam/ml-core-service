/**
 * name : qr-generator.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : Qr generator service.
 */

//dependencies

const request = require('request');
let fs = require("fs");

/**
  * Create qr code and save in a local file. 
  * @function
  * @name createQrCode
  * @param code - unique code
  * @returns {Promise}
*/

var createQrCode = async function ( code ) {
    const createQrCodeUrl = 
    `${process.env.QR_GENERATOR_URL}?data=${code}&size=${process.env.IMAGE_SIZE}`;
    
    return new Promise(async (resolve, reject) => {
        
        if( !fs.existsSync(`${ROOT_PATH}/public/qr-code`) ) {
            fs.mkdirSync(`${ROOT_PATH}/public/qr-code`);
        }

        if ( !fs.existsSync(`${ROOT_PATH}/public/qr-code/${code}`) ) {
            fs.mkdirSync(`${ROOT_PATH}/public/qr-code/${code}`);
        }

        let fileName = `${ROOT_PATH}/public/qr-code/${code}/image.png`;
        
        let options = {
            'method': 'GET',
            'url': createQrCodeUrl,
            'encoding' : null
        }

        function callback(error, response, body) {
            if (error) {
                return reject({
                    message : "Qr generator service is down"
                })
            } else {
                
                fs.writeFile(fileName,body, function (err,data) {
                    if(err) {
                        return reject({
                            message : "Could not update images in loacal"
                        })
                    } else {
                        return resolve({});
                    }
                })
            }
        }
        request(options,callback);
    })

}

module.exports = {
    createQrCode: createQrCode
};