import mongoose, { Schema, type PipelineStage } from 'mongoose';
import { randomBytes } from 'node:crypto';
import { dateNow } from '../utils/shims';

export const MSG_PAGE_SIZE = 10;

export interface Msg {
    name: string;
    content: string;
}

export interface HydratedMsg extends Msg {
    lastModified: number;
}

export interface StoredMsg extends HydratedMsg {
    index: string;
}

export const MsgSchema = new Schema({
    name: String,
    content: String,
    lastModified: Number,
    index: { type: String, required: true, unique: true }
});

export const MsgModel = mongoose.model('messages', MsgSchema);

/**
 * Transforms (hydrates) a partial record into a full record
 * @param partialMsg The partial record
 * @returns A record ready to be inserted into the database
 */
function hydrateMsg(partialMsg: Msg): HydratedMsg {
    const msg: HydratedMsg = {
        name: partialMsg.name,
        content: partialMsg.content,
        lastModified: dateNow()
    };

    return msg;
}

/**
 * Builds the filter that matches one record by its index
 * @param index The record's public index
 * @returns A filter whose `$eq` stops the index from being read as an operator
 */
function byIndex(index: string): { index: { $eq: string } } {
    return { index: { $eq: index } };
}

/**
 * Checks whether a record with the given index exists
 * @param index The record's public index
 * @returns `true` if the record exists, `false` otherwise
 */
export async function idExists(index: string): Promise<boolean> {
    return (await MsgModel.exists(byIndex(index))) != null;
}

/**
 * Returns a message batch by page number
 * @param page The 1-indexed page index
 * @returns A message batch, paged by most recent
 */
export async function getMsgs(page: number): Promise<StoredMsg[]> {
    const skip = MSG_PAGE_SIZE * (page - 1);
    const rawPipeline: (PipelineStage | null)[] = [
        { $sort: { lastModified: -1 } },
        // This is O(m+n), where m is the page size and n is the total documents skipped.
        // There is supposedly a better method that achieves O(m)
        skip <= 0 ? null : { $skip: skip },
        { $limit: MSG_PAGE_SIZE },
        { $project: { _id: 0 } }
    ];
    const pipeline = rawPipeline.filter((stage) => stage != null);
    const msgs = await MsgModel.aggregate<StoredMsg>(pipeline).exec();

    // Newest messages at bottom
    msgs.reverse();

    return msgs;
}

/**
 * Hydrates and inserts the given record under a new random index
 * @param partialMsg The partial record
 */
export async function createMsg(partialMsg: Msg): Promise<void> {
    const msg: StoredMsg = {
        ...hydrateMsg(partialMsg),
        index: randomBytes(16).toString('hex')
    };

    await MsgModel.insertOne(msg);
}

/**
 * Hydrates and updates the given record based on its index
 * @param newMsg The record
 */
export async function editMsg(newMsg: Msg & Pick<StoredMsg, 'index'>): Promise<void> {
    const newMsgWithoutIndex: HydratedMsg = hydrateMsg(newMsg);

    await MsgModel.findOneAndUpdate(byIndex(newMsg.index), newMsgWithoutIndex);
}

/**
 * Deletes a record based on the given index
 * @param index The public index of the record to delete
 */
export async function deleteMsg(index: string): Promise<void> {
    await MsgModel.deleteOne(byIndex(index)).exec();
}
