// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { BROKERS } from '../env';

export const KAFKA = new KafkaJS.Kafka({
    kafkaJS: {
        brokers: BROKERS
    }
});
