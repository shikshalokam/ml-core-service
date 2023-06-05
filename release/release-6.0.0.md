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

### New Environment Keys Added

We added new environment keys to the DevOps repository to accommodate the new features and functionality. For configuration and access to outside services or resources, these keys will be utilised.

### Created New APIs and Running the Kong File

We have created new APIs as part of this version to provide the system more capability. The Kong file must be run in order to guarantee seamless integration and effective routing of these APIs. This will make it possible to manage and map API endpoints properly.
