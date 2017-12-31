const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
    return {
        plugins:  env === 'prod' ? [
            new UglifyJsPlugin()
        ] : []
    }
};