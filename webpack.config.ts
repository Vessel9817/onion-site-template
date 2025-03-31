import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

// Loading secrets
let secretsPath = path.join(__dirname, `secrets.${process.env.NODE_ENV}.js'`);

let fileExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'eot',
    'otf',
    'svg',
    'ttf',
    'woff',
    'woff2'
];

const IS_DEV_MODE = process.env.NODE_ENV !== 'production';

let config: webpack.Configuration = {
    mode: IS_DEV_MODE ? 'development' : 'production',
    entry: {
        // TODO No entry point yet
        popup: path.join(__dirname, 'src', 'pages', 'Popup', 'index.tsx')
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'build'),
        clean: true,
        publicPath: process.env.ASSET_PATH
    },
    module: {
        rules: [
            {
                test: /\.(css|scss)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
                exclude: /node_modules/,
                type: 'asset/resource'
                // loader: 'file-loader',
                // options: {
                //   name: '[name].[ext]',
                // },
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: 'html-loader'
            },
            {
                // TS(X) must come before JS(X)
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('ts-loader'),
                        options: {
                            transpileOnly: IS_DEV_MODE
                        }
                    }
                ]
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'source-map-loader'
                    },
                    {
                        loader: require.resolve('babel-loader')
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            secrets: secretsPath
        },
        extensions: fileExtensions
            .map((extension) => '.' + extension)
            .concat([
                '.ts',
                '.tsx', // TS(X) must come before JS(X)
                '.js',
                '.jsx',
                '.css'
            ])
    },
    plugins: [
        new CleanWebpackPlugin({ verbose: false }),
        new webpack.ProgressPlugin(),
        // expose and write the allowed env vars on the compiled bundle
        new webpack.EnvironmentPlugin(['NODE_ENV'])
    ],
    infrastructureLogging: {
        level: 'info'
    }
};

if (IS_DEV_MODE) {
    config.devtool = 'cheap-module-source-map';
} else {
    config.optimization = {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false
            })
        ]
    };
}

const FINAL_CONFIG = config;

module.exports = FINAL_CONFIG;
