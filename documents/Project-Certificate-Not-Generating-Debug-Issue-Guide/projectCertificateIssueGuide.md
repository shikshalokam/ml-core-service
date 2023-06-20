## Prerequisites for Debugging the Issue Based on the Testing Environment (Pre-prod or Prod):

1. Diksha VPN Access
2. Auth token to enable the use of ML-services admin APIs in prod and IP details
3. Access to Rancher to check ML-services config files ( If server access is there, Rancher access is optional because config files can be obtained using server access)
4. Private ingress (IP) of the environment (Can be used to call RC-services to check responses)
5. Need to cross-check the RC-service tags deployed in the environment

For more details, please refer to the [Sunbird Release Documentation](https://ed.sunbird.org/use/updating-sunbird-releases/5.0.0-to-5.1.0) and check the information provided in the table under the Sunbird RC section.


### Steps to Debug the Issue:

1. **Check RC-Services Deployment**

   - First, check if RC-Services are deployed correctly. To do this, refer to the [Sunbird Release Documentation](https://ed.sunbird.org/use/updating-sunbird-releases/5.0.0-to-5.1.0) and review the details provided in the table below the Sunbird RC section. If there is any difference between the tags mentioned in the documentation and the deployed services, please seek assistance from the DevOps team to deploy the services with the correct tags in the environment.

   - Additionally, verify if the UploadRCSchema job has successfully run in the environment.

   - If the RC-Services deployment and the UploadRCSchema job execution are fine, but the issue still persists, continue to the next step.

2. **Check if ml-project-service is able to fetch the issuer KID value from RC-service**

   - To implement the project certificate feature, changes are done in two ML services: ml-core-services and ml-project-services. We need to check the starting logs of ml-project-services.

   - Access the logs of ml-project-services using server access, Rancher, or Graylog. Look for the logs at the beginning of the service startup.

   - Check if ml-project-service is able to fetch the issuer KID value from RC-service. If the logs show a successful response similar to the following:

     ```
     issuer Kid url: http://registry-service:8081/api/v1/PublicKey/search
     issuer Kid bodyData: {"filters":{}}
     Kid data fetched successfully: 11a4ab1c-****-31eaad4fff8d
     ```

   - If the logs indicate a successful retrieval of the issuer KID value, it means the service is able to fetch it correctly. In this case, proceed to the next step.

   - If the logs say "failed to get kid value from registry service" or there are no logs related to the issuer KID, follow the next set of checks:

     a. Check if the environment configuration file of ml-project-service (`env` file) contains the variable "PROJECT_CERTIFICATE_ON_OFF" and its value is set to "OFF". If so, change its value to "ON". If the variable is not present in the `env` file, you can ignore this. we will set it to "ON" by default internally.

     b. If the previous condition is satisfied, but the issue still persists, manually call the registry service to check if there is any issue with it. Use the following cURL command to call the registry service and retrieve the issuer KID:

        ```bash
        curl --location 'http://{IP}/registry-service/api/v1/PublicKey/search' \
        --header 'Content-Type: application/json' \
        --data '{"filters": {}}'
        ```

        Note: Replace `{IP}` with the appropriate IP address obtained from the DevOps team (as mentioned in prerequisite 4). And make sure you are connected to DIKSHA VPN while using this API for checking.

     c. If the registry service returns an error or does not provide the expected response, you should contact the RC team for further investigation.

     d. **If not able to resolve RC issue, use the following workaround:**

        - If the RC issue cannot be resolved using the previous steps, another workaround is to obtain the issuer KID for the specific environment from the RC team.

        - Add the obtained issuer KID value to the `CERTIFICATE_ISSUER_KID` environment variable in the `ml-projects-service` configuration file (`env`).

3. **Verify Registry Service and Cloud Storage**

   1. After completing the previous three steps, if the project certificate is still failing, we need to check if the registry service is working fine and generating the certificate in the environment.

   2. To verify, fetch the submitted project data with the certificate feature from the database using the DBFind API. Use the following cURL command:

        ```bash
        curl --location --request GET 'http://{internal-kong-IP}/private/mlcore/api/v1/admin/dbFind/projects' \
        --header 'X-authenticated-user-token: eyJhbGci*****WRxPCCpXIjyISRRXhGo6ktI155jN5wmtQa62isOf5O2j3ZDpGGblkc4QQNavjRc1Zq5YM8frVmr187U' \
        --header 'internal-access-token: e7220b7539363210ed15' \
        --header 'Authorization: Bearer eyJhb*****so' \
        --header 'Content-Type: application/json' \
        --data '{
            "query" : {
                "_id": "605084a02df993615443f069"
            },
            "mongoIdKeys" : ["_id"]
        }'
        ```

        Note: Replace `{internal-kong-IP}` with the appropriate internal Kong IP address. Ensure that you have the correct authentication tokens for the headers (`X-authenticated-user-token` and `Authorization`).

   3. In the certificate object of the project data, there will be a `templateUrl`. Check if the data is present in the cloud storage at the specified path.

   4. If the template is present, proceed to check if the registry service is working fine using the following cURL(request body is just sample data, please update it using the project details you fetched) command:

        ```bash
        curl --location 'http://{IP}/registry-service/api/v1/ProjectCertificate?mode=async&callback=http%3A%2F%2Fml-project-service%3A3000%2Fv1%2FuserProjects%2FcertificateCallback' \
        --header 'Content-Type: application/json' \
        --data '{
            "recipient": {
                "id": "7d9ebad3-8a75-4ffe-b1ca-8ef6ed22bcc9",
                "name": "Priyanka",
                "type": "administrator"
            },
            "templateUrl": "https://sunbirdstagingpublic.blob.core.windows.net/samiksha/certificateTemplates/637dacb4d3d5630009bc4acc/ba9aa220-ff1b-4717-b6ea-ace55f04fc16_23-10-2022-1669181140578.svg?sv=2020-10-02&st=2022-11-25T09%3A36%3A21Z&se=2023-11-25T09%3A46%3A21Z&sr=b&sp=rw&sig=SmE1wpGOvmmH%2BAhooWBllruvhaIaXSTJ4H9KBdaT%2FJY%3D",
            "issuer": {
                "name": "Kerala",
                "kid": "d50937e1-9359-4451-a66a-ebee45d1d605"
            },
            "status": "ACTIVE",
            "projectId": "63806c3f8fe5c90008cad120",
            "projectName": "march8/1:30",
            "programId": "6172a6e58cf7b10007eefd21",
            "programName": "Testing 4.4",
            "solutionId": "6177ec9d65117d0007668b85",
            "solutionName": "Project link consumption -FD 98",
            "completedDate": "2022-11-25T09:36:20.538Z"
        }'
        ```

        Note: Replace `{IP}` with the appropriate IP address.





