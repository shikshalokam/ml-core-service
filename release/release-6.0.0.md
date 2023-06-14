# Release Note 6.0.0 ML Core Service

This version contains various critical tasks that must be completed in order to improve our system's functioning. Please consider the following list of tasks to be completed.

## Migrations

In this release, we have introduced a new feature that includes program start and end dates. To maintain consistency, it is necessary to execute a migration script that updates the existing programs with the start and end date information. Here are the steps to execute the migration script.

### Step 1:

    Navigate to migrations/programs-startDate-EndDate-6.0/

### Step 2:

Run the script which will add startDate and endDate to programs.

    node setProgramsStartDateAndEndDate.js

## Devops Changes:

### Added a New Kafka Topic

The DevOps repository has already been updated with the new Kafka topic that we recently introduced. This subject will make it easier for system components to communicate and exchange data.

    Login To the Jenkins
    Go to Dashboard -> Deploy -> dev {Environment} ->Kubernatives, then click on KafkaSetup
    Click on Build with parameters -> build
    After the KafkaSetup job is finished, From Kubernatives, click on KafkaSetup
    Then Click on Build with parameters -> build

### New Environment Keys Added

We added new environment keys to the DevOps repository to accommodate the new features and functionality. For configuration and access to outside services or resources, these keys will be utilised.

Please note you don't need to deploy the DevOps repo. Once the PR is merged, deploy your service, env variable will automatically add from the DevOps branch.

### Created New APIs and Running the Kong File

We have created new APIs as part of this version to provide the system more capability. The Kong file must be run in order to guarantee seamless integration and effective routing of these APIs. This will make it possible to manage and map API endpoints properly.

#### For Public APIs

There is no automatic deployment in the DevOps repo. We need to deploy it manually. To deploy the kong file changes please follow the below steps

    Login To the Jenkins
    Go to Dashboard -> Deploy -> dev {Environment} ->Kubernatives, then click on OnboardAPIs
    Click on Build with parameters -> build
    After the OnboardAPIs job is finished, From Kubernatives, click on OnboardConsumers
    Then Click on Build with parameters -> build

### Deploy ml-core-services

there is no automatic deployment in ml-core-services repo. We need to deploy it manually. To deploy the kong file changes please follow below steps

    Login to jenkins
    Go to Dashboard -> Build -> managed-learn -> ml-core-service
    Click on Build with parameter and add release-6.0.0 -> Build (This is for Dev environments only it will change based on environment)
    After Job is finished Go to Dashboard -> deploy -> dev {Environment it will change} -> managed-learn -> ml-core-service
    After 10 min check this job is excuted or not automatically if not then click on Build with parameter and deploy manually
