// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import { KAFKA } from './kafka';

export const PRODUCER = KAFKA.producer({
    kafkaJS: {
        acks: 1
    }
});
