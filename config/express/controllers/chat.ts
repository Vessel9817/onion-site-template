import { type RequestHandler } from 'express';
import { v4 as uuid } from 'uuid';

// TODO Mocking DB
interface MockDbEntry {
    readonly id: string;
    name: string;
    content: string;
    date: number;
}

const MOCK_MSG_DB = new Array<MockDbEntry>();
const PAGE_SIZE = 10;

function getMockEntryPosition(id: string): number {
    return MOCK_MSG_DB.findIndex((e) => e.id === id);
}

function getPagedMockEntries(page?: number): MockDbEntry[] {
    const MAX_PAGE_SIZE = Math.ceil(MOCK_MSG_DB.length / PAGE_SIZE);

    // Page 1 corresponds to newest entries
    page = page ?? 1;

    // 1 <= page <= MAX_PAGE_SIZE
    page = Math.min(Math.max(1, page), MAX_PAGE_SIZE);

    const out = MOCK_MSG_DB.slice(PAGE_SIZE * (page - 1), PAGE_SIZE * page);

    // Ordering newest entries at the end
    return out.reverse();
}

function addMockEntry(entry: Omit<MockDbEntry, 'id'>): void {
    // Entries ordered from newest to oldest
    MOCK_MSG_DB.unshift({
        ...entry,
        id: uuid()
    });
}

function updateMockEntry(
    entry: { readonly id: string } & Partial<MockDbEntry>
): void {
    const index = getMockEntryPosition(entry.id);

    if (index >= 0) {
        MOCK_MSG_DB[index] = {
            ...MOCK_MSG_DB[index],
            ...entry
        };
    }
}

function deleteMockEntry(id: string): void {
    const index = getMockEntryPosition(id);

    if (index >= 0) {
        MOCK_MSG_DB.splice(index, 1);
    }
}

// Defining routes
export const getChat: RequestHandler = (req, res) => {
    const entries = getPagedMockEntries();
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
};

export const sendMsg: RequestHandler = (req, res) => {
    const params = req.body as {
        name: string;
        content: string;
    };
    const entry = {
        name: params.name,
        date: Date.now(),
        content: params.content
    };

    addMockEntry(entry);
    res.redirect('/chat');
};

export const editMsg: RequestHandler = (req, res) => {
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

    updateMockEntry(entry);
    res.redirect('/chat');
};

export const deleteMsg: RequestHandler = (req, res) => {
    const params = req.body as { id: string };

    deleteMockEntry(params.id);
    res.redirect('/chat');
};
