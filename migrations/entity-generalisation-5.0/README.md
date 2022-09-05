### Migrations for entity generalization
Steps to run the migration files
-  Navigate to migrations/entity-generalisation-5.0/ folder
-  The first script which convert mongoId to locationId. To run the script use the below command,
    > run convertEntityIdToLocationId.js
- Run the final script which add entity hierarchy to the existing observationSubmissions & project collections.
    >  run addEntityHierarchyInProjectsAndSubmissions.js 