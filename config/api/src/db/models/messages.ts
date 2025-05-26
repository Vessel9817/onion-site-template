import { CollectionManager } from '../collections';

export interface MessageTypeV1 {
    name: string;
    msg: string;
    version: 1;
}

/**
 * A union type of each supported schema revision
 */
export type MessageType = MessageTypeV1;

/**
 * An amalgamation of all supported schema revisions
 * @see {@link MessageType}
 */
const MessageSchema = {
    name: String,
    msg: String,
    version: Number
};

export const Message = CollectionManager.modelWrapper(
    'messages',
    MessageSchema
);
