// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { ConsumerRunConfig } from '@confluentinc/kafka-javascript/types/kafkajs';
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

const CONFIG: ConsumerRunConfig = {
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        console.log({
            value: message.value?.toString()
        });
    }
};

async function main() {
    const consumer = kafka.consumer({
        kafkaJS: { groupId: 'test-group', fromBeginning: true }
    });

    await consumer.connect();
    await consumer.subscribe({ topic: 'test-topic' });
    await consumer.run(CONFIG);
}

main();
