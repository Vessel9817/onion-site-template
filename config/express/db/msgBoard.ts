import mongoose, { PipelineStage, Schema } from 'mongoose';
import { ObjectId, WithId } from 'mongodb';

export interface Msg {
    name: string;
    content: string;
}

export interface HydratedMsg extends Msg {
    lastModified: number;
}

export const MsgSchema = new Schema({
    name: String,
    lastModified: Number,
    content: String
});

export const MsgModel = mongoose.model('messages', MsgSchema);

function hydrateMsg(partialMsg: Msg): HydratedMsg {
    // No rest parameter, since PartialMsg covers Msg, WithId<PartialMsg>, etc
    const msg: HydratedMsg = {
        name: partialMsg.name,
        lastModified: new Date().getTime(),
        content: partialMsg.content
    };

    return msg;
}

const MSG_PAGE_SIZE = 10;

/**
 * Returns a message batch by page number
 * @param page The 1-indexed page index
 * @returns A message batch, paged by most recent
 */
export function getMsgs(page: number): Promise<WithId<HydratedMsg>[]> {
    const pipeline: PipelineStage[] = [
        { $sort: { date: -1 } },
        { $skip: MSG_PAGE_SIZE * (page - 1) },
        { $limit: MSG_PAGE_SIZE }
    ];

    return MsgModel.aggregate(pipeline).exec() as Promise<WithId<HydratedMsg>[]>;
}

export async function createMsg(partialMsg: Msg): Promise<void> {
    const msg = hydrateMsg(partialMsg);

    await MsgModel.insertOne(msg);
}

export async function editMsg(newMsg: WithId<Msg>): Promise<void> {
    const newMsgWithoutId: HydratedMsg = hydrateMsg(newMsg);

    await MsgModel.findByIdAndUpdate(newMsg._id, newMsgWithoutId);
}

export async function deleteMsg(id: ObjectId): Promise<void> {
    await MsgModel.findByIdAndDelete(id).exec();
}
