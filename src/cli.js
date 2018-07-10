const commander = require('commander');
const _ = require('lodash');
const chalk = require('chalk');
const compile = require('./compile');
const log = console.log;

let antlrGrammars;

const opts = commander.name("antlr4-tool")
    .arguments('<grammars...>')
    .option('-o --output-dir [output_dir]', "Output Directory")
    .option('-l --language [language]', "Language (Default: TypeScript)")
    .action((...grammars) => antlrGrammars = grammars.slice(0, -1))
    .parse(process.argv);

const config = {};
config.language = opts['language'];
config.grammarFiles = antlrGrammars;
config.outputDirectory = _.isNil(opts['outputDir']) ? '.' : opts['outputDir'];

log(`Compiling ${antlrGrammars.join(', ')}...`);

const compileResults = compile(config);
_.each(compileResults, (files, grammar) => {
    _.each(files, (file) => {
        log(`Generated ${chalk.blue.underline(file)}`);
    });
});

// console.log(res);
