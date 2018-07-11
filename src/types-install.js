const commander = require('commander');
const _ = require('lodash');
const chalk = require('chalk');
const TypesInstaller = require('./types-installer').TypesInstaller;
const log = console.log;
const path = require('path');

const installer = new TypesInstaller();

const opts = commander.name("antlr4-types-install")
    .option('-o --output-dir [output_dir]', "Output Directory")
    .action((...grammars) => antlrGrammars = grammars.slice(0, -1))
    .parse(process.argv);

if (opts['outputDir']) {
    installer.outputPath = path.resolve(opts['outputDir']);
}


log(`Installing antlr4 types into ${chalk.underline.blue(installer.outputPath)}...`);
log(chalk.red(`Please keep in mind that this installer is a temporary hack, until @types/antlr4 is ready.`));
installer.install();
log(`Done!`);

