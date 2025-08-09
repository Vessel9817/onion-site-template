import { check } from 'express-validator';

export const sendMsgValidator = [
    check('name')
        // Is string
        .isString()
        .withMessage('Invalid display name')
        .bail()
        // Is not whitespace
        .trim()
        .notEmpty()
        .withMessage('Please enter your display name')
        .bail()
        // Is between 1 and 15 characters
        .isLength({
            min: 1,
            max: 15
        })
        .withMessage(
            'Display name must be between 1 and 15 characters, inclusive'
        )
        .bail()
    // TODO
];
