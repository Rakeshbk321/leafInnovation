# leafInnovation task.

update the required configuration in the env file with the mongo credentials.

to deploy

sls deploy --stage env --aws-profile profileName

for local testing

sls invoke local -f functionName -d '{data}' --stage env --aws-profile profileName

following modules are included
* Product
* Inventory
* DeliveryAgent
* Region
* RegionAreaMapping
* Orders
* LastmileStatus

Avaliable all crud operation for all modules.


Scheduler lambda function exists, whihc updates the following things
* Allocation to store based on the inventory
* Lastmile delivery agent allocation based on the available deliveryagent in the region
* updation of the lastmile tracking order.
