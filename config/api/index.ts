// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import {
    Kafka,
    type ConsumerRunConfig
} from '@confluentinc/kafka-javascript/types/kafkajs';

const KAFKA = new Kafka({
    kafkaJS: {
        brokers: ['10.5.1.2:9092']
    }
});

const CONFIG: ConsumerRunConfig = {
    eachMessage: async (req) => {
        console.log({
            value: req.message.value?.toString()
        });
    }
};

async function main() {
    const consumer = KAFKA.consumer({
        kafkaJS: { groupId: 'test-group', fromBeginning: true }
    });

    await consumer.connect();
    await consumer.subscribe({ topic: 'test-topic' });
    await consumer.run(CONFIG);
}

// Running consumer
(async () => {
    await main();
})();
