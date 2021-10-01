/**
 * name : elastic-search-config.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : Elastic search configuration file.
 */


//dependencies
// const { Client : esClient } = require('@elastic/elasticsearch');

// /**
//  * Elastic search connection.
//  * @function
//  * @name connect
//  * @return {Object} elastic search client 
//  */

// var connect = function () {

//   const elasticSearchClient = new esClient({
//     node: process.env.ELASTICSEARCH_HOST_URL,
//     maxRetries: 5,
//     requestTimeout: 60000,
//     sniffOnStart: process.env.ELASTIC_SEARCH_SNIFF_ON_START
//   });

//   elasticSearchClient.ping({
//   }, function (error) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Elasticsearch connection established.');
//     }
//   });

//   return {
//     client: elasticSearchClient
//   };

// };

// module.exports = connect;
