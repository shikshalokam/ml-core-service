let table = require("cli-table");
var Log = require("log");
let log = new Log("debug");
let tableData = new table();

let enviromentVariables = {
  APPLICATION_PORT: {
    message: "Required port no",
    optional: false,
  },
  APPLICATION_ENV: {
    message: "Required node environment",
    optional: false,
  },
  MONGODB_URL: {
    message: "Required mongodb url",
    optional: false,
  },
  INTERNAL_ACCESS_TOKEN: {
    message: "Required internal access token",
    optional: false,
  },
  CLOUD_STORAGE_PROVIDER: {
    message: "Require cloud storage provider",
    optional: false,
  },
  CLOUD_STORAGE_SECRET: {
    message: "Require client storage provider identity",
    optional: false,
  },
  CLOUD_STORAGE_BUCKETNAME: {
    message: "Require client storage bucket name",
    optional: false,
  },
  KEYCLOAK_PUBLIC_KEY_PATH: {
    message: "Required keycloak public key path",
    optional: false,
  },
  ML_SURVEY_SERVICE_URL: {
    message: "Required survey service API endpoint",
    optional: false,
  },
  ML_PROJECT_SERVICE_URL: {
    message: "Required project service API endpoint",
    optional: false,
  },
  USER_SERVICE_URL: {
    message: "Sunbird environment base url",
    optional: false,
  },
  CSV_REPORTS_PATH: {
    message: "CSV Report Path",
    optional: true,
    default: "public/reports",
  },
  APP_PORTAL_BASE_URL: {
    message: "App Portal base url",
    optional: true,
    default: "https://dev.sunbirded.org",
  },
  FORM_SERVICE_URL: {
    message: "Form service base url",
    optional: true,
    default: "http://player:3000",
  },
  KAFKA_COMMUNICATIONS_ON_OFF: {
    message: "Enable/Disable kafka communications",
    optional: false,
  },
  KAFKA_URL: {
    message: "Required Kafka Url",
    optional: true,
    requiredIf: {
      key: "KAFKA_COMMUNICATIONS_ON_OFF",
      operator: "EQUALS",
      value: "ON",
    },
  },
  KAFKA_GROUP_ID: {
    message: "Required kafka group id",
    optional: false,
  },
  USER_DELETE_TOPIC: {
    message: "Required user delete kafka topic",
    optional: false,
  },
  ID: {
    message: "Required Platform ID",
    optional: false,
  },
  TELEMETRY_TOPIC: {
    message: "Required telemetry topic",
    optional: false,
  },
  PROGRAM_USERS_JOINED_TOPIC: {
    message: "OFF/TOPIC_NAME",
    optional: false,
  },
  TIMEZONE_DIFFRENECE_BETWEEN_LOCAL_TIME_AND_UTC: {
    message: "Timezone diffrence required",
    optional: true,
    default: "+05:30",
  },
};

let success = true;

module.exports = function () {
  Object.keys(enviromentVariables).forEach((eachEnvironmentVariable) => {
    let tableObj = {
      [eachEnvironmentVariable]: "PASSED",
    };

    let keyCheckPass = true;
    let validRequiredIfOperators = ["EQUALS", "NOT_EQUALS"];

    if (
      enviromentVariables[eachEnvironmentVariable].optional === true &&
      enviromentVariables[eachEnvironmentVariable].requiredIf &&
      enviromentVariables[eachEnvironmentVariable].requiredIf.key &&
      enviromentVariables[eachEnvironmentVariable].requiredIf.key != "" &&
      enviromentVariables[eachEnvironmentVariable].requiredIf.operator &&
      validRequiredIfOperators.includes(
        enviromentVariables[eachEnvironmentVariable].requiredIf.operator
      ) &&
      enviromentVariables[eachEnvironmentVariable].requiredIf.value &&
      enviromentVariables[eachEnvironmentVariable].requiredIf.value != ""
    ) {
      switch (
        enviromentVariables[eachEnvironmentVariable].requiredIf.operator
      ) {
        case "EQUALS":
          if (
            process.env[
              enviromentVariables[eachEnvironmentVariable].requiredIf.key
            ] === enviromentVariables[eachEnvironmentVariable].requiredIf.value
          ) {
            enviromentVariables[eachEnvironmentVariable].optional = false;
          }
          break;
        case "NOT_EQUALS":
          if (
            process.env[
              enviromentVariables[eachEnvironmentVariable].requiredIf.key
            ] != enviromentVariables[eachEnvironmentVariable].requiredIf.value
          ) {
            enviromentVariables[eachEnvironmentVariable].optional = false;
          }
          break;
        default:
          break;
      }
    }

    if (enviromentVariables[eachEnvironmentVariable].optional === false) {
      if (
        !process.env[eachEnvironmentVariable] ||
        process.env[eachEnvironmentVariable] == ""
      ) {
        success = false;
        keyCheckPass = false;
      } else if (
        enviromentVariables[eachEnvironmentVariable].possibleValues &&
        Array.isArray(
          enviromentVariables[eachEnvironmentVariable].possibleValues
        ) &&
        enviromentVariables[eachEnvironmentVariable].possibleValues.length > 0
      ) {
        if (
          !enviromentVariables[eachEnvironmentVariable].possibleValues.includes(
            process.env[eachEnvironmentVariable]
          )
        ) {
          success = false;
          keyCheckPass = false;
          enviromentVariables[
            eachEnvironmentVariable
          ].message += ` Valid values - ${enviromentVariables[
            eachEnvironmentVariable
          ].possibleValues.join(", ")}`;
        }
      }
    }

    if (
      (!process.env[eachEnvironmentVariable] ||
        process.env[eachEnvironmentVariable] == "") &&
      enviromentVariables[eachEnvironmentVariable].default &&
      enviromentVariables[eachEnvironmentVariable].default != ""
    ) {
      process.env[eachEnvironmentVariable] =
        enviromentVariables[eachEnvironmentVariable].default;
    }

    if (!keyCheckPass) {
      if (enviromentVariables[eachEnvironmentVariable].message !== "") {
        tableObj[eachEnvironmentVariable] =
          enviromentVariables[eachEnvironmentVariable].message;
      } else {
        tableObj[
          eachEnvironmentVariable
        ] = `FAILED - ${eachEnvironmentVariable} is required`;
      }
    }

    tableData.push(tableObj);
  });

  log.info(tableData.toString());

  return {
    success: success,
  };
};
