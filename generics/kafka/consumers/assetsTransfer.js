



const assetsHelper = require(MODULES_BASE_PATH + "/assets/helper.js");





var messageReceived = function (message) {
    return new Promise(async function (resolve, reject) {
      try {
        let originalMessage = JSON.parse(message.value);
        let parsedMessage = originalMessage.value;
        if (parsedMessage.edata.action === constants.common.TRANSFER_OWNERSHIP_JOB) {
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
  