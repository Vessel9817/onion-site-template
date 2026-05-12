import { ObjectId, type WithId } from 'mongodb';
import mongoose, { type PipelineStage, Schema } from 'mongoose';
import { dateNow } from '../utils/shims';

const MSG_PAGE_SIZE = 10;

export interface Msg {
    name: string;
    content: string;
}

export interface HydratedMsg extends Msg {
    lastModified: number;
}

export const MsgSchema = new Schema({
    name: String,
    content: String,
    lastModified: Number
});

export const MsgModel = mongoose.model('messages', MsgSchema);

/**
 * Transforms (hydrates) a partial record into a full record
 * @param partialMsg The partial record
 * @returns A record ready to be inserted into the database
 */
function hydrateMsg(partialMsg: Msg): HydratedMsg {
    const msg: HydratedMsg = {
        // No rest parameter, since partialMsg could be of type WithId<Msg>.
        name: partialMsg.name,
        content: partialMsg.content,
        lastModified: dateNow()
    };

    return msg;
}

/**
 * Attempts to retrieve a record of the given `ObjectId`
 * @param id The record's `ObjectId`
 * @returns `true` if the record exists, `false` otherwise
 */
export async function idExists(id: ObjectId): Promise<boolean> {
    return (await MsgModel.findById(id)) != null;
}

/**
 * Returns a message batch by page number
 * @param page The 1-indexed page index
 * @returns A message batch, paged by most recent
 */
export async function getMsgs(page: number): Promise<WithId<HydratedMsg>[]> {
    const skip = MSG_PAGE_SIZE * (page - 1);
    const rawPipeline: (PipelineStage | null)[] = [
        { $sort: { lastModified: -1 } },
        // This is O(m+n), where m is the page size and n is the total documents skipped.
        // There is supposedly a better method that achieves O(m)
        skip <= 0 ? null : { $skip: skip },
        { $limit: MSG_PAGE_SIZE }
    ];
    const pipeline = rawPipeline.filter((stage) => stage != null);
    const msgs = (await MsgModel.aggregate(
        pipeline
    ).exec()) as WithId<HydratedMsg>[];

    // Newest messages at bottom
    msgs.reverse();

    return msgs;
}

/**
 * Hydrates and inserts the given record
 * @param partialMsg The partial record
 */
export async function createMsg(partialMsg: Msg): Promise<void> {
    const msg = hydrateMsg(partialMsg);

    await MsgModel.insertOne(msg);
}

/**
 * Hydrates and updates the given record based on its ObjectId
 * @param newMsg The record
 */
export async function editMsg(newMsg: WithId<Msg>): Promise<void> {
    const newMsgWithoutId: HydratedMsg = hydrateMsg(newMsg);

    await MsgModel.findByIdAndUpdate(newMsg._id, newMsgWithoutId);
}

/**
 * Deletes a record based on the given ObjectId
 * @param id The ObjectId of the record to delete
 */
export async function deleteMsg(id: ObjectId): Promise<void> {
    await MsgModel.findByIdAndDelete(id).exec();
}
