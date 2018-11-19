const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports =
{
    entry: ['../source/client.js'],
    performance:
    {
        //disable performance warnings for now
        hints: false
    },
    output:
    {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devServer:
    {
        contentBase: path.join(__dirname, "dist"),
        port: 8080,
        open: true,
        openPage: '?debug&host=127.0.0.1',
        watchContentBase: false
    },
    module:
    {
        rules:
        [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                  MiniCssExtractPlugin.loader,
                  'css-loader',
                  'sass-loader',
                ]
            },
            {
                test: /\.(eot|otf|png|jpg|jpeg|svg|ttf|woff|woff2)$/,
                loader: 'url-loader'
            }
        ],
    },
    resolve:
    {
        modules:
        [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.'),
            path.resolve(__dirname, '../source')
        ]
    },
    plugins:
    [
        new MiniCssExtractPlugin({ filename: "style.css" }),
        new CopyWebpackPlugin
        ([
            {
                from: './index.html',
                to: 'index.html'
            },
            {
                from: '../assets',
                to: 'assets',
                ignore: ['materials/**/*', 'from.txt']
            },
            {
                from: './libs',
                to: 'libs'
            },
        ],
        {
            ignore:
            [
                '*.psd',
                'from.txt',
            ]
        })
    ],
    optimization:
    {
        minimizer:
        [
            new UglifyJsPlugin
            ({
                cache: true,
                parallel: true,
                sourceMap: true // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
};