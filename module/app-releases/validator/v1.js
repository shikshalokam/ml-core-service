/**
 * name : v1.js
 * author : Aman
 * created-date : 26-03-2020
 * Description : App release validation.
 */

module.exports = (req) => {

    let appReleaseValidator = {

    }

    if ( appReleaseValidator[req.params.method] ) {
        appReleaseValidator[req.params.method]();
    }

};