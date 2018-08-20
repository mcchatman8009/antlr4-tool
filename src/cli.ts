import * as commander from 'commander';
import * as _ from 'lodash';
import * as chalk from 'chalk';
import * as fs from 'fs';
import {compile} from './compile';

const log = console.log;

let antlrGrammars: string[];

const opts = commander.name('antlr4-tool')
    .arguments('<grammars...>')
    .option('-o --output-dir [output_dir]', 'Output Directory (Default: Current Directory)')
    .option('-l --language [language]', 'Antlr Language Target: ts, typescript, js, javascript (Default: typescript)')
    .option('--listener', 'Generate parse tree listener (Default)')
    .option('--no-listener', 'Don\'t generate parse tree listener')

    .option('--visitor', 'Generate parse tree visitor (Default)')
    .option('--no-visitor', 'Don\'t generate parse tree visitor')
    .action((...grammars) => antlrGrammars = _.flatten(grammars.slice(0, -1)))
    .parse(process.argv);

const config = {} as any;

if (_.isNil(antlrGrammars)) {
    opts.help((str) => `Please specify grammar files.\n${str}`);
    process.exit(1);
}

config.language = (_.isNil(opts['language'])) ? 'TypeScript' : opts['language'];
config.grammarFiles = antlrGrammars;
config.outputDirectory = _.isNil(opts['outputDir']) ? '.' : opts['outputDir'];
config.visitor = opts['visitor'];
config.listener = opts['listener'];

log(`Compiling ${antlrGrammars.join(', ')}...`);

_.each(antlrGrammars, (file) => {
    if (fs.existsSync(file) === false) {
        log(`The file ${file} doesn't exists.`);
        process.exit(1);
    } else if (fs.statSync(file).isFile() === false) {
        log(`${file} is not a file.`);
        process.exit(1);
    }
});

const compileResults = compile(config);
_.each(compileResults, (files, grammar) => {
    _.each(files, (file) => {
        log(`Generated ${(chalk as any).blue.underline(file)}`);
    });
});
