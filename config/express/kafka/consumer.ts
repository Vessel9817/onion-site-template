import EventEmitter from 'node:events';
import { GROUP_ID } from '../env';
import { KAFKA } from './kafka';
import { Unauthorized } from './shared';

type EmitterMap = Record<
    Unauthorized.MsgBoardDb.V1.StatusResMsg['type'],
    [id: string]
>;

const EMITTER = new EventEmitter<EmitterMap>();

export const CONSUMER = KAFKA.consumer({
    kafkaJS: {
        groupId: GROUP_ID
    }
});

export async function getStatusRes(id: string): Promise<void> {
    function callbackFactory(resolve: () => void) {
        return (receivedId: string) => {
            if (id === receivedId) {
                resolve();
            }
        };
    }

    let callback: (id: string) => void;

    const TASK = new Promise<void>((resolve) => {
        callback = callbackFactory(resolve);
        EMITTER.on('statusRes', callback);
    });

    const TIMEOUT = new Promise<never>((resolve, reject) => {
        const TIMEOUT_MS = 1000;

        setTimeout(() => {
            EMITTER.off('statusRes', callback);
            reject(new Error('Server took too long to respond'));
        }, TIMEOUT_MS);
    });

    await Promise.race([TASK, TIMEOUT]);
}

export async function connectConsumer(): Promise<void> {
    await CONSUMER.connect();
    await CONSUMER.subscribe({
        topic: Unauthorized.MsgBoardDb.V1.TOPIC
    });
    await CONSUMER.run({
        // eslint-disable-next-line @typescript-eslint/require-await
        eachMessage: async (req) => {
            const rawMsg = req.message;

            try {
                const msg = Unauthorized.MsgBoardDb.V1.parseRawMsg(rawMsg);

                // Filtering out unnecessary messages
                if (msg.type === 'statusRes') {
                    EMITTER.emit(msg.type, msg.id);
                }
            } catch (err: unknown) {
                console.error((err as Error).message);
            }
        }
    });
}
