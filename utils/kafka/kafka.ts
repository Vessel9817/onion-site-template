import child_process, { ChildProcess } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';

// https://stackoverflow.com/a/14861513
if (process.platform === "win32") {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.on("SIGINT", () => {
        process.emit("SIGINT");
    });
}

class ProcessHandler {
    private _process?: ChildProcess;
    private _retry: boolean;
    private readonly _processType: string;
    private readonly _processCmd: string;
    private readonly _callback?: (error: child_process.ExecException | null, stdout: string, stderr: string) => void;
    
    constructor(processCmd: string, keepAlive: boolean, processType: string, callback?: (error: child_process.ExecException | null, stdout: string, stderr: string) => void) {
        this._processCmd = processCmd;
        this._processType = processType;
        this._retry = keepAlive;
        this._callback = callback;
        
        this.createProcess();
    }
    
    public static runSync(processCmd: string, processType: string, options: child_process.ExecSyncOptionsWithStringEncoding): string;
    public static runSync(processCmd: string, processType: string, options: child_process.ExecSyncOptionsWithBufferEncoding): Buffer;
    public static runSync(processCmd: string, processType: string, options?: child_process.ExecSyncOptions): string | Buffer;
    
    public static runSync(processCmd: string, processType: string, options?: child_process.ExecSyncOptions): string | Buffer {
        console.log(`${processType} starting up...`);
        
        let out = child_process.execSync(processCmd, options);
        
        console.log(`${processType} shut down!`);
        
        return out;
    }
    
    public get retry(): boolean {
        return this._retry;
    }
    
    public set retry(retry: boolean) {
        if (this._retry != retry) {
            this._retry = retry;
            
            if (retry) {
                this._process?.on('exit', this.retryHandler);
            }
            else {
                this._process?.removeListener('exit', this.retryHandler);
            }
        }
    }
    
    public terminate(): boolean {
        let success = this._process === undefined || (this._process.killed === false && this._process.kill());
        
        if (!success) {
            console.error(`${this._processType} failed to terminate. It's possible that the process was terminated externally.`);
        }
        
        return success;
    }
    
    public get terminated(): boolean {
        return this._process?.killed !== false;
    }
    
    private createProcess(): void {
        console.log(`${this._processType} starting up...`);
        
        this._process = child_process.exec(this._processCmd, this._callback);
        
        // Extending process ending handler
        this._process.on('exit', (code, signal) => {
            console.log(`${this._processType} shut down!`);
        });
    }

    private retryHandler(code: number | null, signal: NodeJS.Signals | null): void {
        console.log(`${this._processType} restarting...`);
        
        this.createProcess();
    }
}

// Only one should broker exist at a time due to static terminate function
class Broker extends ProcessHandler {
    private constructor(processCmd: string, keepAlive: boolean, callback?: (error: child_process.ExecException | null, stdout: string, stderr: string) => void) {
        super(processCmd, keepAlive, 'Kafka broker starter', callback);
    }
    
    static async create(): Promise<Broker> {
        return new Promise((resolve, reject) => {
            // Running broker container
            const BROKER_CMD = `docker compose up -d`;
            const BROKER = new Broker(BROKER_CMD, true, (err) => {
                if (err) {
                    reject(new Error(`Couldn't create Kafka broker: ${err.message}`));
                }
                else if (BROKER.terminated === true) {
                    reject(new Error('Kafka broker shut down before topic could be created'));
                }
                else {
                    // Creating topic
                    const CREATE_TOPIC_CMD = 'docker exec -i broker bash /opt/kafka/bin/kafka-topics.sh --create --topic test-topic --bootstrap-server localhost:9092';
                    
                    new ProcessHandler(CREATE_TOPIC_CMD, false, 'Kafka broker topic creator', (err) => { // NOSONAR S1848
                        if (err) {
                            console.warn(`Couldn't create topic: ${err.message}`);
                        }
                        
                        console.log('Kafka broker ready!');
                        resolve(BROKER);
                    });
                }
            });
        });
    }

    static terminate(): void {
        const BROKER_TERMINATOR_CMD = 'docker stop broker && docker rm broker';
        
        ProcessHandler.runSync(BROKER_TERMINATOR_CMD, 'Kafka broker terminator');
    }
}

class Producer extends ProcessHandler {
    private constructor(processCmd: string, keepAlive: boolean, callback?: (error: child_process.ExecException | null, stdout: string, stderr: string) => void) {
        super(processCmd, keepAlive, 'Kafka producer', callback);
    }
    
    static async create(): Promise<Producer> {
        return new Promise((resolve, reject) => {
            const PRODUCER_PATH = path.join(__dirname, 'producer.ts');
            const PRODUCER_CMD = `npx ts-node "${PRODUCER_PATH}"`;
            const PRODUCER = new Producer(PRODUCER_CMD, true, (err, stdout, stderr) => {
                if (err) {
                    reject(new Error(`Couldn't create producer: ${err.message}`));
                }
                else {
                    console.log('Created producer!');
                    resolve(PRODUCER);
                }
            });
        });
    }
}

class Consumer extends ProcessHandler {
    private constructor(processCmd: string, keepAlive: boolean, callback?: (error: child_process.ExecException | null, stdout: string, stderr: string) => void) {
        super(processCmd, keepAlive, 'Kafka consumer', callback);
    }
    
    static async create(): Promise<Consumer> {
        return new Promise((resolve, reject) => {
            const CONSUMER_PATH = path.join(__dirname, 'consumer.ts');
            const CONSUMER_CMD = `npx ts-node "${CONSUMER_PATH}"`;
            const CONSUMER = new Consumer(CONSUMER_CMD, true, (err, stdout, stderr) => {
                if (err) {
                    reject(new Error(`Couldn't create consumer: ${err.message}`));
                }
                else {
                    console.log('Created consumer!');
                    resolve(CONSUMER);
                }
                
                // TODO TESTING
                console.log(`Consumer output: ${stdout}`);
            });
        });
    }
}

class KafkaManager {
    private readonly _producers: Promise<Producer>[] = [];
    private readonly _consumers: Promise<Consumer>[] = [];
    
    private constructor() {}
    
    public static async create(): Promise<KafkaManager> {
        console.log('Kafka manager starting...');
        
        return new Promise((resolve, reject) => {
            Broker.create()
                .then(() => {
                    let manager = new KafkaManager();
                    
                    manager.createProducer();
                    manager.createConsumer();
                    
                    resolve(manager);
                })
                .catch((err) => {
                    Broker.terminate();
                    reject(new Error(`Couldn't create Kafka manager: ${err.message}`));
                });
        });
    }
    
    public createProducer(): void {
        this._producers.push(Producer.create());
    }
    
    public async terminateProducer(): Promise<void> {
        let producer = this._producers.pop();
        
        if (producer != null) {
            let p = await producer;
            
            p.retry = false;
            
            p.terminate();
        }
    }
    
    public createConsumer(): void {
        this._consumers.push(Consumer.create());
    }
    
    public async terminateConsumer(): Promise<void> {
        let consumer = this._consumers.pop();
        
        if (consumer != null) {
            let c = await consumer;
            
            c.retry = false;
            
            c.terminate();
        }
    }
    
    public async terminate(): Promise<void> {
        console.log('Kafka manager shutting down...');
        
        // Shutting down broker dependants
        let promises: Promise<void>[] = [];
        
        while (this._producers.length > 0) {
            promises.push(this.terminateProducer());
        }
        
        while (this._consumers.length > 0) {
            promises.push(this.terminateConsumer());
        }
        
        await Promise.allSettled([promises]);
        
        // Shutting down broker
        Broker.terminate();
    }
}

// TODO Make broker terminate function nonstatic by making container name unique
// TODO Run producers and consumers in their own containers (makes logging and debugging easier)
// TODO Create custom errors instead of using Error
// TODO Block the addition of new producers/consumers to prevent memory leakage on manager termination?
// TODO Make create_producer and create_consumer scripts to avoid the use of path.join to find scripts
export default async function start(): Promise<KafkaManager> {
    let manager = KafkaManager.create();
    
    // Ensuring process termination upon user interrupt
    process.on('SIGINT', async () => {
        (await manager).terminate();
    });
    
    try {
        await manager;
    }
    catch (err) {
        console.error('Kafka manager failed:', err);
    }
    finally {
        if (manager != null) {
            await (await manager).terminate();
        }
    }
    
    return manager;
}
