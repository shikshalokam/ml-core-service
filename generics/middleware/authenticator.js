/**
 * name : middleware/authenticator.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Keycloak authentication.
 */

// dependencies
const keycloakPublicKeyPath = process.env.KEYCLOAK_PUBLIC_KEY_PATH + "/";
const jwt = require('jsonwebtoken');
const fs = require('fs');
const PEM_FILE_BEGIN_STRING = "-----BEGIN PUBLIC KEY-----";
const PEM_FILE_END_STRING = "-----END PUBLIC KEY-----";

var invalidTokenMsg = {
  "status" : 'ERR_TOKEN_FIELD_MISSING',
  "message" : 'Required field token is missing',
  "currentDate" : new Date().toISOString()
};

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

module.exports = async function (req, res, next) {

  removedHeaders.forEach(function (e) {
    delete req.headers[e];
  });

  var token = req.headers["x-authenticated-user-token"];

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
    "/entities/getUsersByEntityAndRole/",
    "/entities/details"
  ];
  
  let performInternalAccessTokenCheck = false;
  await Promise.all(internalAccessApiPaths.map(async function (path) {
    if (req.path.includes(path)) {
      performInternalAccessTokenCheck = true;
    }
  }));

  if ( !token && performInternalAccessTokenCheck) {
    if (req.headers["internal-access-token"] !== process.env.INTERNAL_ACCESS_TOKEN) {
      return res.status(httpStatusCode["unauthorized"].status).send(invalidTokenMsg);
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
    "/solutions/removeEntitiesInScope",
    "/programs/details",
    "/admin/dbUpdate",
    "/admin/dbFind",
    "/admin/dbDelete",
    "/admin/dbCreate",
    "/cloud-services/storage/actions"
  ];

  for(let path = 0; path < mandatoryInternalAccessApiPaths.length ; path++ ) {
    if( 
      req.path.includes(mandatoryInternalAccessApiPaths[path]) && 
      req.headers["internal-access-token"] !== process.env.INTERNAL_ACCESS_TOKEN
    ) {
      return res.status(httpStatusCode["unauthorized"].status).send(invalidTokenMsg);
    }
  }

  if (!token) {
    return res.status(httpStatusCode["unauthorized"].status).send(invalidTokenMsg);
  }

  var decoded = jwt.decode(token, { complete: true });
  if(decoded === null || decoded.header === undefined){
    return res.status(httpStatusCode["unauthorized"].status).send(invalidTokenMsg);
  }

  const kid = decoded.header.kid;
  let cert = "";
  let path = keycloakPublicKeyPath + kid;
  
  if (fs.existsSync(path)) {

    let accessKeyFile  = await fs.readFileSync(path);

    if(accessKeyFile) {
      if(!accessKeyFile.includes(PEM_FILE_BEGIN_STRING)){
        cert = PEM_FILE_BEGIN_STRING+"\n"+accessKeyFile+"\n"+PEM_FILE_END_STRING;
      }else {
        cert = fs.readFileSync(path);
      }  
    }

    jwt.verify(token, cert, { algorithms: ['sha1', 'RS256', 'HS256'] }, function (err, decode) {

      if (err) {
        return res.status(401).send(invalidTokenMsg);
      }

      if (decode !== undefined) {
        const expiry = decode.exp;
        const now = new Date();
        if (now.getTime() > expiry * 1000) {
          return res.status(401).send(invalidTokenMsg);
        }

        req.userDetails = {
          userToken : token,
          id : decode.sub.split(":").pop(),
          userId : decode.sub.split(":").pop(),
          userName : decode.preferred_username,
          email : decode.email,
          firstName : decode.name
        }
        next();
      
      } else {
        return res.status(401).send(invalidTokenMsg);
      }

    });
  } else {
    return res.status(401).send(invalidTokenMsg);
  }

};