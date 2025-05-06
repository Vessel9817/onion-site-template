// KafkaJS migration guide:
// https://github.com/confluentinc/confluent-kafka-javascript/blob/master/MIGRATION.md#kafkajs
import KafkaJS, {
    Kafka,
    type Message,
    type ProducerConfig,
    type RecordMetadata
} from '@confluentinc/kafka-javascript/types/kafkajs';

class Producer {
    private static readonly KAFKA = new Kafka({
        kafkaJS: {
            brokers: ['10.5.1.2:9092']
        }
    });

    private readonly PRODUCER: KafkaJS.Producer;

    constructor(config?: ProducerConfig) {
        config = config ?? { acks: 1 };

        this.PRODUCER = Producer.KAFKA.producer({ kafkaJS: config });
    }

    /**
     * Connects the producer to the brokers
     */
    connect(): Promise<void> {
        return this.PRODUCER.connect();
    }

    /**
     * Disconnects the producer from the brokers
     */
    disconnect(): Promise<void> {
        return this.PRODUCER.disconnect();
    }

    send(type: string, messages: Message[]): Promise<RecordMetadata[]> {
        return this.PRODUCER.send({ topic: type, messages });
    }
}

async function main() {
    const PRODUCER = new Producer();

    try {
        await PRODUCER.send('test-topic', [{ value: 'Hello world!' }]);
    } finally {
        await PRODUCER.disconnect();
    }
}

// Running producer
(async () => {
    await main();
})();
