// const child = require("child_process");
import * as child from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as _ from 'lodash';
import * as parserUtil from './parser-util';

const chdir = require('chdir');

export class AntlrCompiler {
    private config: any;
    private jar: string;
    private grammarFile: string;
    private language: string;
    private outputDirectory: string;

    constructor(config: any) {
        this.config = config;
        this.jar = config.antlrJar;
        this.grammarFile = config.grammarFile;
        this.language = config.language;
        this.outputDirectory = config.outputDirectory;
    }

    compileTypeScriptParser(grammar: string, parser: any) {
        const className = `${grammar}Parser`;
        const dest = `${this.outputDirectory}/${className}.d.ts`;
        const template = fs.readFileSync(`${__dirname}/templates/parser.d.ts.ejs`).toString();
        const contextRules = parserUtil.contextObjectAst(parser);
        const methods = parserUtil.parserMethods(parser);

        const contents = ejs.render(template, {_, contextRules, className, methods});

        fs.writeFileSync(dest, contents);

        return dest;
    }

    capitalize = (s: string) => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    compileTypeScriptListener(grammar: string, parser: any) {
        const className = `${grammar}Listener`;
        const dest = `${this.outputDirectory}/${className}.d.ts`;
        const template = fs.readFileSync(`${__dirname}/templates/listener.d.ts.ejs`).toString();
        const map = parserUtil.ruleToContextTypeMap(parser);

        const methods = _.flatten(_.map(parser.ruleNames, (rule) => {
            return [`enter${this.capitalize(rule)}(ctx: ${map.get(rule)}): void;`, `exit${this.capitalize(rule)}(ctx: ${map.get(rule)}): void;`];
        }));

        const imports = _.flatten(_.map(parser.ruleNames, (rule) => {
            if (grammar.indexOf('Parser') === -1) {
                return `import {${map.get(rule)}} from './${grammar}Parser';`;
            } else {
                return `import {${map.get(rule)}} from './${grammar}';`;
            }
        }));

        const contents = ejs.render(template, {_: _, className: className, methods: methods, imports});

        fs.writeFileSync(dest, contents);

        return dest;
    }

    compileTypeScriptLexer(grammar: string) {
        const className = `${grammar}Lexer`;
        const dest = `${this.outputDirectory}/${className}.d.ts`;
        const template = fs.readFileSync(`${__dirname}/templates/lexer.d.ts.ejs`).toString();
        const contents = ejs.render(template, {className: className});

        fs.writeFileSync(dest, contents);

        return dest;
    }

    compileTypeScript() {
        const jsCompliedResults = this.compileJavaScript();
        const grammar = jsCompliedResults.grammar;
        const parserFile = `${this.outputDirectory}/${grammar}Parser.js`;


        if (fs.existsSync(parserFile)) {
            let parser = parserUtil.readParser(grammar, parserFile);
            const lines = parserUtil.exportedContextTypes(parser);

            _.each(lines, (line) => {
                fs.appendFileSync(parserFile, line);
            });


            // Read Again
            parser = parserUtil.readParser(grammar, parserFile);
            const lexerFile = this.compileTypeScriptLexer(grammar);
            jsCompliedResults.filesGenerated.push(lexerFile);

            if (this.config.listener) {
                if (fs.existsSync(`${this.outputDirectory}/${grammar}Listener.js`)) {
                    const listenerFile = this.compileTypeScriptListener(grammar, parser);
                    jsCompliedResults.filesGenerated.push(listenerFile);
                } else if (fs.existsSync(`${this.outputDirectory}/${grammar}ParserListener.js`)) {
                    const listenerFile = this.compileTypeScriptListener(`${grammar}Parser`, parser);
                    jsCompliedResults.filesGenerated.push(listenerFile);
                }
            }

            const parserPath = this.compileTypeScriptParser(grammar, parser);
            jsCompliedResults.filesGenerated.push(parserPath);
        }

        return jsCompliedResults;
    }

    compileJavaScript(): { grammar: string, filesGenerated: string[] } {
        const dir = path.dirname(this.grammarFile);
        const baseGrammarName = path.basename(this.grammarFile).replace('.g4', '');
        const grammarPrefix = _.first(`${baseGrammarName}`.split(/(?=[A-Z])/));
        let filesGenerated: string[];
        let grammar;

        chdir(dir, () => {
            if (process.platform === 'win32') {
                child.execSync('where java');
            } else {
                child.execSync('which java');
            }

            const cmd = this.command();
            try {
                child.execSync(cmd).toString();
            } catch (error) {
                process.exit(1);
            }

            const files = fs.readdirSync(this.outputDirectory);
            filesGenerated = _.filter(files, (file) => file.startsWith(baseGrammarName, 0));
            filesGenerated = filesGenerated.filter((file) => (file.indexOf('Listener.') !== -1 && this.config.listener) || file.indexOf('Listener.') === -1);
            filesGenerated = filesGenerated.filter((file) => (file.indexOf('Visitor.') !== -1 && this.config.visitor) || file.indexOf('Visitor.') === -1);

            const list = _.filter(filesGenerated, (file) => /(.*Lexer\..*)|(.*Parser\..*)/.test(file));
            if (!_.isEmpty(list)) {
                grammar = _.first(list).replace(/(Lexer.*)|(Parser.*)/, '');
            } else {
                grammar = baseGrammarName;
            }


            // Set the absolute paths on all the files
            filesGenerated = _.map(filesGenerated, (file) => `${this.outputDirectory}/${file}`);
        });

        return {grammar, filesGenerated};
    }

    command() {
        const grammar = path.basename(this.grammarFile);
        const opts = this.additionalCommandOpts();
        return `java -jar ${this.jar} -Dlanguage=${this.language} ${opts} -lib . -o ${this.outputDirectory} ${grammar}`;
    }

    additionalCommandOpts() {
        let optsStr = '';

        if (this.config.listener) {
            optsStr += ` -listener`;
        } else {
            optsStr += ` -no-listener`;
        }

        if (this.config.visitor) {
            optsStr += ` -visitor`;
        } else {
            optsStr += ` -no-visitor`;
        }

        return optsStr;
    }
}
