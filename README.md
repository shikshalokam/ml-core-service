# ml-core-service

This is ml-core-services, the managed-learn component responsible for creating programs and solutions within the managed learn services. It also includes user extensions for enhanced functionality.

# Setup Guide

## Pre-Requisite

- Install any IDE in your system(eg: VScode etc..)
- Install nodejs from : https://nodejs.org/en/download/
- Install mongoDB: https://docs.mongodb.com/manual/installation/
- Install Robo 3T: ​​https://robomongo.org/

Basic understanding of git and github is recommended.

- https://www.youtube.com/watch?v=RGOj5yH7evk&t=2s
- https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F

## Setup ml-core-services

### Clone the service repository onto your system

- Create a new folder where you want to clone the repository.
- Navigate to that directory using the terminal.
- Execute the git commands to clone the repository using the provided link from the code tab.

Git link

    https://github.com/shikshalokam/ml-core-service.git

command to clone

    git clone https://github.com/shikshalokam/ml-core-service.git

### Create .env file

Create a file named `.env` and copy the environment-specific data corresponding to that service into the `.env` file.

    # Environment configurations file
    APPLICATION_PORT = "3000"                                                       // Application port number
    APPLICATION_ENV = "development"                                                 // Application running enviornment

    # Mongo DB Configuration
    MONGODB_URL = "mongodb://localhost:27017/sl-prod"                               // Mongo DB URL

    INTERNAL_ACCESS_TOKEN = "Fg*************yr"                                     // Internal access token for accessing Internal services APIs

    #Cloud Storage Configuration
    CLOUD_STORAGE = "AWS/GC/AZURE"                                                  // Cloud storage provider.

    # Google Cloud Configuration
    GCP_PATH = "./generics/helpers/credentials/storage.json"                        // Path to the the Google cloud authentication key
    GCP_BUCKET_NAME = "gcp bucket name"                                             // Google cloud bucket name

    # Azure Cloud Configuration
    AZURE_ACCOUNT_NAME = "AZURE_KEY"                                                // Azure account name
    AZURE_ACCOUNT_KEY = "Ih..............NBN"                                       // Azure account key
    AZURE_STORAGE_CONTAINER = "Azure_bucket"                                        // Azure container/bucket name

    # AWS Cloud Configuration
    AWS_ACCESS_KEY_ID = "AK...........WA"                                           // Aws cloud storage access key id
    AWS_SECRET_ACCESS_KEY = "QB......................9sB"                           // Aws cloud storage access key
    AWS_BUCKET_NAME = "aws bucket name"                                             // Aws cloud storage bucket name
    AWS_BUCKET_REGION = "ap-south-1"                                                // Aws cloud storgae region
    AWS_BUCKET_ENDPOINT = "s3.ap-south-1.amazonaws.com"                             // Aws cloud storage api's endpoint

    # OFFLINE TOKEN VALIDATION
    KEYCLOAK_PUBLIC_KEY_PATH = "keycloak-public-keys"                               // Path to Offline token public key

    # ML Survey Service
    ML_SURVEY_SERVICE_URL = "http://ml-survey-service:3000"                         // ML Survey service url

    # ML Project Service Service
    ML_PROJECT_SERVICE_URL = "http://ml-project-service:3000"                            // ML Project service url

    #USER service
    USER_SERVICE_URL = "http://user-service:3000"                                   // Base url of the sunbird enviornment

    CSV_REPORTS_PATH = "public/report"                                              // Report path

    APP_PORTAL_BASE_URL = "https://dev.sunbirded.org"

    FORM_SERVICE_URL = "http://player:3000"                                         // Base url for form search

    # Oracle Cloud Configuration
    OCI_ACCESS_KEY_ID = '23b90..............d01d'                                   // Oracle cloud storage access key Id
    OCI_SECRET_ACCESS_KEY = '22levMw5Ci............SmNE='                           // Oracle cloud storage secret access key
    OCI_BUCKET_NAME = 'oracle cloud bucket name'                                    // Oracle cloud bucket name
    OCI_BUCKET_REGION = 'ap-hyderabad-1'                                            // Oracle cloud bucket region
    OCI_BUCKET_ENDPOINT = 'https://pmt5.compat.storage.ap-h1.oraclecloud.com'       // Oracle cloud bucket endPoint

    # KAFKA Configurations
    KAFKA_COMMUNICATIONS_ON_OFF = "ON/OFF"                                               // Kafka enable or disable communication flag
    KAFKA_URL = "100.0.0.1:9092"                                                 // IP address of kafka server with port without HTTP
    KAFKA_GROUP_ID = "mlcore"                                                       // Kafka group id
    PROGRAM_USERS_JOINED_TOPIC = "dev.programuser.info"                              // Kafka submission topic for pushing program joined user's data

### Install Dependencies

To install dependencies from a `package.json` file in Visual Studio Code, you can use the integrated terminal. Here are the steps:

- Open the integrated terminal by going to View > Terminal or using the shortcut Ctrl+` (backtick).
- In the terminal, navigate to the directory where the package.json file is located.
- Run the command `npm install` or `yarn install`, depending on your preferred package manager.
- The package manager will read the package.json file and install all the dependencies specified in it.
- Wait for the installation process to complete. You should see progress indicators or a success message for each installed dependency.
- Once the installation is finished, the dependencies listed in the package.json file will be installed in a node_modules directory in your project.

### Setting the keycloak

- Create a folder on service directory named: `keycloak-public-keys`
- Inside that folder create a file `GRxxx....................xxxxx60fA`

**for keycloak file please contact Backend Team**

### Setup Database

Before proceeding with these steps, ensure that you have MongoDB installed on your computer. For a graphical user interface (GUI) for MongoDB, you can choose to install Robo 3T.

- Obtain the latest database dump from the backend team.
- Restore the database in your local environment using the following command:

  For Windows/Linux:
  `mongorestore <name you want to give the db>  <directory or file to restore>`

  For macOS: `mongorestore -d <name you want to give the db>  <directory or file to restore>`

Note: Add `<name you want to give the db>` to mongoDB url in `.env` file.

### DB Schema

The schema serves as a blueprint for creating and maintaining the database that supports the ML core services' data storage and retrieval operations.

![ML-Core Service](https://ml-services-uploads.s3.ap-south-1.amazonaws.com/DBSchema/ML-Core.png)

[Click here](https://ml-services-uploads.s3.ap-south-1.amazonaws.com/DBSchema/ML-Core.pdf) for DB schema and corresponding examples in a PDF format.

### Postman Collection

The ML Core Service Postman Collection is a comprehensive resource for interacting with the ML Core Service. It includes organized endpoints, detailed documentation, and example workflows, providing a valuable reference for developers. Leverage this collection to enhance productivity and collaboration in ML projects.

[Click here](https://documenter.getpostman.com/view/7997930/2s946chuaT)

## IMPORTANT:

Always work on branches. **Never make changes to master**.

Creating a branch from master.

For more information on git you can use :  
 https://education.github.com/git-cheat-sheet-education.pdf
