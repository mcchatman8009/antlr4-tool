const commander = require('commander');
const _ = require('lodash');
const chalk = require('chalk');
const compile = require('./compile');
const log = console.log;
const TypesInstaller = require('./types-installer').TypesInstaller;

let antlrGrammars;
const installer = new TypesInstaller();

const opts = commander.name("antlr4-tool")
    .arguments('<grammars...>')
    .option('-o --output-dir [output_dir]', "Output Directory (Default: Current Directory)")
    .option('-l --language [language]', "Antlr Language Target: ts, typescript, js, javascript (Default: typescript)")
    .option('--listener', "Generate parse tree listener (Default)")
    .option('--no-listener', "Don't generate parse tree listener")

    .option('--visitor', "Generate parse tree visitor (Default)")
    .option('--no-visitor', "Don't generate parse tree visitor")
    .action((...grammars) => antlrGrammars = _.flatten(grammars.slice(0, -1)))
    .parse(process.argv);

const config = {};

if (_.isNil(antlrGrammars)) {
    opts.help((str) => `Please specify grammar files \n${str}`);
}

config.language = (_.isNil(opts['language'])) ? 'TypeScript' : opts['language'];
config.grammarFiles = antlrGrammars;
config.outputDirectory = _.isNil(opts['outputDir']) ? '.' : opts['outputDir'];
config.visitor = opts['visitor'];
config.listener = opts['listener'];

log(`Compiling ${antlrGrammars.join(', ')}...`);

const compileResults = compile(config);
_.each(compileResults, (files, grammar) => {
    _.each(files, (file) => {
        log(`Generated ${chalk.blue.underline(file)}`);
    });
});
