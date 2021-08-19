/**
 * name : constants/endpoints.js
 * author : Aman
 * Date : 28-feb-2020
 * Description : All service endpoints
 */

module.exports = {
    CREATE_USER_PROFILE : "/v1/userProfile/create",
    UPDATE_USER_PROFILE : "/v1/userProfile/update",
    VERIFY_USER_PROFILE : "/v1/userProfile/verify",
    PLATFORM_USER_PROFILE : "/v1/platformUserRoles/getProfile",
    USER_PROFILE_DETAILS : "/v1/userProfile/details",
    SUNBIRD_GENERATE_DIALCODE : "/dialcode/v1/generate",
    SUNBIRD_PUBLISH_DIALCODE : "/dialcode/v1/publish",
    SUNBIRD_DIALCODE_STATUS : "/dialcode/v1/read",
    SUNBIRD_CONTENT_LINK : "/dialcode/v1/content/link",
    SUNBIRD_PUBLISH_CONTENT : "/v1/content/v1/publish",
    USER_READ : "/api/user/v1/read",
    SUNBIRD_INDEX_SYNC : "/data/v1/index/sync",
    SUNBIRD_CREATE_CONTENT : "/content/v1/create",
    SUNBIRD_UPLOAD_CONTENT : "/content/v1/upload",
    SUNBIRD_ORGANISATION_LISTS : "/organisations/list",
    SUNBIRD_USER_SEARCH :"/users/search",
    GET_USER_ASSIGNED_OBSERVATION : "/v1/observations/userAssigned",
    GET_USER_ASSIGNED_SURVEY : "/v1/surveys/userAssigned",
    GET_USER_ASSIGNED_PROJECT : "/v1/userProjects/userAssigned",
    IMPORTED_PROJECT : "/v1/userProjects/importedProjects"
}