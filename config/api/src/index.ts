// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import {
    Kafka,
    type ConsumerRunConfig
} from '@confluentinc/kafka-javascript/types/kafkajs';
import { BROKER } from './env';
import { DbManager } from './db';

const DB = new DbManager();

const KAFKA = new Kafka({
    kafkaJS: {
        brokers: [BROKER]
    }
});

const CONFIG: ConsumerRunConfig = {
    // eslint-disable-next-line @typescript-eslint/require-await
    eachMessage: async (req) => {
        console.log({ value: req.message.value?.toString() });
    }
};

async function main() {
    await DB.connect();

    const consumer = KAFKA.consumer({
        kafkaJS: { groupId: 'test-group', fromBeginning: true }
    });

    await consumer.connect();
    await consumer.subscribe({ topic: 'unauthorized.msg_board_db.v1' });
    await consumer.run(CONFIG);
}

// Running consumer
void (async () => {
    await main();
})();
