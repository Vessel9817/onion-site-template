import { CollectionManager } from '../collections';
import { Unauthorized } from '../kafka';

/**
 * An amalgamation of all supported collection messages
 */
const MsgCollectionMsgs = Unauthorized.MsgBoardDb;

/**
 * An amalgamation of all supported schema revisions
 * @see {@link MessageType}
 */
const MsgSchema = {
    name: String,
    msg: String,
    version: Number
};

const MsgCollection = CollectionManager.modelWrapper('messages', MsgSchema);

export { MsgCollection, MsgCollectionMsgs };
