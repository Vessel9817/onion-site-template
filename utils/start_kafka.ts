import start from './kafka/kafka';

// Running containerized Kafka services
(async () => {
    await start();
})();
