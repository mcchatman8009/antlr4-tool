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
    .option('-o --output-dir [output_dir]', "Output Directory")
    .option('-l --language [language]', "Language (Default: TypeScript)")
    .option('-i --install-types', "Install the Antlr4 types into node_modules/@types/antlr4")
    .action((...grammars) => antlrGrammars = grammars.slice(0, -1))
    .parse(process.argv);

const config = {};
config.language = opts['language'];
config.grammarFiles = antlrGrammars;
config.outputDirectory = _.isNil(opts['outputDir']) ? '.' : opts['outputDir'];

if (opts['installTypes']) {
    log(`Installing antlr4 types into ${chalk.underline.blue(installer.outputPath)}...`);
    log(chalk.red(`Please keep in mind that this installer is a temporary hack, until @types/antlr4 is ready.`));

    installer.install();

    log(`Done!`);
} else {
    log(`Compiling ${antlrGrammars.join(', ')}...`);

    const compileResults = compile(config);
    _.each(compileResults, (files, grammar) => {
        _.each(files, (file) => {
            log(`Generated ${chalk.blue.underline(file)}`);
        });
    });
}
