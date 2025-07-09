import assert, { AssertionError } from 'assert';
import {
    validateObject,
    validateNumber,
    validateDateTime,
    validateString
} from './validation';

// Note that all topic names should contain periods or underscores, but not both
export namespace Unauthorized {
    export namespace MsgBoardDb {
        export namespace V1 {
            export const TOPIC = 'unauthorized.msg-board-db.v1';

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

            export type Msg = CreateMsg | ReadMsg | UpdateMsg | DeleteMsg;

            export function validateMsg(msg: unknown): asserts msg is Msg {
                validateObject(msg);
                validateString(msg.type);

                switch (msg.type) {
                    case 'create': {
                        validateCreateMsg(msg);
                        break;
                    }
                    case 'read': {
                        validateReadMsg(msg);
                        break;
                    }
                    case 'update': {
                        validateUpdateMsg(msg);
                        break;
                    }
                    case 'delete': {
                        validateDeleteMsg(msg);
                        break;
                    }
                    default: {
                        throw new AssertionError({
                            message: `Expected type "create", "read", "update", or "delete"`,
                            actual: msg.type
                        });
                    }
                }
            }
        }
    }
}
