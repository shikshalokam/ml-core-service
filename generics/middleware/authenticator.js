/**
 * name : middleware/authenticator.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Keycloak authentication.
 */

// dependencies
const jwtDecode = require('jwt-decode');
const slackClient = require("../helpers/slack-communications");
const interceptor = require("./lib/api-interceptor");
const messageUtil = require("./lib/message-util");
let responseCode = require("../http-status-codes");
const shikshalokam = require("../helpers/shikshalokam");

var reqMsg = messageUtil.REQUEST;
var keyCloakConfig = {
  authServerUrl: process.env.sunbird_keycloak_auth_server_url,
  realm: process.env.sunbird_keycloak_realm,
  clientId: process.env.sunbird_keycloak_client_id,
  public: process.env.sunbird_keycloak_public
};

var cacheConfig = {
  store: process.env.sunbird_cache_store,
  ttl: process.env.sunbird_cache_ttl
};

var respUtil = function (resp) {
  return {
    status: resp.errCode,
    message: resp.errMsg,
    currentDate: new Date().toISOString()
  };
};

var tokenAuthenticationFailureMessageToSlack = function (req, token, msg) {
  let jwtInfomration = jwtDecode(token)
  jwtInfomration["x-authenticated-user-token"] = token
  const tokenByPassAllowedLog = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    errorMsg: msg,
    customFields:
      jwtInfomration,
    slackErrorName: process.env.SLACK_ERROR_NAME,
    color: process.env.SLACK_ERROR_MESSAGE_COLOR
  }

  slackClient.sendMessageToSlack(tokenByPassAllowedLog)
}

var apiInterceptor = new interceptor(keyCloakConfig, cacheConfig);
var removedHeaders = [
  "host",
  "origin",
  "accept",
  "referer",
  "content-length",
  "accept-encoding",
  "accept-language",
  "accept-charset",
  "cookie",
  "dnt",
  "postman-token",
  "cache-control",
  "connection"
];

async function getAllRoles(obj) {
  let roles = await obj.roles;
  await _.forEach(obj.organisations, async value => {
    roles = await roles.concat(value.roles);
  });
  return roles;
}

module.exports = async function (req, res, next) {

  removedHeaders.forEach(function (e) {
    delete req.headers[e];
  });

  var token = req.headers["x-authenticated-user-token"];
  if (!req.rspObj) req.rspObj = {};
  var rspObj = req.rspObj;

  if (req.path.includes("slack")) {
    next();
    return
  }


  let byPassUrlPaths = [
    "bodh/search",
    "bodh/request",
    "apps/details"
  ]
  // Allow search endpoints for non-logged in users.

  await Promise.all(byPassUrlPaths.map(async function (path) {
    if (req.path.includes(path)) {
      next();
      return
    }
  }));

  let internalAccessApiPaths = [
    "/cloud-services/",
    "/entities/listByIds",
    "/entity-types/list",
    "/user-roles/list",
    "/forms/details",
    "/programs/list",
    "/entities/getUsersByEntityAndRole/"
  ];
  
  let performInternalAccessTokenCheck = false;
  await Promise.all(internalAccessApiPaths.map(async function (path) {
    if (req.path.includes(path)) {
      performInternalAccessTokenCheck = true;
    }
  }));

  if ( !token && performInternalAccessTokenCheck) {
    if (req.headers["internal-access-token"] !== process.env.INTERNAL_ACCESS_TOKEN) {
      rspObj.errCode = reqMsg.TOKEN.MISSING_CODE;
      rspObj.errMsg = reqMsg.TOKEN.MISSING_MESSAGE;
      rspObj.responseCode = responseCode.unauthorized;
      return res.status(httpStatusCode["unauthorized"].status).send(respUtil(rspObj));
    } else {
      next();
      return;
    }
  }

  let mandatoryInternalAccessApiPaths = [
    "keywords",
    "/programs/create",
    "/programs/update",
    "/solutions/create",
    "/solutions/update",
    "/programs/addRolesInScope",
    "/programs/addEntitiesInScope",
    "programs/removeRolesInScope",
    "/programs/removeEntitiesInScope",
    "/solutions/addRolesInScope",
    "/solutions/addEntitiesInScope",
    "solutions/removeRolesInScope",
    "/solutions/removeEntitiesInScope"
  ];

  for(let path = 0; path < mandatoryInternalAccessApiPaths.length ; path++ ) {
    if( 
      req.path.includes(mandatoryInternalAccessApiPaths[path]) && 
      req.headers["internal-access-token"] !== process.env.INTERNAL_ACCESS_TOKEN
    ) {
      rspObj.errCode = reqMsg.TOKEN.MISSING_CODE;
      rspObj.errMsg = reqMsg.TOKEN.MISSING_MESSAGE;
      rspObj.responseCode = responseCode.unauthorized;
      return res.status(httpStatusCode["unauthorized"].status).send(respUtil(rspObj));
    }
  }

  if (!token) {
    rspObj.errCode = reqMsg.TOKEN.MISSING_CODE;
    rspObj.errMsg = reqMsg.TOKEN.MISSING_MESSAGE;
    rspObj.responseCode = responseCode.unauthorized;
    return res.status(httpStatusCode["unauthorized"].status).send(respUtil(rspObj));
  }

  apiInterceptor.validateToken(token, function (err, tokenData) {

    if (err) {
      rspObj.errCode = reqMsg.TOKEN.INVALID_CODE;
      rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE;
      rspObj.responseCode = responseCode.UNAUTHORIZED_ACCESS;

      tokenAuthenticationFailureMessageToSlack(
        req,
        token, "TOKEN VERIFICATION WITH KEYCLOAK FAILED"
      );
      return res.status(httpStatusCode["unauthorized"].status).send(respUtil(rspObj));
    } else {
      req.rspObj.userId = tokenData.userId;
      req.rspObj.userToken = req.headers["x-authenticated-user-token"];
      delete req.headers["x-authenticated-userid"];
      delete req.headers["x-authenticated-user-token"];
      // rspObj.telemetryData.actor = utilsService.getTelemetryActorData(req);
      req.headers["x-authenticated-userid"] = tokenData.userId;
      req.rspObj = rspObj;
      shikshalokam
        .userInfo(token, tokenData.userId)
        .then(async userDetails => {
          if (userDetails.responseCode == "OK") {
            req.userDetails = userDetails.result.response;
            req.userDetails.userToken = req.rspObj.userToken
            req.userDetails.allRoles = await getAllRoles(req.userDetails);
            next();
          } else {
            tokenAuthenticationFailureMessageToSlack(
              req,
              token,
              "TOKEN VERIFICATION - FAILED TO GET USER DETAIL FROM Kendra SERVICE"
            );

            rspObj.errCode = reqMsg.TOKEN.INVALID_CODE;
            rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE;
            rspObj.responseCode = responseCode.UNAUTHORIZED_ACCESS;
            return res.status(httpStatusCode["unauthorized"].status).send(respUtil(rspObj));
          }
        })
        .catch(error => {
          tokenAuthenticationFailureMessageToSlack(
            req,
            token,
            "TOKEN VERIFICATION - ERROR FETCHING USER DETAIL FROM Kendra SERVICE"
          );

          return res.status(httpStatusCode["unauthorized"].status).send(error);
        });
    }
  });
};
