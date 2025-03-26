import eslint from '@eslint/js';
import json from '@eslint/json';
import pluginReact from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

const REACT_FILE_GLOBS = ['**/*.jsx', '**/*.tsx'];
const JS_FILE_GLOBS = [
    '**/*.js',
    '**/*.cjs',
    '**/*.mjs',
    '**/*.ts',
    ...REACT_FILE_GLOBS
];

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config} */
const IGNORE_FILE_CONFIG = {
    ignores: [
        // Configuration
        '/config/eslint/**',

        // Dependencies
        '**/node_modules/**',

        // Development
        '/coverage/**',
        '**/test/**',
        '**/testing/**',
        '**/package-lock.json',

        // Deployment
        '/build/**',
        '/dist/**',
        '/zip/**',
        '**/*.min.*',
        '**/*.bundle.*',
        '**/*.map.js',

        // Secrets
        '**/.DS_Store',
        '**/*.env',
        '**/*.env.*',
        '**/.history',

        // Temporary files
        '**/tmp/**',
        '**/temp/**',
        '**/backup/**',
        '**/cache/**',
        '**/logs/**',

        // Licenses
        '**/LICENSE',
        '**/LICENSE.md',
        '**/*.license'
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
                tsconfigRootDir: import.meta.dirname // Node.js >=20.11.0
            }
        }
    }
]);

// https://github.com/eslint/json?tab=readme-ov-file#recommended-configuration
const DEFAULT_JSON_CONFIGS = [
    // {
    //     ...json.configs.recommended,
    //     files: ['**/*.json'],
    //     language: 'json/json'
    // },
    // {
    //     ...json.configs.recommended,
    //     files: ['**/*.jsonc', '/.vscode/*.json'],
    //     language: 'json/jsonc'
    // },
    {
        ...json.configs.recommended,
        files: ['**/*.json5'],
        language: 'json/json5'
    }
];

const DEFAULT_REACT_CONFIG = pluginReact.configs.flat.recommended;

const JS_CONFIG = {
    files: JS_FILE_GLOBS,
    languageOptions: {
        sourceType: 'script'
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

const EXTENSION_CONFIG = {
    files: JS_FILE_GLOBS,
    languageOptions: {
        globals: {
            chrome: 'readonly'
        }
    }
};

const CONFIG = [
    IGNORE_FILE_CONFIG,
    ...DEFAULT_JS_CONFIGS,
    ...DEFAULT_JSON_CONFIGS,
    DEFAULT_REACT_CONFIG,
    JS_CONFIG,
    EXTENSION_CONFIG
];

export default CONFIG;
