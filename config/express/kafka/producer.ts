// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { BROKERS } from '../env';
import { Unauthorized } from './shared';

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

export function connectProducer(): Promise<void> {
    return PRODUCER.connect();
}

export function disconnectProducer(): Promise<void> {
    return PRODUCER.disconnect();
}

/**
 * Sends any messages that pass validation, if any
 * @param msgs The messages to send
 */
export async function sendMsgs(
    msgs: Unauthorized.MsgBoardDb.V1.Msg[]
): Promise<void> {
    const validatedMessages = msgs
        .map((msg) => {
            try {
                Unauthorized.MsgBoardDb.V1.validateMsg(msg);
            } catch (err: unknown) {
                console.error(
                    `Prevented sending of invalid message: ${(err as Error).message}`
                );
                return null;
            }

            const out: KafkaJS.Message = { value: JSON.stringify(msg) };

            return out;
        })
        .filter((msg) => msg != null);

    if (validatedMessages.length > 0) {
        await PRODUCER.send({
            topic: Unauthorized.MsgBoardDb.V1.TOPIC,
            messages: validatedMessages
        });
    }
}
