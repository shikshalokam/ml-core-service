let table = require("cli-table");
var Log = require("log");
let log = new Log("debug");
let tableData = new table();

let enviromentVariables = {
  "APPLICATION_PORT" : {
    "message" : "Required port no",
    "optional" : false
  },
  "APPLICATION_ENV" : {
    "message" : "Required node environment",
    "optional" : false
  },
  "MONGODB_URL" : {
    "message" : "Required mongodb url",
    "optional" : false
  },
  "INTERNAL_ACCESS_TOKEN" : {
    "message" : "Required internal access token",
    "optional" : false
  },
  "CLOUD_STORAGE" : {
    "message" : "Enable/Disable cloud services",
    "optional" : false
  },
  "GCP_PATH" : {
    "message" : "Required Gcp path",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "GC"
    }
  },
  "GCP_BUCKET_NAME" : {
    "message" : "Required Gcp bucket name",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "GC"
    }
  },
  "AZURE_ACCOUNT_NAME" : {
    "message" : "Required Azure Account name",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "AZURE"
    }
  },
  "AZURE_ACCOUNT_KEY" : {
    "message" : "Required Azure Account key",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "AZURE"
    }
  },
  "AZURE_STORAGE_CONTAINER" :  {
    "message" : "Required Azure container",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "AZURE"
    }
  },
  "AWS_ACCESS_KEY_ID" : {
    "message" : "Required Aws access key id",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "AWS"
    }
  }, 
  "AWS_SECRET_ACCESS_KEY" : {
    "message" : "Required Aws secret access key",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "AWS"
    }
  }, 
  "AWS_BUCKET_NAME" : {
    "message" : "Required Aws bucket name",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "AWS"
    }
  }, 
  "AWS_BUCKET_REGION" : {
    "message" : "Required Aws bucket region",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "AWS"
    }
  }, 
  "AWS_BUCKET_ENDPOINT" : {
    "message" : "Required Aws bucket endpoint",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "AWS"
    }
  }, 
  "KEYCLOAK_PUBLIC_KEY_PATH" : {
    "message" : "Required keycloak public key path",
    "optional" : false
  },
  "ML_SURVEY_SERVICE_URL" : {
    "message" : "Required survey service API endpoint",
    "optional" : false
  },
  "ML_PROJECT_SERVICE_URL" : {
    "message" : "Required project service API endpoint",
    "optional" : false
  },
  "USER_SERVICE_URL" : {
    "message" : "Sunbird environment base url",
    "optional" : false
  },
  "CSV_REPORTS_PATH" : {
    "message" : "CSV Report Path",
    "optional" : true,
    "default": "public/reports"
  },
  "APP_PORTAL_BASE_URL" : {
    "message" : "App Portal base url",
    "optional" : true,
    "default": "https://dev.sunbirded.org"
  },
  "FORM_SERVICE_URL" : {
    "message" : "Form service base url",
    "optional" : true,
    "default": "http://player:3000"
  },
  "OCI_ACCESS_KEY_ID" : {
    "message" : "Required oracle access key id",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "OCI"
    }
  }, 
  "OCI_SECRET_ACCESS_KEY" : {
    "message" : "Required Oracle secret access key",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "OCI"
    }
  }, 
  "OCI_BUCKET_NAME" : {
    "message" : "Required Oracle bucket name",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "OCI"
    }
  }, 
  "OCI_BUCKET_REGION" : {
    "message" : "Required Oracle bucket region",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "OCI"
    }
  }, 
  "OCI_BUCKET_ENDPOINT" : {
    "message" : "Required Oracle bucket endpoint",
    "optional" : true,
    "requiredIf" : {
      "key": "CLOUD_STORAGE",
      "operator": "EQUALS",
      "value" : "OCI"
    }
  }, 
}

let success = true;

module.exports = function() {
  Object.keys(enviromentVariables).forEach(eachEnvironmentVariable=>{
  
    let tableObj = {
      [eachEnvironmentVariable] : "PASSED"
    };
  
    let keyCheckPass = true;
    let validRequiredIfOperators = ["EQUALS","NOT_EQUALS"]

    if(enviromentVariables[eachEnvironmentVariable].optional === true
      && enviromentVariables[eachEnvironmentVariable].requiredIf
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key != ""
      && enviromentVariables[eachEnvironmentVariable].requiredIf.operator
      && validRequiredIfOperators.includes(enviromentVariables[eachEnvironmentVariable].requiredIf.operator)
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value != "") {
        switch (enviromentVariables[eachEnvironmentVariable].requiredIf.operator) {
          case "EQUALS":
            if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] === enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
              enviromentVariables[eachEnvironmentVariable].optional = false;
            }
            break;
          case "NOT_EQUALS":
              if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] != enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
                enviromentVariables[eachEnvironmentVariable].optional = false;
              }
              break;
          default:
            break;
        }
    }
      
    if(enviromentVariables[eachEnvironmentVariable].optional === false) {
      if(!(process.env[eachEnvironmentVariable])
        || process.env[eachEnvironmentVariable] == "") {
        success = false;
        keyCheckPass = false;
      } else if (enviromentVariables[eachEnvironmentVariable].possibleValues
        && Array.isArray(enviromentVariables[eachEnvironmentVariable].possibleValues)
        && enviromentVariables[eachEnvironmentVariable].possibleValues.length > 0) {
        if(!enviromentVariables[eachEnvironmentVariable].possibleValues.includes(process.env[eachEnvironmentVariable])) {
          success = false;
          keyCheckPass = false;
          enviromentVariables[eachEnvironmentVariable].message += ` Valid values - ${enviromentVariables[eachEnvironmentVariable].possibleValues.join(", ")}`
        }
      }
    }

    if((!(process.env[eachEnvironmentVariable])
      || process.env[eachEnvironmentVariable] == "")
      && enviromentVariables[eachEnvironmentVariable].default
      && enviromentVariables[eachEnvironmentVariable].default != "") {
      process.env[eachEnvironmentVariable] = enviromentVariables[eachEnvironmentVariable].default;
    }

    if(!keyCheckPass) {
      if(enviromentVariables[eachEnvironmentVariable].message !== "") {
        tableObj[eachEnvironmentVariable] = 
        enviromentVariables[eachEnvironmentVariable].message;
      } else {
        tableObj[eachEnvironmentVariable] = `FAILED - ${eachEnvironmentVariable} is required`;
      }
    }

    tableData.push(tableObj);
  })

  log.info(tableData.toString());

  return {
    success : success
  }
}
