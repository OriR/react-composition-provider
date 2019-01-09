const path = require('path');

module.exports = (webpackConfig, env, { paths }) => {
    webpackConfig.entry[webpackConfig.entry.length - 1] = path.resolve(__dirname, '.', 'examples', 'index.js');
    webpackConfig.module.rules[2].oneOf[1].include = [path.resolve(__dirname, '.', 'examples'), path.resolve(__dirname, '.', 'src')];
    return webpackConfig
}