import mongoose, { PipelineStage, Schema } from 'mongoose';

export interface PartialMsg {
    name: string;
    content: string;
}

export interface Msg {
    name: string;
    date: number;
    content: string;
}

export const MsgSchema = new Schema({
    name: String,
    date: Number,
    content: String
});

export const MsgModel = mongoose.model('messages', MsgSchema);

const MSG_PAGE_SIZE = 10;

/**
 * Returns a message batch by page number
 * @param page The 1-indexed page index
 * @returns A message batch, paged by most recent
 */
export function getMsgs(page: number): Promise<Msg[]> {
    const pipeline: PipelineStage[] = [
        { $sort: { date: -1 } },
        { $skip: MSG_PAGE_SIZE * (page - 1) },
        { $limit: MSG_PAGE_SIZE }
    ];

    return MsgModel.aggregate(pipeline).exec() as Promise<Msg[]>;
}

export async function createMsg(partialMsg: PartialMsg): Promise<void> {
    const msg: Msg = {
        ...partialMsg,
        date: new Date().getTime()
    };

    await MsgModel.insertOne(msg);
}
