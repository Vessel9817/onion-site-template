import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { MsgBoard } from '../../db';

/** Bidirectional overrides can make a name render as different text than it is */
const BIDI_CONTROLS = /[\u{202A}-\u{202E}\u{2066}-\u{2069}]/u;
/** Control characters other than tab and newline */
const CONTROLS_EXCEPT_WHITESPACE = /[^\P{Cc}\t\n]/u;
/** Any control character */
const CONTROLS = /\p{Cc}/u;
/** At least one character that is neither whitespace nor an invisible format character */
const VISIBLE = /[^\s\p{Cf}]/u;

/**
 * Normalizes line endings, so a message is measured the same way the browser measured it
 * @param value The submitted value
 * @returns The value with `\r\n` and lone `\r` as `\n`
 */
function normalizeNewlines(value: unknown): unknown {
    return typeof value === 'string' ? value.replace(/\r\n?/g, '\n') : value;
}

const idValidator = body('id')
    // Is stringified ObjectId (24 hexadecimal characters)
    .isString()
    .withMessage('Invalid id')
    .bail()
    .trim()
    .isLength({ min: 24, max: 24 })
    .withMessage('Invalid id')
    .bail()
    .isHexadecimal()
    .withMessage('Invalid id')
    .bail()
    .custom((rawId: string) => ObjectId.isValid(rawId))
    .withMessage('Invalid id')
    .bail()
    // Id exists in database. A resolved promise always passes, so the check has to throw
    .custom(async (rawId: string) => {
        const id = new ObjectId(rawId);

        if (!await MsgBoard.idExists(id)) {
            throw new Error('That message no longer exists');
        }
    })
    .bail();

const nameValidator = body('name')
    // Is a single string
    .isString()
    .withMessage('Please enter your display name')
    .bail()
    .trim()
    // Has something visible in it
    .matches(VISIBLE)
    .withMessage('Please enter your display name')
    .bail()
    // Is between 1 and 32 characters
    .isLength({ min: 1, max: 32 })
    .withMessage(
        'Display name must be between 1 and 32 characters, inclusive'
    )
    .bail()
    // Stays on one line and renders as typed
    .not()
    .matches(CONTROLS)
    .withMessage('Display name cannot contain control characters')
    .bail()
    .not()
    .matches(BIDI_CONTROLS)
    .withMessage('Display name cannot contain text direction controls')
    .bail();

const contentValidator = body('content')
    // Is a single string
    .isString()
    .withMessage('Please enter a message')
    .bail()
    .customSanitizer(normalizeNewlines)
    .trim()
    // Has something visible in it
    .matches(VISIBLE)
    .withMessage('Please enter a message')
    .bail()
    // Is between 1 and 2048 characters
    .isLength({ min: 1, max: 2048 })
    .withMessage((value: string) =>
        `Message must be between 1 and 2048 characters, inclusive (got ${value.length.toString()})`
    )
    .bail()
    // Plain text: tabs and newlines only
    .not()
    .matches(CONTROLS_EXCEPT_WHITESPACE)
    .withMessage('Message cannot contain control characters')
    .bail();

export const sendMsgValidators = [
    nameValidator,
    contentValidator
];

export const editMsgValidators = [
    ...sendMsgValidators,
    idValidator,
];

export const deleteMsgValidators = [idValidator];
