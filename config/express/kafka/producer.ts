// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { BROKERS } from '../env';
import { type Unauthorized } from './shared';

const KAFKA = new KafkaJS.Kafka({
    kafkaJS: {
        brokers: BROKERS
    }
});

export async function sendMsgs(msgs: Unauthorized.MsgBoardDb.V1.Msg[]) {
    const PRODUCER = KAFKA.producer({
        kafkaJS: {
            acks: 1
        }
    });

    try {
        await PRODUCER.send({
            topic: 'unauthorized.msg_board_db.v1',
            messages: msgs.map((msg) => {
                return {
                    value: JSON.stringify(msg)
                };
            })
        });
    } finally {
        await PRODUCER.disconnect();
    }
}

// void (async () => {
//     await sendMsgs([
//         {
//             type: 'create',
//             name: 'name',
//             content: 'content',
//             date: Date.now()
//         }
//     ]);
// })();
