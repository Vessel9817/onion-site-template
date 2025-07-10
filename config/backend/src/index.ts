// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { DbManager } from './db';
import { BROKERS, GROUP_ID } from './env';
// import { MsgCollection } from './db/models/messages';
import { Unauthorized } from './db/kafka';

const DB = new DbManager();

const KAFKA = new KafkaJS.Kafka({
    kafkaJS: {
        brokers: BROKERS
    }
});

const PRODUCER = KAFKA.producer({
    kafkaJS: {
        acks: 1
    }
});

const CONFIG: KafkaJS.ConsumerRunConfig = {
    eachBatch: async (req) => {
        const rawMsgs = req.batch.messages;

        for (const rawMsg of rawMsgs) {
            try {
                const msg = Unauthorized.MsgBoardDb.V1.parseRawMsg(rawMsg);

                switch (msg.type) {
                    case 'statusRes': {
                        // These messages are sent by us: ignore them
                        continue;
                    }
                    case 'status': {
                        // Acknowledging request: backend is online
                        await Unauthorized.MsgBoardDb.V1.sendMsgs(PRODUCER, [
                            { type: 'statusRes', id: msg.id }
                        ]);
                        break;
                    }
                    default: {
                        // TODO TESTING
                        console.log(`New message: ${JSON.stringify(msg)}`);
                        break;
                    }
                }
            } catch (err: unknown) {
                console.error((err as Error).message);
            }
        }
    }
};

async function main() {
    const CONSUMER = KAFKA.consumer({
        kafkaJS: {
            groupId: GROUP_ID
        }
    });

    await DB.connect();
    await PRODUCER.connect();
    await CONSUMER.connect();
    await CONSUMER.subscribe({ topic: Unauthorized.MsgBoardDb.V1.TOPIC });
    await CONSUMER.run(CONFIG);
}

// Starting server
void (async () => {
    await main();
})();
