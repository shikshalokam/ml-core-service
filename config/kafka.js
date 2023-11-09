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
  const Consumer = kafka.Consumer;

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
  const topics = [{ topic: process.env.USER_DELETE_TOPIC }];

  const options = {
    autoCommit: true,
  };

  const consumer = new Consumer(client, topics, options);

  consumer.on("message", function (message) {
    console.log("-------Kafka consumer log starts here------------------");
    console.log("Topic Name: ", USER_DELETE_TOPIC);
    console.log("Message: ", JSON.stringify(message));
    console.log("-------Kafka consumer log ends here------------------");

    userDMSConsumer.messageReceived(message);
  });

  consumer.on("error", function (err) {
    userDMSConsumer.errorTriggered(err);
  });

  return {
    kafkaProducer: producer,
    kafkaClient: client,
  };
};

module.exports = connect;
