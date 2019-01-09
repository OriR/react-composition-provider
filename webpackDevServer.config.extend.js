const path = require('path');

module.exports = (webpackConfig, env, { paths }) => {
    // throw new Error(JSON.stringify(webpackConfig));
    // webpackConfig.entry[webpackConfig.entry.length - 1] = path.resolve(__dirname, '.', 'examples', 'index.js');
    return webpackConfig
}