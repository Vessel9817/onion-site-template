// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { DbManager } from './db';
import { BROKERS } from './env';
// import { MsgCollection } from './db/models/messages';
import { Unauthorized, validateString } from './db/kafka';
// Used in documentation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type AssertionError } from 'assert';

/**
 * Validates and parses a raw Kafka message into a usable message object.
 * @returns {Unauthorized.MsgBoardDb.V1.Msg} The parsed message
 * @throws {AssertionError} If the message is not valid
 * @throws {SyntaxError} If the message is not valid JSON
 */
function parseRawMsg(
    rawMsg: KafkaJS.KafkaMessage
): Unauthorized.MsgBoardDb.V1.Msg {
    const unparsedMsg = rawMsg.value?.toString();

    validateString(unparsedMsg);

    const msg: unknown = JSON.parse(unparsedMsg);

    Unauthorized.MsgBoardDb.V1.validateMsg(msg);

    return msg;
}

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
            try {
                const msg = parseRawMsg(rawMsg);

                // TODO TESTING
                console.log(`New message: ${JSON.stringify(msg)}`);
            } catch (err: unknown) {
                console.error((err as Error).message);
            }
        }
    }
};

async function main() {
    await DB.connect();

    const consumer = KAFKA.consumer({
        kafkaJS: {
            groupId: 'test-group'
        }
    });

    await consumer.connect();
    await consumer.subscribe({ topic: Unauthorized.MsgBoardDb.V1.TOPIC });
    await consumer.run(CONFIG);
}

// Running consumer
void (async () => {
    await main();
})();
