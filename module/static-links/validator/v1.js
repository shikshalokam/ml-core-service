/**
 * name : v1.js
 * author : Rakesh
 * created-date : 28-Oct-2020
 * Description : Static links.
 */
module.exports = (req) => {

    let staticLinksValidator = {

    }

    if (staticLinksValidator[req.params.method]) {
        staticLinksValidator[req.params.method]();
    } 

};