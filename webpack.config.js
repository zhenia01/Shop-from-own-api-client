const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// ... contents of webpack.config.js
module.exports = {
    mode: "development",
    entry: { 
        shop: './src/shop.js', 
        adminPanel: './src/admin.js'
    },
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: 'js/[name].js',
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            // ...additional rules...
        ],
    },

    module: {
        rules: [
            // ...additional rules...
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/[name].css",
        }),
    ],
};
