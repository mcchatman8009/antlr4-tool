const _ = require('lodash');
const antlr = require('./antlr-core');

module.exports = (config) => {
    if (_.isNil(config.language)) {
        config.language = 'TypeScript';
    }

    const compileResults = antlr.compile(config);

    return compileResults;
};
