const path = require('path');
const webpack = require('webpack')

module.exports = {
    target: 'electron-main',
    entry: { main: './main.js',
        preload: './app/preload/preload.js' },
    output: {
        path: path.resolve('./build'),
        filename: '[name].js'
    },
    node: {
        __dirname: true
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.FLUENTFFMPEG_COV': false
        })
    ],
    externals: [ {
        'electron-debug': 'require(\'electron-debug\')',
        'electron-reload': 'require(\'electron-reload\')'
    } ],
    resolve: {
        modules: [
            path.resolve('./node_modules')
        ]
    }
};

