import { KafkaJS } from '@confluentinc/kafka-javascript';
import assert, { type AssertionError } from 'assert';
import {
    validateDateTime,
    validateNumber,
    validateObject,
    validateString
} from './validation';

// Note that all topic names should contain periods or underscores, but not both
export namespace Unauthorized {
    export namespace MsgBoardDb {
        export namespace V1 {
            export const TOPIC = 'unauthorized.msg-board-db.v1';

            export interface StatusMsg {
                type: 'status';
                id: string;
            }

            export function validateStatusMsg(
                msg: unknown
            ): asserts msg is StatusMsg {
                validateObject(msg);
                validateString(msg.type);
                validateString(msg.id);
                assert.ok(
                    msg.type === 'status',
                    'Expected type to be "status"'
                );
            }

            export interface StatusResMsg {
                type: 'statusRes';
                id: string;
            }

            export function validateStatusResMsg(
                msg: unknown
            ): asserts msg is StatusResMsg {
                validateObject(msg);
                validateString(msg.type);
                validateString(msg.id);
                assert.ok(
                    msg.type === 'statusRes',
                    'Expected type to be "create"'
                );
            }

            export interface CreateMsg {
                type: 'create';
                name: string;
                content: string;
                date: number;
            }

            export function validateCreateMsg(
                msg: unknown
            ): asserts msg is CreateMsg {
                validateObject(msg);
                validateString(msg.name);
                validateString(msg.content);
                validateDateTime(msg.date);
                assert.ok(
                    msg.type === 'create',
                    'Expected type to be "create"'
                );
            }

            export interface ReadMsg {
                type: 'read';
                quantity: number;
                page: number;
            }

            export function validateReadMsg(
                msg: unknown
            ): asserts msg is ReadMsg {
                validateObject(msg);
                validateNumber(msg.quantity);
                validateNumber(msg.page);
                assert.ok(msg.type === 'read', 'Expected type to be "read"');
            }

            export interface UpdateMsg extends Omit<CreateMsg, 'type'> {
                type: 'update';
                id: string;
            }

            export function validateUpdateMsg(
                msg: unknown
            ): asserts msg is UpdateMsg {
                validateObject(msg);
                validateString(msg.id);
                validateString(msg.name);
                validateString(msg.content);
                validateDateTime(msg.date);
                assert.ok(
                    msg.type === 'update',
                    'Expected type to be "update"'
                );
            }

            export interface DeleteMsg {
                type: 'delete';
                id: string;
            }

            export function validateDeleteMsg(
                msg: unknown
            ): asserts msg is DeleteMsg {
                validateObject(msg);
                validateString(msg.id);
                assert.ok(
                    msg.type === 'delete',
                    'Expected type to be "delete"'
                );
            }

            export type Msg =
                | StatusMsg
                | StatusResMsg
                | CreateMsg
                | ReadMsg
                | UpdateMsg
                | DeleteMsg;

            const MSG_VALIDATORS = new Map<string, (msg: unknown) => void>([
                ['status', validateStatusMsg],
                ['statusRes', validateStatusResMsg],
                ['create', validateCreateMsg],
                ['read', validateReadMsg],
                ['update', validateUpdateMsg],
                ['delete', validateDeleteMsg]
            ]);

            export function validateMsg(msg: unknown): asserts msg is Msg {
                validateObject(msg);
                validateString(msg.type);
                assert.ok(
                    MSG_VALIDATORS.has(msg.type),
                    `Unexpected type: ${msg.type}`
                );

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const VALIDATOR = MSG_VALIDATORS.get(msg.type)!;

                VALIDATOR(msg);
            }

            /**
             * Validates and parses a raw Kafka message into a usable message object.
             * @returns {Msg} The parsed message
             * @throws {AssertionError} If the message is not valid
             * @throws {SyntaxError} If the message is not valid JSON
             */
            export function parseRawMsg(rawMsg: KafkaJS.KafkaMessage): Msg {
                const unparsedMsg = rawMsg.value?.toString();

                validateString(unparsedMsg);

                const msg: unknown = JSON.parse(unparsedMsg);

                Unauthorized.MsgBoardDb.V1.validateMsg(msg);

                return msg;
            }

            /**
             * Sends any messages that pass validation, if any
             * @param producer The producer to send messages through
             * @param msgs The messages to send
             */
            export async function sendMsgs(
                producer: KafkaJS.Producer,
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

                        const out: KafkaJS.Message = {
                            value: JSON.stringify(msg)
                        };

                        return out;
                    })
                    .filter((msg) => msg != null);

                if (validatedMessages.length > 0) {
                    await producer.send({
                        topic: Unauthorized.MsgBoardDb.V1.TOPIC,
                        messages: validatedMessages
                    });
                }
            }
        }
    }
}
