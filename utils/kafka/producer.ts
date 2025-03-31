// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { config } from 'dotenv';

const { Kafka } = KafkaJS;

// Loading env
config({ path: './.env' });

const kafka = new Kafka({
    kafkaJS: {
        clientId: process.env.CLIENT_ID,
        brokers: ['localhost:9092']
    }
});

async function main() {
    const producer = kafka.producer({
        kafkaJS: {
            acks: 1
        }
    });

    await producer.connect();
    await producer.send({
        topic: 'test-topic',
        messages: [{ value: 'Hello KafkaJS junk!' }]
    });

    await producer.disconnect();
}

// Starting Kafka server
main();
