/**
 * name : producer.js
 * author : Vishnu
 * created-date : 10-Jan-2023
 * Description : Kafka Producer related information.
 */

// Dependencies
const kafkaCommunicationsOnOff = process.env.KAFKA_COMMUNICATIONS_ON_OFF;
const programUsersSubmissionTopic =
  process.env.PROGRAM_USERS_JOINED_TOPIC != "OFF"
    ? process.env.PROGRAM_USERS_JOINED_TOPIC
    : `${process.env.APPLICATION_ENV}.programuser.info`;

/**
 * Push program users to kafka.
 * @function
 * @name pushProgramUsersToKafka
 * @param {Object} message - Message data.
 */

const pushProgramUsersToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: programUsersSubmissionTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 * Push program users to kafka.
 * @function
 * @name pushProgramUsersToKafka
 * @param {Object} message - Message data.
 */

const pushTelemetryToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {
      let kafkaPushStatus = await pushMessageToKafka([
        {
          topic: programUsersSubmissionTopic,
          messages: JSON.stringify(message),
        },
      ]);

      return resolve(kafkaPushStatus);
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 * Push message to kafka.
 * @function
 * @name pushMessageToKafka
 * @param {Object} payload - Payload data.
 */

const pushMessageToKafka = function (payload) {
  return new Promise((resolve, reject) => {
    if (kafkaCommunicationsOnOff != "ON") {
      throw reject("Kafka configuration is not done");
    }

    console.log("-------Kafka producer log starts here------------------");
    console.log("Topic Name: ", payload[0].topic);
    console.log("Message: ", JSON.stringify(payload));
    console.log("-------Kafka producer log ends here------------------");

    kafkaClient.kafkaProducer.send(payload, (err, data) => {
      if (err) {
        return reject("Kafka push to topic " + payload[0].topic + " failed.");
      } else {
        return resolve(data);
      }
    });
  })
    .then((result) => {
      return {
        status: "success",
        message:
          "Kafka push to topic " +
          payload[0].topic +
          " successful with number - " +
          result[payload[0].topic][0],
      };
    })
    .catch((err) => {
      return {
        status: "failed",
        message: err,
      };
    });
};

module.exports = {
  pushProgramUsersToKafka: pushProgramUsersToKafka,
  pushTelemetryToKafka: pushTelemetryToKafka,
};
