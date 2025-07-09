import assert from 'assert';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownMsg = Record<any, any>;

export function validateObject(msg: unknown): asserts msg is UnknownMsg {
    assert.ok(
        typeof msg === 'object' && msg !== null,
        'Expected a non-null object'
    );
}

export function validateNumber(prop: unknown): asserts prop is number {
    assert.ok(
        typeof prop === 'number' && isFinite(prop),
        'Expected a finite number'
    );
}

export function validateDateTime(prop: unknown): asserts prop is number {
    const LEEWAY_MS = 500;

    validateNumber(prop);
    assert.ok(
        prop > 0 && prop <= Date.now() + LEEWAY_MS,
        "Expected a positive Epoch date that's not in the future"
    );
}

export function validateString(prop: unknown): asserts prop is string {
    assert.ok(
        typeof prop === 'string' && prop.length > 0,
        'Expected a non-empty string'
    );
}
