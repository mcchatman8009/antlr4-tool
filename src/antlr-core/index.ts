import * as path from 'path';
import * as _ from 'lodash';
import {AntlrCompiler} from './antlr-compiler';
import * as constants from './constants';

export interface AntlrCompilerConfig {
    language: 'js' | 'javascript' | 'JavaScript' | 'ts' | 'typescript' | 'TypeScript';
    grammarFiles: string[];
    outputDirectory: string;
    antlrJar?: string;
    listener?: boolean;
    visitor?: boolean;
}

export interface AntlrCompilerResult {
    [grammar: string]: string[];
}

function compileWithFunction(config: AntlrCompilerConfig, compileFunction: (compiler: AntlrCompiler) => { grammar: string, filesGenerated: string[] }): AntlrCompilerResult {
    const compiledResults = {} as any;

    _.each(config.grammarFiles, (grammar) => {
        const opts = _.clone(config) as any;
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

function compileGrammarAsJavaScript(config: AntlrCompilerConfig): AntlrCompilerResult {
    return compileWithFunction(config, (compiler) => compiler.compileJavaScript());
}

function compileGrammarAsTypeScript(config: AntlrCompilerConfig): AntlrCompilerResult {
    config = _.clone(config);

    // Define the language as JavaScript for the Antlr4 Jar
    config.language = 'JavaScript';
    return compileWithFunction(config, (compiler) => compiler.compileTypeScript());
}

export function compile(config: AntlrCompilerConfig): AntlrCompilerResult {
    config.outputDirectory = path.resolve(config.outputDirectory);

    switch (config.language) {
        case 'js':
        case 'javascript':
        case 'JavaScript':
            config.language = 'JavaScript';
            return compileGrammarAsJavaScript(config);
        case 'ts':
        case 'typescript':
        case 'TypeScript':
            config.language = 'TypeScript';
            return compileGrammarAsTypeScript(config);

        default:
            throw new Error(`Unsupported Language: ${config.language}`);
    }
}
