/**
 * name : kafka.js
 * author : vishnu
 * created-date : 10-Jan-2023
 * Description : Kafka Configurations related information.
*/


//dependencies
const kafka = require('kafka-node');

/**
  * Kafka configurations.
  * @function
  * @name connect
*/

const connect = function() {

    const Producer = kafka.Producer
    KeyedMessage = kafka.KeyedMessage
    
    const client = new kafka.KafkaClient({
      kafkaHost : process.env.KAFKA_URL
    });

    client.on('error', function(error) {
        console.log("kafka connection error!")
    });

    const producer = new Producer(client)

    producer.on('ready', function () {
        console.log("Connected to Kafka");
    });
   
    producer.on('error', function (err) {
        console.log("kafka producer creation error!")
    })

    return {
      kafkaProducer: producer,
      kafkaClient: client
    };

};

module.exports = connect;
