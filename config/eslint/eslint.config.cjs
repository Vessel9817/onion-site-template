const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const stylistic = require('@stylistic/eslint-plugin');
const path = require('node:path');

/** @typedef {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} Config */

const JS_FILE_GLOBS = [
    '**/*.js',
    '**/*.cjs',
    '**/*.mjs',
    '**/*.ts',
    '**/*.cts',
    '**/*.mts'
];

/** @type {Config} */
const IGNORE_FILE_CONFIG = {
    ignores: [
        // Development
        '/config/eslint/**',
        '/config/onionscan/**',
        '**/coverage/**',
        '**/package-lock.json',
        '**/logs/**',
        '**/*.log',

        // Deployment
        '**/build/**',
        '**/dist/**',
        '**/*.min.*',
        '**/*.bundle.*',
        '**/*.map.js',
        '**/backup/**',

        // Temporary files
        '**/tmp/**',
        '**/temp/**',
        '**/cache/**',

        // Licenses
        '**/LICENSE',
        '**/LICENSE.md',
        '**/*.license',
        '**/licenses/**',

        // Dependencies
        '**/node_modules/**',
        '**/bower_components/**',

        // Secrets
        'hostname.txt',
        '**/.DS_Store',
        '**/.history',
        '**/.git/**',
        '**/*.env',
        '**/*.env.*',
        '**/secrets.json',
        '**/secrets.*.json',
        '**/secrets/**'
    ]
};

// https://typescript-eslint.io/users/configs/
const DEFAULT_JS_CONFIGS = tseslint.config([
    eslint.configs.recommended,
    stylistic.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname
            }
        }
    }
]);

/** @type {Config} */
const JS_CONFIG = {
    files: JS_FILE_GLOBS,
    languageOptions: {
        sourceType: 'script',
        parserOptions: {
            projectService: {
                allowDefaultProject: [path.resolve(__dirname, __filename)]
            }
        }
    },
    rules: {
        // https://eslint.org/docs/latest/rules/prefer-const
        'prefer-const': ['warn'],
        // https://eslint.style/rules/js/no-unexpected-multiline
        'no-unexpected-multiline': ['error'],

        // https://typescript-eslint.io/rules/no-require-imports
        '@typescript-eslint/no-require-imports': ['off'],
        // https://typescript-eslint.io/rules/prefer-includes
        '@typescript-eslint/prefer-includes': ['warn'],
        // https://typescript-eslint.io/rules/no-unused-vars
        '@typescript-eslint/no-unused-vars': ['warn'],
        // https://typescript-eslint.io/rules/no-empty-object-type
        '@typescript-eslint/no-empty-object-type': [
            'error',
            {
                allowInterfaces: 'with-single-extends',
                allowWithName: '^props$'
            }
        ],

        // https://eslint.style/rules/js/indent
        '@stylistic/indent': ['off'],
        // https://eslint.style/rules/js/semi
        '@stylistic/semi': [
            'warn',
            'always',
            {
                omitLastInOneLineBlock: true,
                omitLastInOneLineClassBody: true
            }
        ],
        // https://eslint.style/rules/js/no-extra-semi
        '@stylistic/no-extra-semi': ['warn'],
        // https://eslint.style/rules/js/comma-dangle
        '@stylistic/comma-dangle': ['off'],
        // https://eslint.style/rules/js/arrow-parens
        '@stylistic/arrow-parens': ['warn', 'as-needed'],
        // https://eslint.style/rules/js/member-delimiter-style
        '@stylistic/member-delimiter-style': [
            'error',
            {
                singleline: {
                    delimiter: 'semi',
                    requireLast: true
                },
                multiline: {
                    delimiter: 'semi',
                    requireLast: true
                }
            }
        ],
        // https://eslint.style/rules/js/jsx-quotes
        '@stylistic/jsx-quotes': ['warn', 'prefer-single'],
        // https://eslint.style/rules/jsx/jsx-indent-props
        '@stylistic/jsx-indent-props': ['off'],
        // https://eslint.style/rules/jsx/jsx-one-expression-per-line
        '@stylistic/jsx-one-expression-per-line': ['off']
    }
};

/** @type {Config[]} */
const CONFIG = [IGNORE_FILE_CONFIG, ...DEFAULT_JS_CONFIGS, JS_CONFIG];

module.exports = CONFIG;
