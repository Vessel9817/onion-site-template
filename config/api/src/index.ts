// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { BROKERS } from './env';
import { DbManager } from './db';
import { MsgCollection, MsgCollectionMsgs } from './db/models/messages';

const DB = new DbManager();

const KAFKA = new KafkaJS.Kafka({
    kafkaJS: {
        brokers: BROKERS
    }
});

const CONFIG: KafkaJS.ConsumerRunConfig = {
    // eslint-disable-next-line @typescript-eslint/require-await
    eachBatch: async (req) => {
        const rawMsgs = req.batch.messages;

        for (const rawMsg of rawMsgs) {
            const msg = rawMsg.value?.toString();

            console.log(`New message: ${msg ?? 'null'}`);
        }
    }
};

async function main() {
    await DB.connect();
    await MsgCollection.createCollection();

    const consumer = KAFKA.consumer({
        kafkaJS: {
            groupId: 'test-group'
        }
    });

    await consumer.connect();
    await consumer.subscribe({ topic: MsgCollectionMsgs.V1.TOPIC });
    await consumer.run(CONFIG);
}

// Running consumer
void (async () => {
    await main();
})();
