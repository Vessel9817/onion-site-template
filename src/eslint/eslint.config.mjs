import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import tseslint from 'typescript-eslint';

/** @typedef {import('eslint/config').Config} Config */

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
        '**/coverage/**',
        '**/logs/**',
        '**/*.log',
        '/src/nginx/**/*.conf',

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
const DEFAULT_JS_CONFIGS = defineConfig([
    eslint.configs.recommended,
    stylistic.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            // https://typescript-eslint.io/getting-started/typed-linting/
            parserOptions: {
                tsconfigRootDir: path.resolve(import.meta.dirname, '..', '..', 'tsconfig.json'),
                projectService: {
                    allowDefaultProject: [import.meta.filename]
                }
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
        // https://typescript-eslint.io/rules/restrict-template-expressions/
        '@typescript-eslint/restrict-template-expressions': ['error'],

        // https://eslint.style/rules/js/indent
        '@stylistic/indent': ['warn', 4],
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
        // https://eslint.style/rules/operator-linebreak
        '@stylistic/operator-linebreak': ['error', 'before'],
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

export default CONFIG;
