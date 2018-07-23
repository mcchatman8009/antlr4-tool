const AntlrCompiler = require('./antlr-compiler').AntlrCompiler;
const _ = require('lodash');
const path = require('path');
const constants = require('./constants');

function compileWithFunction(config, compileFunction) {
    const compiledResults = {};

    _.each(config.grammarFiles, (grammar) => {
        const opts = _.clone(config);
        opts.grammarFile = path.resolve(grammar);
        opts.outputDirectory = path.resolve(config.outputDirectory);

        if (_.isNil(config.antlrJar)) {
            opts.antlrJar = path.resolve(constants.ANTLR_JAR);
        }

        const compiler = new AntlrCompiler(opts);
        const results = compileFunction(compiler);

        if (!_.isNil(compiledResults[results.grammar])) {
            _.each(results.filesGenerated, (val) => {
                compiledResults[results.grammar].push(val);
            });
        } else {
            compiledResults[results.grammar] = results.filesGenerated;
        }
    });

    // Remove duplicate files
    _.each(compiledResults, (list, key) => {
        compiledResults[key] = _.uniq(list);
    });

    return compiledResults;
}

function compileGrammarAsJavaScript(config) {
    return compileWithFunction(config, (compiler) => compiler.compileJavaScript());
}

function compileGrammarAsTypeScript(config) {
    config = _.clone(config);

    // Define the language as JavaScript for the Antlr4 Jar
    config.language = 'JavaScript';
    return compileWithFunction(config, (compiler) => compiler.compileTypeScript());
}

function compile(config) {
    config.outputDirectory = path.resolve(config.outputDirectory);

    switch (config.language) {
        case 'JavaScript':
            return compileGrammarAsJavaScript(config);
        case 'TypeScript':
            return compileGrammarAsTypeScript(config);

        default:
            throw new Error(`Unsupported Language: ${config.language}`);
    }
}

exports.compile = compile;
