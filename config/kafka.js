/**
 * name : kafka.js
 * author : vishnu
 * created-date : 10-Jan-2023
 * Description : Kafka Configurations related information.
 */

//dependencies
const kafka = require("kafka-node");
let USER_DELETE_TOPIC = process.env.USER_DELETE_TOPIC;
/**
 * Kafka configurations.
 * @function
 * @name connect
 */

const connect = function () {
  const Producer = kafka.Producer;
  KeyedMessage = kafka.KeyedMessage;

  const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_URL,
  });

  client.on("error", function (error) {
    console.log(error);
    console.log("kafka connection error!");
  });

  const producer = new Producer(client);

  producer.on("ready", function () {
    console.log("Connected to Kafka");
  });

  producer.on("error", function (err) {
    console.log("kafka producer creation error!");
  });

  if (USER_DELETE_TOPIC) {
    let consumer = new kafka.ConsumerGroup(
      {
        kafkaHost: process.env.KAFKA_URL,
        groupId: process.env.KAFKA_GROUP_ID,
        autoCommit: true,
      },
      USER_DELETE_TOPIC
    );

    consumer.on("message", async function (message) {
      console.log("-------Kafka consumer log starts here------------------");
      console.log("Topic Name: ", USER_DELETE_TOPIC);
      console.log("Message: ", JSON.stringify(message));
      console.log("-------Kafka consumer log ends here------------------");

      userDMSConsumer.messageReceived(message);
    });

    consumer.on("error", async function (error) {
      userDMSConsumer.errorTriggered(error);
    });
  }

  return {
    kafkaProducer: producer,
    kafkaClient: client,
  };
};

module.exports = connect;
