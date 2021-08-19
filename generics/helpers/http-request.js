/**
 * name : http-request.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : all http requests.
 */

"use strict";

//dependencies
var https = require('https');
var http = require('http');
var url = require('url');
var formurlencoded = require('form-urlencoded');
var fs = require("fs");
var convert = require('xml-js');

/**
    * Request - all http related request.
    * @class
*/
var Request = class Request {

    /**
      * 
      * @method
      * @name _httpRequest
      * @param  {Object}  options.
      * @param  {Object}  data.      
      * @returns {Promise} Returns a Promise.
    */

    _httpRequest(options, data) {
        return new Promise(function (resolve, reject) {
            var req;

            var httpModule = (options.type == "http") ? http : https;
            req = httpModule.request(options, function (res) {
                res.setEncoding('utf8');

                var responseData = '';

                res.on('data', function (str) {
                    responseData += str;
                });

                res.on('end', function (content) {
                    if(res.headers["content-type"] == 'text/xml; charset=utf-8') {
                        responseData = JSON.parse(convert.xml2json(responseData, {compact: true, spaces: 4}))
                    } else if (res.headers["content-type"] == 'application/json' || res.headers["content-type"] == "application/json; charset=utf-8") {
                        responseData = JSON.parse(responseData)
                    }
                    resolve({ data: responseData, message: 'Success', status: (res.status) ? res.status : (res.statusCode) ? res.statusCode: "" , headers: res.headers });
                });
            });

            req.on('error', function (err) {
                resolve({ data: null, message: 'Failed' });
            });

            req.end(data);
        });
    }

    /**
      * 
      * @method
      * @name _request
      * @param {URL} requestUrl
      * @param  {Object}  options.
      * @param  {Object}  data.
      * @param  {String}  path.   
      * @returns {Promise} Returns a Promise.
    */

    _request(requestUrl, options, data, path) {
        options = options || {};
        var parsedUrl = url.parse(requestUrl);

        if (parsedUrl.hostname) {
            options.hostname = parsedUrl.hostname;
        }

        if (parsedUrl.port) {
            options.port = parsedUrl.port;
        }

        if (parsedUrl.path) {
            options.path = parsedUrl.path;
        }
        if(!path)
            return this._httpRequest(options, data);
        else
            return this._httpFileRequest(options, data, path);
    }

    /**
      * Get requested data
      * @method
      * @name get
      * @param  {URL}  url.
      * @param  {Object}  options.
      * @param  {String}  path.            
      * @returns {Function} Returns a function.
    */

    get(url, options, path) {
        options = options || {};

        // Set method to GET and call it
        options.method = 'GET';
        return this._request(url, options, null, path);
    }

     /**
      * Post requested data
      * @method
      * @name post
      * @param  {URL}  url.
      * @param  {Object}  options.        
      * @returns {Function} Returns a function.
    */

    post(url, options) {
        options = options || {};
        var self = this;

        // Try and extract data and set it's type
        var data = null;
        return new Promise(function (resolve, reject) {
            try {
                if (options.form) {
                    data = formurlencoded.default(options.form);
                    if(!options.headers) {
                        options.headers = {
                            'content-type': 'application/x-www-form-urlencoded',
                            'content-length': Buffer.byteLength(data)
                        };
                    } else {
                        options.headers['content-type'] = "application/x-www-form-urlencoded"
                        options.headers['content-length'] = Buffer.byteLength(data)
                    }
                } else if (options.json) {
                    data = JSON.stringify(options.json);
                    if (!options.headers)
                        options.headers = {
                            'content-type': 'application/json',
                            'content-length': Buffer.byteLength(data)
                        };
                    else
                        options.headers['content-length'] = Buffer.byteLength(data)
                }
            } catch (error) {
                return process.nextTick(function () {
                    reject({ message: 'There is issue in the sent data' });
                });
            }

            // Set method to POST and call it
            options.method = 'POST';
            return resolve(self._request(url, options, data))
        });
    }
}


module.exports = Request

