# ml-core-service
Centralised Service to support other Services.
It is used by ml-survey and ml-project

### Migrations for entity generalization
Steps to run the migration files
-  Navigate to migrations/entity-5.0/ folder
-  The first script which convert mongoId to locationId. To run the script use the below command,
    > run entityToLocationId.js
- Run the final script which add entity hierarchy to the existing observationSubmissions & project collections.
    >  run addHierarchy.js 

