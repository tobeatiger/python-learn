const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
    return {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                            //plugins: [require('@babel/plugin-transform-object-rest-spread')]
                        }
                    }
                }
            ]
        },
        plugins:  env === 'prod' ? [
            new UglifyJsPlugin()
        ] : []
    }
};