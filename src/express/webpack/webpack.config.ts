import path from 'node:path';
import process from 'node:process';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { NODE_ENV } from './env';

const PROJECT_ROOT = process.cwd();
const OUTPUT_DIR = 'dist';

const config: webpack.Configuration = {
    mode: NODE_ENV,
    devtool: NODE_ENV === 'development' && 'cheap-module-source-map',
    target: 'node',
    entry: {
        index: {
            import: path.join(PROJECT_ROOT, 'app.ts')
        }
    },
    output: {
        filename: '[name].cjs',
        path: path.resolve(PROJECT_ROOT, OUTPUT_DIR),
        clean: true,
        publicPath: '/'
    },
    optimization: {
        nodeEnv: NODE_ENV,
        minimize: NODE_ENV === 'production',
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false
                    }
                }
            })
        ]
    },
    resolve: {
        extensions: [
            '.mts', // CTS/MTS before TS
            '.ts', // TS must come before JS
            '.mjs', // CJS/MJS before JS
            '.js'
        ],
        fallback: {
            // Don't try to bundle unused optional dependencies
            '@aws-sdk/credential-providers': false,
            '@mongodb-js/zstd': false,
            'gcp-metadata': false,
            'kerberos': false,
            'mongodb-client-encryption': false,
            'snappy': false,
            'socks': false
        }
    },
    externalsPresets: {
        node: true
    },
    module: {
        rules: [
            // TS (must come before JS)
            {
                test: /\.(m?ts)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                emitDeclarationOnly: false,
                                noEmit: false
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        // Resolving dynamic import with Express view engine
        // https://github.com/CorpGlory/express-webpack-example
        new webpack.ContextReplacementPlugin(
            /express\/lib/,
            path.resolve(PROJECT_ROOT, 'node_modules'),
            { ejs: 'ejs' }
        )
    ],
    infrastructureLogging: {
        level: 'info'
    }
};

export default config;
