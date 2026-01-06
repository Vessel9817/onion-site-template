const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const stylistic = require('@stylistic/eslint-plugin');
const path = require('node:path');
const globals = require('globals');

/** @typedef {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} Config */

const JS_FILE_GLOBS = [
    '**/*.js',
    '**/*.cjs',
    '**/*.mjs',
    '**/*.ts',
    '**/*.cts',
    '**/*.mts'
];
const MONGO_JS_FILE_GLOBS = [
    '**/mongo/**/*.js',
    '**/mongo/**/*.cjs',
    '**/mongo/**/*.ts',
    '**/mongo/**/*.cts'
];

/** @type {Config} */
const IGNORE_FILE_CONFIG = {
    ignores: [
        // Development
        '/src/eslint/**',
        '/onionscan/**',
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
                projectService: true
            },
            globals: {
                ...globals.node
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
        // https://typescript-eslint.io/rules/no-namespace
        '@typescript-eslint/no-namespace': ['off'],

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
        '@stylistic/arrow-parens': ['warn', 'always'],
        // https://eslint.style/rules/js/member-delimiter-style
        '@stylistic/member-delimiter-style': [
            'error',
            {
                singleline: {
                    delimiter: 'semi',
                    requireLast: false
                },
                multiline: {
                    delimiter: 'semi',
                    requireLast: true
                }
            }
        ],
        // https://eslint.style/rules/js/quotes
        '@stylistic/quotes': [
            'warn',
            'single',
            {
                avoidEscape: true,
                allowTemplateLiterals: 'always'
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

/** @type {Config} */
const MONGO_JS_CONFIG = {
    files: MONGO_JS_FILE_GLOBS,
    languageOptions: {
        globals: {
            ...globals.mongo,
            db: 'writable',
            disableTelemetry: 'readonly'
        }
    }
};

/** @type {Config[]} */
const CONFIG = [
    IGNORE_FILE_CONFIG,
    ...DEFAULT_JS_CONFIGS,
    JS_CONFIG,
    MONGO_JS_CONFIG
];

module.exports = CONFIG;
