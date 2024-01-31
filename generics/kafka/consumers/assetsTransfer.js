



const assetsHelper = require(MODULES_BASE_PATH + "/assets/helper.js");

/**
 * Ownership transfer message received.
 * @function
 * @name messageReceived
 * @param {Object} message - consumer data
 * {
  "highWaterOffset": 63,
  "key": "",
  "offset": 62,
  "partition": 0,
  "topic": "ownershiptransfer",
  "edata": {
    "action": "ownership-transfer",
    "organisationId": "01269934121990553633",
    "context": "Ownership Transfer",
    "actionBy": {
      "userId": "5d7255bb-1216-460e-9228-59b60230b1c1",
      "userName": ""
    },
    "fromUserProfile": {
      "userId": "fca2925f-1eee-4654-9177-fece3fd6afc9",
      "userName": "",
      "channel": "",
      "organisationId": "",
      "roles": [
        "PROGRAM_MANAGER"
      ]
    },
    "toUserProfile": {
      "userId": "289bc48c-0a74-4650-ac99-187575a3a8a9",
      "userName": "",
      "firstName": "",
      "lastName": "",
      "roles": [
        "PROGRAM_MANAGER"
      ]
    },
    "assetInformation": {
      "objectType": "PROGRAM_MANAGER",
      "identifier": "{{resource_identifier}}"
    },
    "iteration": 1
  }
}
}
 * @returns {Promise} return a Promise.
 */



var messageReceived = function (message) {
    return new Promise(async function (resolve, reject) {
      try {
        let parsedMessage = JSON.parse(message.value);
        if (parsedMessage.edata.action === constants.common.OWNERSHIP_TRANSFER_TOPIC) {
          let ownershipTransferResponse = await assetsHelper.ownershipTransfer(parsedMessage);
  
          if (ownershipTransferResponse.success == true) {
            return resolve("Message Processed.");
          } else {
            return resolve("Message Processed.");
          }
        }
      } catch (error) {
        return reject(error);
      }
    });
  };

  var errorTriggered = function (error) {
    return new Promise(function (resolve, reject) {
      try {
        return resolve(error);
      } catch (error) {
        return reject(error);
      }
    });
  };

  module.exports = {
    messageReceived: messageReceived,
    errorTriggered: errorTriggered,
  };
  