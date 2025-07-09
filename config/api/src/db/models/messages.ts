import { CollectionManager } from '../collections';

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

export { MsgCollection };
