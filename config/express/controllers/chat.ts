import { Response, type RequestHandler } from 'express';
import { v4 as uuid } from 'uuid';
import { Unauthorized } from '../kafka/shared';

// TODO Mocking DB
interface MockDbEntry {
    readonly id: string;
    name: string;
    content: string;
    date: number;
}

const MOCK_MSG_DB = new Array<MockDbEntry>();

function _getMockEntryPosition(id: string): number {
    return MOCK_MSG_DB.findIndex((e) => e.id === id);
}

function _getPagedMockEntries(quantity: number, page = 1): MockDbEntry[] {
    const MAX_PAGE_SIZE = Math.ceil(MOCK_MSG_DB.length / quantity);

    // 1 <= page <= MAX_PAGE_SIZE
    page = Math.min(Math.max(1, page), MAX_PAGE_SIZE);

    // Page 1 corresponds to newest entries
    const out = MOCK_MSG_DB.slice(quantity * (page - 1), quantity * page);

    // Ordering newest entries at the end
    return out.reverse();
}

function _addMockEntry(entry: Omit<MockDbEntry, 'id'>): void {
    // Entries ordered from newest to oldest
    MOCK_MSG_DB.unshift({
        ...entry,
        id: uuid()
    });
}

function _updateMockEntry(
    entry: { readonly id: string } & Partial<MockDbEntry>
): boolean {
    const index = _getMockEntryPosition(entry.id);

    if (index >= 0) {
        MOCK_MSG_DB[index] = {
            ...MOCK_MSG_DB[index],
            ...entry
        };
        return true;
    }

    return false;
}

function _deleteMockEntry(id: string): boolean {
    const index = _getMockEntryPosition(id);

    if (index >= 0) {
        MOCK_MSG_DB.splice(index, 1);
        return true;
    }

    return false;
}

type DbMsg =
    | Unauthorized.MsgBoardDb.V1.ReadMsg
    | Unauthorized.MsgBoardDb.V1.CreateMsg
    | Unauthorized.MsgBoardDb.V1.UpdateMsg
    | Unauthorized.MsgBoardDb.V1.DeleteMsg;

function _sendMsg(msg: Unauthorized.MsgBoardDb.V1.ReadMsg): MockDbEntry[];
function _sendMsg(
    msg:
        | Unauthorized.MsgBoardDb.V1.CreateMsg
        | Unauthorized.MsgBoardDb.V1.UpdateMsg
        | Unauthorized.MsgBoardDb.V1.DeleteMsg
): boolean;
function _sendMsg(msg: DbMsg): MockDbEntry[] | boolean;
function _sendMsg(msg: DbMsg): MockDbEntry[] | boolean {
    switch (msg.type) {
        case 'read': {
            return _getPagedMockEntries(msg.quantity, msg.page);
        }
        case 'create': {
            _addMockEntry({
                name: msg.name,
                content: msg.content,
                date: msg.date
            });
            return true;
        }
        case 'update': {
            return _updateMockEntry({
                id: msg.id,
                name: msg.name,
                content: msg.content,
                date: msg.date
            });
        }
        case 'delete': {
            return _deleteMockEntry(msg.id);
        }
    }
}

type MapDbMsgType<T> = T extends Unauthorized.MsgBoardDb.V1.ReadMsg
    ? MockDbEntry[]
    : T extends
            | Unauthorized.MsgBoardDb.V1.CreateMsg
            | Unauthorized.MsgBoardDb.V1.UpdateMsg
            | Unauthorized.MsgBoardDb.V1.DeleteMsg
      ? boolean
      : never;

type MappedMsgs<T extends DbMsg[]> = { [K in keyof T]: MapDbMsgType<T[K]> };

async function sendMsgs<T extends DbMsg[]>(...msgs: T): Promise<MappedMsgs<T>> {
    const out = [] as MappedMsgs<T>;

    for (const msg of msgs) {
        out.push(_sendMsg(msg));
    }

    return Promise.resolve(out);
}

// Defining routes
const QUANTITY = 10;
const PAGE = 1;

function renderChat(res: Response, entries: MockDbEntry[]): void {
    const formattedEntries = entries.map((e) => ({
        ...e,
        date: new Date(e.date).toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'long',
            timeZone: 'UTC'
        })
    }));

    res.render('pages/chat', {
        msgs: formattedEntries
    });
}

export const getChat: RequestHandler = async (req, res) => {
    const [entries]: [MockDbEntry[]] = await sendMsgs({
        type: 'read',
        quantity: QUANTITY,
        page: PAGE
    });

    renderChat(res, entries);
};

export const sendMsg: RequestHandler = async (req, res) => {
    const params = req.body as {
        name: string;
        content: string;
    };
    const entry = {
        name: params.name,
        date: Date.now(),
        content: params.content
    };

    const [_, entries] = await sendMsgs(
        {
            type: 'create',
            ...entry
        },
        {
            type: 'read',
            quantity: QUANTITY,
            page: PAGE
        }
    );

    renderChat(res, entries);
};

export const editMsg: RequestHandler = async (req, res) => {
    const params = req.body as {
        id: string;
        name: string;
        content: string;
    };
    const entry = {
        id: params.id,
        name: params.name,
        date: Date.now(),
        content: params.content
    };

    const [_, entries] = await sendMsgs(
        {
            type: 'update',
            ...entry
        },
        {
            type: 'read',
            quantity: QUANTITY,
            page: PAGE
        }
    );

    renderChat(res, entries);
};

export const deleteMsg: RequestHandler = async (req, res) => {
    const params = req.body as { id: string };

    const [_, entries] = await sendMsgs(
        {
            type: 'delete',
            id: params.id
        },
        {
            type: 'read',
            quantity: QUANTITY,
            page: PAGE
        }
    );

    renderChat(res, entries);
};
