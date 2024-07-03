/**
 * name : reports.js
 * author : Saish Borkar
 * Date : Jul 3 2024
 * Description : All reports related api call
 */

const request = require('request');


var generateStatsReport = function (overview,userToken) {

    let url = 
    process.env.ML_REPORT_SERVICE_URL +
    constants.endpoints.GET_STATS_REPORT;
    
    return new Promise(async (resolve, reject) => {
        try {

            const options = {
                headers : {
                    "content-type": "application/json",
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "x-authenticated-user-token" : userToken
                },
                body: JSON.stringify(overview) 
            };

            function APIcallback(err, data) {
                
                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    
                    if( response.status === 'success' ) {
                        result["data"] = response.pdfUrl;
                    } else {
                        result.success = false;
                    }
                }

                return resolve(result);
            }

            request.get(url,options,APIcallback)

        } catch (error) {
            return reject(error);
        }
    })

}



module.exports = {
    generateStatsReport : generateStatsReport
}