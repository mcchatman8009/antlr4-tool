const _ = require('lodash');
const antlr = require('./antlr-core');

module.exports = (config) => {
    const compileResults = antlr.compile(config);
    return compileResults;
};
