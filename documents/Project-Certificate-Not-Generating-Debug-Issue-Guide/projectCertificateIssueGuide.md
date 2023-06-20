## Prerequisites for Debugging the Issue Based on the Testing Environment (Pre-prod or Prod):

1. Diksha VPN Access
2. Auth token to enable the use of ML-services admin APIs in prod and IP details
3. Access to Rancher to check ML-services config files ( If server access is there, Rancher access is optional because config files can be obtained using server access)
4. Private ingress (IP) of the environment (Can be used to call RC-services to check responses)
5. Need to cross-check the RC-service tags deployed in the environment

For more details, please refer to the [Sunbird Release Documentation](https://ed.sunbird.org/use/updating-sunbird-releases/5.0.0-to-5.1.0) and check the information provided in the table under the Sunbird RC section.