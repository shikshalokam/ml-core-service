/**
 * name : apps/helper.js
 * author : Deepa
 * created-date : 27-08-2020
 * Description : All app related helper functions.
 */

//Dependencies
const filesHelper = require(MODULES_BASE_PATH + "/files/helper");
const path = require("path");

/**
 * AppsHelper
 * @class
 */

module.exports = class AppsHelper {
  /**
   * List of app data.
   * @method
   * @name list
   * @param {Object} filterQueryObject - filter query data.
   * @param {Object} [projection = {}] - projected data.
   * @returns {Promise} returns a promise.
   */

  static list(
    query = "all",
    fields = "all",
    skipFields = "none",
    limitingValue = "",
    skippingValue = "",
    sortedData = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = {};

        if (query != "all") {
          queryObject = query;
        }

        let projectionObject = {};

        if (fields != "all") {
          fields.forEach((element) => {
            projectionObject[element] = 1;
          });
        }

        if (skipFields != "none") {
          skipFields.forEach((element) => {
            projectionObject[element] = 0;
          });
        }

        let appDocuments;

        if (sortedData !== "") {
          appDocuments = await database.models.apps
            .find(queryObject, projectionObject)
            .sort(sortedData)
            .limit(limitingValue)
            .skip(skippingValue)
            .lean();
        } else {
          appDocuments = await database.models.apps
            .find(queryObject, projectionObject)
            .limit(limitingValue)
            .skip(skippingValue)
            .lean();
        }

        return resolve({
          success: true,
          message: constants.apiResponses.APP_DETAILS_FETCHED,
          data: appDocuments,
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: false,
        });
      }
    });
  }

  /**
   * Get the app details
   * @method
   * @name getDetails
   * @param {String} name - app name.
   * @returns {Object}  - app details.
   */

  static getDetails(name = "") {
    return new Promise(async (resolve, reject) => {
      try {
        if (name == "") {
          throw new Error(constants.apiResponses.NAME_FIELD_REQUIRED);
        }

        let appDocument = await this.list({ name: name }, [
          "name",
          "displayName",
          "description",
          "logo",
          "playstoreLink",
          "appStoreLink",
        ]);

        if (!Array.isArray(appDocument.data) || appDocument.data < 1) {
          throw new Error(constants.apiResponses.APP_DETAILS_NOT_FOUND);
        }

        let bucketName = "";
        if (
          process.env.CLOUD_STORAGE == constants.common.GOOGLE_CLOUD_SERVICE
        ) {
          bucketName = process.env.GCP_BUCKET_NAME;
        } else if (process.env.CLOUD_STORAGE == constants.common.AWS_SERVICE) {
          bucketName = process.env.AWS_BUCKET_NAME;
        } else if (
          process.env.CLOUD_STORAGE == constants.common.AZURE_SERVICE
        ) {
          bucketName = process.env.AZURE_STORAGE_CONTAINER;
        }

        let getDownloadableUrl = await filesHelper.getDownloadableUrl(
          appDocument.data[0].logo,
          bucketName,
          process.env.CLOUD_STORAGE
        );

        if (getDownloadableUrl["url"] && getDownloadableUrl.url !== "") {
          appDocument.data[0].logo = getDownloadableUrl.url;
        }

        return resolve({
          success: true,
          message: constants.apiResponses.APP_DETAILS_FETCHED,
          data: appDocument.data[0],
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: false,
        });
      }
    });
  }
};
