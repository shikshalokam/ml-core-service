/**
 * name : users/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : All User related information including sys_admin.
 */

// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const improvementProjectService = require(ROOT_PATH +
  "/generics/services/improvement-project");
const userService = require(ROOT_PATH + "/generics/services/users");
const formService = require(ROOT_PATH + "/generics/services/form");
const programUsersHelper = require(MODULES_BASE_PATH + "/programUsers/helper");
const surveyService = require(ROOT_PATH + "/generics/services/survey");
const kafkaProducersHelper = require(ROOT_PATH + "/generics/kafka/producers");
const telemetryEventOnOff = process.env.TELEMETRY_ON_OFF
const reportService = require(ROOT_PATH + "/generics/services/reports");
/**
 * UsersHelper
 * @class
 */

module.exports = class UsersHelper {
  /**
   * deleteUserPIIData function to delete users Data.
   * @method
   * @name deleteUserPIIData
   * @param {userDeleteEvent} - userDeleteEvent message object 
   * {
      "eid": "BE_JOB_REQUEST",
      "ets": 1619527882745,
      "mid": "LP.1619527882745.32dc378a-430f-49f6-83b5-bd73b767ad36",
      "actor": {
        "id": "delete-user",
        "type": "System"
      },
      "context": {
        "channel": "01309282781705830427",
        "pdata": {
          "id": "org.sunbird.platform",
          "ver": "1.0"
        },
        "env": "dev"
      },
      "object": {
        "id": "<deleted-userId>",
        "type": "User"
      },
      "edata": {
        "organisationId": "0126796199493140480",
        "userId": "a102c136-c6da-4c6c-b6b7-0f0681e1aab9",
        "suggested_users": [
          {
            "role": "ORG_ADMIN",
            "users": [
              "<orgAdminUserId>"
            ]
          },
          {
            "role": "CONTENT_CREATOR",
            "users": [
              "<contentCreatorUserId>"
            ]
          },
          {
            "role": "COURSE_MENTOR",
            "users": [
              "<courseMentorUserId>"
            ]
          }
        ],
        "action": "delete-user",
        "iteration": 1
      }
    }
   * @returns {Promise} success Data.
   */
  static deleteUserPIIData(userDeleteEvent) {
    return new Promise(async (resolve, reject) => {
      try {
        let userId = userDeleteEvent.edata.userId;
        let filter = {
          userId: userId,
        };
        let updateProfile = {
          $set: {
            "userProfile.firstName": constants.common.DELETED_USER,
          },
          $unset: {
            "userProfile.email": 1,
            "userProfile.maskedEmail": 1,
            "userProfile.maskedPhone": 1,
            "userProfile.recoveryEmail": 1,
            "userProfile.phone": 1,
            "userProfile.lastName": 1,
            "userProfile.prevUsedPhone": 1,
            "userProfile.prevUsedEmail": 1,
            "userProfile.recoveryPhone": 1,
            "userProfile.dob": 1,
            "userProfile.encEmail": 1,
            "userProfile.encPhone": 1,
          },
        };
        let solutionFilter = {
          author: userId,
        };
        let updateSolutions = {
          $set: {
            creator: constants.common.DELETED_USER,
          },
        };
        let solutionLicenseFilter = {
          author: userId,
          license: { $exists: true, $ne: "" },
        };
        let updateSolutionsLicense = {
          $set: {
            "license.author": constants.common.DELETED_USER,
            "license.creator": constants.common.DELETED_USER,
          },
        };
        let deleteUserPII = [
          programUsersHelper.updateMany(filter, updateProfile),
          solutionsHelper.updateMany(solutionFilter, updateSolutions),
          solutionsHelper.updateMany(
            solutionLicenseFilter,
            updateSolutionsLicense
          ),
        ];
        let deleteUserPIIDataResult = await Promise.all(deleteUserPII);
        if (
          deleteUserPIIDataResult &&
          (deleteUserPIIDataResult[0].nModified > 0 ||
            (deleteUserPIIDataResult[1].nModified > 0) |
              (deleteUserPIIDataResult[2].nModified > 0))
        ) {
          if (telemetryEventOnOff !== constants.common.OFF) {
            /**
             * Telemetry Raw Event
             * {"eid":"","ets":1700188609568,"ver":"3.0","mid":"e55a91cd-7964-46bc-b756-18750787fb32","actor":{},"context":{"channel":"","pdata":{"id":"projectservice","pid":"manage-learn","ver":"7.0.0"},"env":"","cdata":[{"id":"adf3b621-619b-4195-a82d-d814eecdb21f","type":"Request"}],"rollup":{}},"object":{},"edata":{}}
             */
            let rawEvent =
              await gen.utils.generateTelemetryEventSkeletonStructure();
            rawEvent.eid = constants.common.AUDIT;
            rawEvent.context.channel = userDeleteEvent.context.channel;
            rawEvent.context.env = constants.common.USER;
            rawEvent.edata.state = constants.common.DELETE_STATE;
            rawEvent.edata.type = constants.common.USER_DELETE_TYPE;
            rawEvent.edata.props = [];
            let userObject = {
              id: userId,
              type: constants.common.USER,
            };
            rawEvent.actor = userObject;
            rawEvent.object = userObject;
            rawEvent.context.pdata.pid = `${process.env.ID}.${constants.common.USER_DELETE_MODULE}`;

            let telemetryEvent = await gen.utils.generateTelemetryEvent(
              rawEvent
            );
            telemetryEvent.lname = constants.common.TELEMTRY_EVENT_LOGGER;
            telemetryEvent.level = constants.common.INFO_LEVEL;

            await kafkaProducersHelper.pushTelemetryEventToKafka(
              telemetryEvent
            );
          }
          return resolve({
            success: true,
          });
        } else {
          return resolve({
            success: true,
          });
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * List of all private programs created by user
   * @method
   * @name privatePrograms
   * @param {string} userId - logged in user Id.
   * @returns {Array} - List of all private programs created by user.
   */

  static privatePrograms(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        let userPrivatePrograms = await programsHelper.userPrivatePrograms(
          userId
        );

        return resolve({
          message: constants.apiResponses.PRIVATE_PROGRAMS_LIST,
          result: userPrivatePrograms,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Create user program and solution
   * @method
   * @name createProgramAndSolution
   * @param {string} userId - logged in user Id.
   * @param {object} programData - data needed for creation of program.
   * @param {object} solutionData - data needed for creation of solution.
   * @returns {Array} - Created user program and solution.
   */

  static createProgramAndSolution(
    userId,
    data,
    userToken,
    createADuplicateSolution = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let createProgramAndSolutionDetails =
          await solutionsHelper.createProgramAndSolution(
            userId,
            data,
            userToken,
            createADuplicateSolution
          );
        return resolve(createProgramAndSolutionDetails);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Entities mapping form data.
   * @method
   * @name entitiesMappingForm
   * @param {String} stateCode - state code.
   * @param {String} roleId - role id.
   * @returns {Object} returns a list of entitiesMappingForm.
   */

  static entitiesMappingForm(stateCode, roleId, entityKey) {
    return new Promise(async (resolve, reject) => {
      try {
        const rolesData = await userRolesHelper.roleDocuments(
          {
            _id: roleId,
          },
          ["entityTypes.entityType"]
        );

        if (!(rolesData.length > 0)) {
          return resolve({
            message: constants.apiResponses.USER_ROLES_NOT_FOUND,
            result: [],
          });
        }

        let subEntities = [];
        let cacheData = await cache.getValue(entityKey);

        if (!cacheData) {
          subEntities = await formService.configForStateLocation(
            stateCode,
            entityKey
          );
          if (!(subEntities.length > 0)) {
            return resolve({
              message: constants.apiResponses.ENTITY_NOT_FOUND,
              result: [],
            });
          }
        } else {
          subEntities = cacheData;
        }
        let roleEntityType = "";

        rolesData[0].entityTypes.forEach((roleData) => {
          if (subEntities.includes(roleData.entityType)) {
            roleEntityType = roleData.entityType;
          }
        });

        let entityTypeIndex = subEntities.findIndex(
          (path) => path === roleEntityType
        );

        let form = {
          field: "",
          label: "",
          value: "",
          visible: true,
          editable: true,
          input: "text",
          validation: {
            required: false,
          },
        };

        let forms = [];

        for (
          let pointerToChildHierarchy = 1;
          pointerToChildHierarchy < entityTypeIndex + 1;
          pointerToChildHierarchy++
        ) {
          let cloneForm = JSON.parse(JSON.stringify(form));
          let entityType = subEntities[pointerToChildHierarchy];
          cloneForm["field"] = entityType;
          cloneForm["label"] = `Select ${gen.utils.camelCaseToTitleCase(
            entityType
          )}`;

          if (roleEntityType === entityType) {
            cloneForm.validation.required = true;
          }

          forms.push(cloneForm);
        }

        return resolve({
          message: constants.apiResponses.ENTITIES_MAPPING_FORM_FETCHED,
          result: forms,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * User targeted solutions.
   * @method
   * @name solutions
   * @param {String} programId - program id.
   * @param {Object} requestedData requested data.
   * @param {String} pageSize page size.
   * @param {String} pageNo page no.
   * @param {String} search search text.
   * @param {String} token user token.
   * @param {String} userId user userId.
   * @returns {Object} targeted user solutions.
   */

  static solutions(
    programId,
    requestedData,
    pageSize,
    pageNo,
    search,
    token,
    userId,
    type
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await programsHelper.programDocuments(
          {
            _id: programId,
          },
          [
            "name",
            "requestForPIIConsent",
            "rootOrganisations",
            "endDate",
            "description",
          ]
        );

        if (!(programData.length > 0)) {
          return resolve({
            status: httpStatusCode["bad_request"].status,
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        let totalCount = 0;
        let mergedData = [];

        // fetching all the targted solutions in program
        let autoTargetedSolutions =
          await solutionsHelper.forUserRoleAndLocation(
            requestedData, //user Role information
            type, // type of solution user is looking for
            "", //subtype of solutions
            programId, //program for solutions
            constants.common.DEFAULT_PAGE_SIZE, //page size
            constants.common.DEFAULT_PAGE_NO, //page no
            search //search text
          );

        let projectSolutionIdIndexMap = {};

        if (
          autoTargetedSolutions.data.data &&
          autoTargetedSolutions.data.data.length > 0
        ) {
          // Remove observation solutions which for project tasks.

          _.remove(autoTargetedSolutions.data.data, function (solution) {
            return (
              solution.referenceFrom == constants.common.PROJECT &&
              solution.type == constants.common.OBSERVATION
            );
          });

          totalCount = autoTargetedSolutions.data.data.length;
          mergedData = autoTargetedSolutions.data.data;
        }

        const solutionIds = [];
        const getAllResources = [];

        /**
         * here we need to find if user is started any solution and that is not listed in targted solution
         * @function importedProjects
         * @function userSurveys
         * @function userObservations
         *
         * @param token string: userToken
         * @param programId string: programId
         *
         * @returns {Promise}
         */
        // Creates an array of promises based on users Input
        switch (type) {
          case constants.common.IMPROVEMENT_PROJECT:
            break;
          case constants.common.SURVEY:
            getAllResources.push(surveyService.userSurveys(token, programId));
            break;
          case constants.common.OBSERVATION:
            getAllResources.push(
              surveyService.userObservations(token, programId)
            );
            break;
          default:
            getAllResources.push(surveyService.userSurveys(token, programId));
            getAllResources.push(
              surveyService.userObservations(token, programId)
            );
        }
        //here will wait till all promises are resolved
        const allResources = await Promise.all(getAllResources);

        //Will find all solutionId from response
        allResources.forEach((resources) => {
          // this condition is required because it returns response in different object structure
          if (resources.success === true) {
            resources.result.forEach((resource) => {
              solutionIds.push(resource.solutionId);
            });
          }
        });

        // getting all the targted solutionIds from targted solutions
        const allTargetedSolutionIds =
          gen.utils.convertArrayObjectIdtoStringOfObjectId(mergedData);

        //finding solutions which are not targtted but user has submitted.
        const resourcesWithPreviousProfile = _.differenceWith(
          solutionIds,
          allTargetedSolutionIds
        );

        /**
         * @function solutionDocuments
         * @param {Object} of solutionIds
         * @project [Array] of projections
         *
         * @return [{Objects}] array of solutions documents
         * // will get all the solutions documents based on all profile
         */
        const solutionsWithPreviousProfile =
          await solutionsHelper.solutionDocuments(
            { _id: { $in: resourcesWithPreviousProfile } },
            [
              "name",
              "description",
              "programName",
              "programId",
              "externalId",
              "projectTemplateId",
              "type",
              "language",
              "creator",
              "endDate",
              "link",
              "referenceFrom",
              "entityType",
              "certificateTemplateId",
            ]
          );
        //Pushing all the solutions document which user started with previous profile
        mergedData.push(...solutionsWithPreviousProfile);
        //incressing total count of solutions in program
        totalCount += solutionsWithPreviousProfile.length;

        mergedData = mergedData.map((targetedData, index) => {
          if (targetedData.type == constants.common.IMPROVEMENT_PROJECT) {
            projectSolutionIdIndexMap[targetedData._id.toString()] = index;
          }
          delete targetedData.programId;
          delete targetedData.programName;
          return targetedData;
        });

        if (
          (type =
            constants.common.IMPROVEMENT_PROJECT ||
            type === constants.common.EMPTY_STRING)
        ) {
          // Get projects already started by a user in a given program
          let importedProjects =
            await improvementProjectService.importedProjects(token, programId);

          // Add projectId to the solution object if the user has already started a project for the improvement project solution.

          if (importedProjects.success) {
            if (importedProjects.data && importedProjects.data.length > 0) {
              importedProjects.data.forEach((importedProject) => {
                if (
                  projectSolutionIdIndexMap[
                    importedProject.solutionInformation._id
                  ] !== undefined
                ) {
                  mergedData[
                    projectSolutionIdIndexMap[
                      importedProject.solutionInformation._id
                    ]
                  ].projectId = importedProject._id;
                } else {
                  let data = importedProject.solutionInformation;
                  data["projectTemplateId"] = importedProject.projectTemplateId;
                  data["projectId"] = importedProject._id;
                  data["type"] = constants.common.IMPROVEMENT_PROJECT;
                  // if project is having certificate pass certificateTemplateId details with solution details.
                  if (
                    importedProject.certificate &&
                    importedProject.certificate.templateId
                  ) {
                    data["certificateTemplateId"] =
                      importedProject.certificate.templateId;
                  }
                  mergedData.push(data);
                  totalCount = totalCount + 1;
                }
              });
            }
          }
        }
        if (mergedData.length > 0) {
          let startIndex = pageSize * (pageNo - 1);
          let endIndex = startIndex + pageSize;
          mergedData = mergedData.slice(startIndex, endIndex);
        }

        // get all solutionIds of type survey
        let surveySolutionIds = [];
        mergedData.forEach((element) => {
          if (element.type === constants.common.SURVEY) {
            surveySolutionIds.push(element._id);
          }
        });

        if (surveySolutionIds.length > 0) {
          let userSurveySubmission = await surveyService.assignedSurveys(
            token, //userToken
            "", //search text
            "", //filter
            false, //surveyReportPage
            surveySolutionIds //solutionIds
          );

          if (
            userSurveySubmission.success &&
            userSurveySubmission.data &&
            userSurveySubmission.data.data &&
            userSurveySubmission.data.data.length > 0
          ) {
            for (
              let surveySubmissionPointer = 0;
              surveySubmissionPointer < userSurveySubmission.data.data.length;
              surveySubmissionPointer++
            ) {
              for (
                let mergedDataPointer = 0;
                mergedDataPointer < mergedData.length;
                mergedDataPointer++
              ) {
                if (
                  mergedData[mergedDataPointer].type ==
                    constants.common.SURVEY &&
                  userSurveySubmission.data.data[surveySubmissionPointer]
                    .solutionId == mergedData[mergedDataPointer]._id
                ) {
                  mergedData[mergedDataPointer].submissionId =
                    userSurveySubmission.data.data[
                      surveySubmissionPointer
                    ].submissionId;
                  break;
                }
              }
            }
          }
        }

        let result = {
          programName: programData[0].name,
          programId: programId,
          programEndDate: programData[0].endDate,
          description: programData[0].description
            ? programData[0].description
            : constants.common.TARGETED_SOLUTION_TEXT,
          rootOrganisations:
            programData[0].rootOrganisations &&
            programData[0].rootOrganisations.length > 0
              ? programData[0].rootOrganisations[0]
              : "",
          data: mergedData,
          count: totalCount,
          programEndDate: programData[0].endDate,
        };
        if (programData[0].hasOwnProperty("requestForPIIConsent")) {
          result.requestForPIIConsent = programData[0].requestForPIIConsent;
        }
        //Check data present in programUsers collection.
        //checkForUserJoinedProgramAndConsentShared will returns an object which contain joinProgram and consentShared status.
        let programJoinStatus =
          await programUsersHelper.checkForUserJoinedProgramAndConsentShared(
            programId,
            userId
          );
        result.programJoined = programJoinStatus.joinProgram;
        result.consentShared = programJoinStatus.consentShared;

        return resolve({
          message: constants.apiResponses.PROGRAM_SOLUTIONS_FETCHED,
          success: true,
          data: result,
        });
      } catch (error) {
        return resolve({
          success: false,
          data: {
            description: constants.common.TARGETED_SOLUTION_TEXT,
            data: [],
            count: 0,
          },
        });
      }
    });
  }

  /**
   * User targeted programs.
   * @method
   * @name programs
   * @param {Object} bodyData - request body data.
   * @param {String} pageNo - Page number.
   * @param {String} pageSize - Page size.
   * @param {String} searchText - Search text.
   * @param {String} userId - User Id.
   * @returns {Array} - Get user targeted programs.
   */

  static programs(bodyData, pageNo, pageSize, searchText, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        let programDetails = {};
        let targetedProgramIds = [];
        let alreadyStartedProgramsIds = [];
        let programCount = 0;
        //get all programs which user has joined irrespective of targeted and non targeted programs
        let alreadyStartedPrograms = await this.getUserJoinedPrograms(
          searchText,
          userId
        );

        if (alreadyStartedPrograms.success && alreadyStartedPrograms.data) {
          alreadyStartedProgramsIds = alreadyStartedPrograms.data;
        }

        // getting all program details matching the user profile. not passing pageSize and pageNo to get all data.
        let targetedPrograms = await programsHelper.forUserRoleAndLocation(
          bodyData,
          "", // not passing page size
          "", // not passing page number
          searchText,
          ["_id"]
        );

        // targetedPrograms.data contain all programIds targeted to current user profile.
        if (
          targetedPrograms.success &&
          targetedPrograms.data &&
          targetedPrograms.data.length > 0
        ) {
          targetedProgramIds = gen.utils.arrayOfObjectToArrayOfObjectId(
            targetedPrograms.data
          );
        }
        // filter tagregeted program ids if any targetedProgramIds are prsent in alreadyStartedPrograms then remove that
        let allTargetedProgramButNotJoined = _.differenceWith(
          targetedProgramIds,
          alreadyStartedProgramsIds,
          _.isEqual
        );

        //find total number of programs related to user
        let userRelatedPrograms = alreadyStartedProgramsIds.concat(
          allTargetedProgramButNotJoined
        );
        //total number of programs
        programCount = userRelatedPrograms.length;
        if (!(userRelatedPrograms.length > 0)) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          };
        }

        // Splitting the userRelatedPrograms array based on the page number and size.
        // The returned data is not coming in the order of userRelatedPrograms elements when all the IDs are passed.
        // We can't add a sort to the programDocuments function because it will also sort programs joined from the previous profile, which should come at the end of the list for us.
        // We have two requirements:
        // 1. Current profile programs should come in the order of their creation.
        // 2. Previous profile programs should always come last.
        let startIndex = pageSize * (pageNo - 1);
        let endIndex = startIndex + pageSize;
        userRelatedPrograms = userRelatedPrograms.slice(startIndex, endIndex);

        //fetching all the programsDocuments
        let userRelatedProgramsData = await programsHelper.programDocuments(
          { _id: { $in: userRelatedPrograms } },
          ["name", "externalId", "metaInformation"],
          "none", //not passing skip fields
          "", // not passing pageSize
          "" // not passing pageNo
        );

        if (!(userRelatedProgramsData.length > 0)) {
          throw {
            message: constants.apiResponses.PROGRAM_NOT_FOUND,
          };
        }

        // programDocuments function will not return result in the order which ids are passed. This code block will ensure that the response is rearranged in correct order
        // We can't implement sort logic in programDocuments function because userRelatedPrograms can contain prev profile programs also
        let programsResult = userRelatedPrograms.map((id) => {
          return userRelatedProgramsData.find(
            (data) => data._id.toString() === id.toString()
          );
        });

        programDetails.data = programsResult;
        programDetails.count = programCount;
        programDetails.description = constants.apiResponses.PROGRAM_DESCRIPTION;

        return resolve({
          success: true,
          message: constants.apiResponses.PROGRAMS_FETCHED,
          data: programDetails,
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: {
            description: constants.common.TARGETED_SOLUTION_TEXT,
            data: [],
            count: 0,
          },
        });
      }
    });
  }

  /**
   * List of entity types by location and role.
   * @method
   * @name entityTypesByLocationAndRole
   * @param {String} stateLocationId - state location id.
   * @param {String} role - role.
   * @returns {Object} returns a list of entity type by location and role.
   */
  static entityTypesByLocationAndRole(stateLocationId, role) {
    return new Promise(async (resolve, reject) => {
      try {
        let entityKey = constants.common.SUBENTITY + stateLocationId;
        const rolesDocument = await userRolesHelper.roleDocuments(
          {
            code: role.toUpperCase(),
          },
          ["_id", "entityTypes.entityType"]
        );

        if (!(rolesDocument.length > 0)) {
          throw {
            message: constants.apiResponses.USER_ROLES_NOT_FOUND,
          };
        }

        let bodyData = {};
        if (gen.utils.checkValidUUID(stateLocationId)) {
          bodyData = {
            id: stateLocationId,
          };
        } else {
          bodyData = {
            code: stateLocationId,
          };
        }

        let entityData = await userService.locationSearch(bodyData);

        if (!entityData.success) {
          throw {
            message: constants.apiResponses.ENTITIES_NOT_EXIST_IN_LOCATION,
          };
        }

        let entityTypes = [];
        let stateEntityExists = false;

        rolesDocument[0].entityTypes.forEach((roleDocument) => {
          if (roleDocument.entityType === constants.common.STATE_ENTITY_TYPE) {
            stateEntityExists = true;
          }
        });

        if (stateEntityExists) {
          entityTypes = [constants.common.STATE_ENTITY_TYPE];
        } else {
          let entitiesMappingForm = await this.entitiesMappingForm(
            entityData.data[0].code,
            rolesDocument[0]._id,
            entityKey
          );

          entitiesMappingForm.result.forEach((entitiesMappingData) => {
            entityTypes.push(entitiesMappingData.field);
          });
        }

        return resolve({
          success: true,
          message: constants.apiResponses.ENTITY_TYPES_FETCHED,
          data: entityTypes,
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
        });
      }
    });
  }

  /**
   * User Targeted entity.
   * @method
   * @name targetedEntity
   * @param {String} solutionId - solution id
   * @param {Object} requestedData - requested data
   * @returns {Object} - Details of the solution.
   */

  static targetedEntity(solutionId, requestedData) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsHelper.solutionDocuments(
          {
            _id: solutionId,
            isDeleted: false,
          },
          ["entityType", "type"]
        );

        if (!(solutionData.length > 0)) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }
        let rolesDocument = await userRolesHelper.roleDocuments(
          {
            code: requestedData.role,
          },
          ["entityTypes.entityType"]
        );

        if (!(rolesDocument.length > 0)) {
          throw {
            status: httpStatusCode["bad_request"].status,
            message: constants.apiResponses.USER_ROLES_NOT_FOUND,
          };
        }

        let requestedEntityTypes = Object.keys(_.omit(requestedData, ["role"]));
        let targetedEntityType = "";

        rolesDocument[0].entityTypes.forEach((singleEntityType) => {
          if (requestedEntityTypes.includes(singleEntityType.entityType)) {
            targetedEntityType = singleEntityType.entityType;
          }
        });

        if (!requestedData[targetedEntityType]) {
          throw {
            status: httpStatusCode["bad_request"].status,
            message: constants.apiResponses.ENTITIES_NOT_ALLOWED_IN_ROLE,
          };
        }
        let filterData = {};
        if (solutionData[0].entityType === targetedEntityType) {
          // if solution entity type and user tageted entity type are same
          if (gen.utils.checkValidUUID(requestedData[targetedEntityType])) {
            filterData = {
              parentId: requestedData[targetedEntityType],
            };
            let entitiesData = await userService.locationSearch(filterData);
            if (entitiesData.success) {
              targetedEntityType = constants.common.STATE_ENTITY_TYPE;
            }
          } else if (targetedEntityType === constants.common.SCHOOL) {
            targetedEntityType = constants.common.STATE_ENTITY_TYPE;
          }
        }

        if (gen.utils.checkValidUUID(requestedData[targetedEntityType])) {
          filterData = {
            id: requestedData[targetedEntityType],
          };
        } else {
          filterData = {
            code: requestedData[targetedEntityType],
          };
        }
        let entitiesDocument = await userService.locationSearch(filterData);
        if (!entitiesDocument.success) {
          throw {
            message: constants.apiResponses.ENTITY_NOT_FOUND,
          };
        }

        let entityData = entitiesDocument.data;
        let entityDataFormated = {
          _id: entityData[0].id,
          entityType: entityData[0].type,
          entityName: entityData[0].name,
        };
        return resolve({
          message: constants.apiResponses.SOLUTION_TARGETED_ENTITY,
          success: true,
          data: entityDataFormated,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }

  /**
   * Highest Targeted entity.
   * @method
   * @name getHighestTargetedEntity
   * @param {Object} requestedData - requested data
   * @returns {Object} - Entity.
   */

  static getHighestTargetedEntity(roleWiseTargetedEntities, requestedData) {
    return new Promise(async (resolve, reject) => {
      try {
        let entityKey = constants.common.SUBENTITY + requestedData.state;
        let subEntityTypes = [];
        let cacheData = await cache.getValue(entityKey);

        if (!cacheData) {
          let filterData = {
            id: requestedData.state,
          };

          let entitiesData = await userService.locationSearch(filterData);

          if (!entitiesData.success) {
            return resolve({
              message: constants.apiResponses.ENTITY_NOT_FOUND,
              result: [],
            });
          }
          let stateLocationCode = entitiesData.data[0].code;
          subEntityTypes = await formService.configForStateLocation(
            stateLocationCode,
            entityKey
          );
          if (!(subEntityTypes.length > 0)) {
            return resolve({
              message: constants.apiResponses.ENTITY_NOT_FOUND,
              result: [],
            });
          }
        } else {
          subEntityTypes = cacheData;
        }

        let targetedIndex = subEntityTypes.length;
        let roleWiseTarget;
        for (
          let roleWiseEntityIndex = 0;
          roleWiseEntityIndex < roleWiseTargetedEntities.length;
          roleWiseEntityIndex++
        ) {
          for (
            let subEntitiesIndex = 0;
            subEntitiesIndex < subEntityTypes.length;
            subEntitiesIndex++
          ) {
            if (
              roleWiseTargetedEntities[roleWiseEntityIndex].entityType ==
              subEntityTypes[subEntitiesIndex]
            ) {
              if (subEntitiesIndex < targetedIndex) {
                targetedIndex = subEntitiesIndex;
                roleWiseTarget = roleWiseEntityIndex;
              }
            }
          }
        }
        let targetedEntity = roleWiseTargetedEntities[roleWiseTarget];
        return resolve({
          message: constants.apiResponses.SOLUTION_TARGETED_ENTITY,
          success: true,
          data: targetedEntity,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }

  /**
   * Find non-targeted joined program.
   * @method
   * @name getUserJoinedPrograms
   * @param {String} searchText - search text
   * @param {String} userId - userId
   * @returns {Object} - non-targeted joined program details.
   */
  static getUserJoinedPrograms(searchText = "", userId) {
    return new Promise(async (resolve, reject) => {
      try {
        let programUsersIds = [];
        let alreadyStartedPrograms = [];

        // find all programs joined by the user
        // programUsersData will contain list of programs joined by user from all the profiles. This can be considered as the super set of user programs
        let programUsersData = await programUsersHelper.programUsersDocuments(
          {
            userId: userId,
          },
          ["programId"],
          "none", // not passing skip fields
          { updatedAt: -1 } // sort data.
        );

        if (programUsersData.length > 0) {
          programUsersIds = programUsersData.map(function (obj) {
            return obj.programId;
          });
        }

        if (programUsersIds.length > 0) {
          let findQuery = {
            _id: { $in: programUsersIds },
            isAPrivateProgram: false,
          };

          //call program details to check if the program is active or not
          let programDetails = await programsHelper.list(
            "", // not passing page number
            "", // not passing page size
            searchText,
            findQuery,
            ["_id"]
          );

          // get _ids to array
          if (
            programDetails.success > 0 &&
            programDetails.data &&
            programDetails.data.data &&
            programDetails.data.data.length > 0
          ) {
            // programsDetails will return all the program dcouments but it will be not sorted and we have programUsersIds that is sorted based on that will sort Ids
            // We can't implement sort logic in programDocuments function because userRelatedPrograms can contain prev profile programs also
            let programDetailsResponse = programDetails.data.data;
            let programsResult = _.filter(programUsersIds, (id) =>
              _.find(
                programDetailsResponse,
                (data) => data._id.toString() === id.toString()
              )
            );
            // get all the programs ids in array
            alreadyStartedPrograms =
              gen.utils.arrayOfObjectToArrayOfObjectId(programsResult);
          }
        }

        return resolve({
          success: true,
          data: alreadyStartedPrograms,
          count: alreadyStartedPrograms.length,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : httpStatusCode["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }
    /**
   * Get overall Stats of the User
   * @method
   * @name getAllStats
   * @param {String} userId - userId
   * @param {String} userToken - userToken
   * @param {String} type - type
   * @returns {Object} - returns overall stats or targeted records based on type
   */
  static getAllStats({ userId,userToken, type, requestPdf }) {
    return new Promise(async (resolve, reject) => {
      try {
          let overview;
          switch (type) {
            case constants.common.OBSERVATION:
              overview = await surveyService.getObservationInfo(userToken);
              break;
            case constants.common.PROJECT:
              overview =
                await improvementProjectService.listProjectOverviewInfo({
                  stats: "false",
                  userToken,
                });
              break;
            case constants.common.SURVEY:
              overview = await surveyService.userSurveyOverView(
                userToken,
                false
              );
              break;
            case constants.common.PROGRAM.toLowerCase():
              overview = await programUsersHelper.userProgram(userId, false);
              break;
            default:
              let [
                improvementProjectServiceCount,
                observationCount,
                programCount,
                suveyCount,
              ] = await Promise.all([
                improvementProjectService.listProjectOverviewInfo({
                  stats: "true",
                  userToken,
                }),
                surveyService.getObservationInfo(userToken, "true"),
                programUsersHelper.userProgram(userId, true),
                surveyService.userSurveyOverView(userToken, true),
              ]);
    
             let listOfBigNumbers = {
                improvementProjectServiceCount: improvementProjectServiceCount.data,
                observationCount: observationCount.data.count,
                programCount: programCount.data,
                suveyCount: suveyCount.data,
              };
    
              overview = {data:listOfBigNumbers};
              overview.pdfGenerated = false;
              if(requestPdf)
              {
                let reportData = await reportService.generateStatsReport(overview,userToken);
                if(!reportData.success){
                  reject('PDF generation failed.');
                }
                overview.pdfUrl = reportData.data;
              }
          }
          return resolve({
            success: true,
            message: `data ${constants.apiResponses.FETCH_SUCCESS}`,
            data: overview.data,
            pdfUrl:overview.pdfUrl
          });

      } catch (error) {
        reject(error);
      }
    });
  }
};

// /**
//  * Generate program creation data.
//  * @method
//  * @name _createProgramData
//  * @returns {Object} - program creation data
//  */

// function _createProgramData(
//   name,
//   externalId,
//   isAPrivateProgram,
//   status,
//   description,
//   userId,
//   startDate,
//   endDate,
//   createdBy = ""
// ) {

//   let programData = {};
//   programData.name = name;
//   programData.externalId = externalId;
//   programData.isAPrivateProgram = isAPrivateProgram;
//   programData.status = status;
//   programData.description = description;
//   programData.userId = userId;
//   programData.createdBy = createdBy;
//   programData.startDate = startDate;
//   programData.endDate = endDate;
//   return programData;
// }

// /**
//  * Generate solution creation data.
//  * @method
//  * @name _createSolutionData
//  * @returns {Object} - solution creation data
//  */

// function _createSolutionData(
//   name = "",
//   externalId = "",
//   isAPrivateProgram = "",
//   status,
//   description = "",
//   userId,
//   isReusable = "",
//   parentSolutionId = "",
//   type = "",
//   subType = "",
//   updatedBy = "",
//   projectTemplateId = ""
// ) {
//   let solutionData = {};
//   solutionData.name = name;
//   solutionData.externalId = externalId;
//   solutionData.isAPrivateProgram = isAPrivateProgram;
//   solutionData.status = status;
//   solutionData.description = description;
//   solutionData.author = userId;
//   if (parentSolutionId) {
//     solutionData.parentSolutionId = parentSolutionId;
//   }
//   if (type) {
//     solutionData.type = type;
//   }
//   if (subType) {
//     solutionData.subType = subType;
//   }
//   if (updatedBy) {
//     solutionData.updatedBy = updatedBy;
//   }
//   if (isReusable) {
//     solutionData.isReusable = isReusable;
//   }
//   if (projectTemplateId) {
//     solutionData.projectTemplateId = projectTemplateId;
//   }

//   return solutionData;
// }