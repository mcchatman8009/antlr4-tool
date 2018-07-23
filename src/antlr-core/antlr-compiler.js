const child = require("child_process");
const path = require("path");
const chdir = require('chdir');
const fs = require('fs');
const ejs = require('ejs');
const _ = require('lodash');
const parserUtil = require('./parser-util');

class AntlrCompiler {
    constructor(config) {
        this.config = config;
        this.jar = config.antlrJar;
        this.grammarFile = config.grammarFile;
        this.language = config.language;
        this.outputDirectory = config.outputDirectory;
    }

    compileTypeScriptParser(grammar, parser) {
        const className = `${grammar}Parser`;
        const dest = `${this.outputDirectory}/${className}.d.ts`;
        const template = fs.readFileSync(`${__dirname}/templates/parser.d.ts.ejs`).toString();
        const contextRules = parserUtil.contextObjectAst(parser);
        const methods = parserUtil.parserMethods(parser);

        const contents = ejs.render(template, {_, contextRules, className, methods});

        fs.writeFileSync(dest, contents);

        return dest;
    }

    compileTypeScriptListener(grammar, parser) {
        const className = `${grammar}Listener`;
        const dest = `${this.outputDirectory}/${className}.d.ts`;
        const template = fs.readFileSync(`${__dirname}/templates/listener.d.ts.ejs`).toString();
        const methods = _.flatten(_.map(parser.ruleNames, (rule) => {
            return [`${rule}Enter`, `${rule}Exit`];
        }));

        const contents = ejs.render(template, {_: _, className: className, methods: methods});

        fs.writeFileSync(dest, contents);

        return dest;
    }

    compileTypeScriptLexer(grammar) {
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
                const listenerFile = this.compileTypeScriptListener(grammar, parser);
                jsCompliedResults.filesGenerated.push(listenerFile);
            }

            const parserPath = this.compileTypeScriptParser(grammar, parser);
            jsCompliedResults.filesGenerated.push(parserPath);
        }

        return jsCompliedResults;
    }

    compileJavaScript() {
        const dir = path.dirname(this.grammarFile);
        const baseGrammarName = path.basename(this.grammarFile).replace('.g4', '');
        const grammarPrefix = _.first(`${baseGrammarName}`.split(/(?=[A-Z])/));
        let filesGenerated;
        let grammar;

        chdir(dir, () => {
            child.execSync('which java');

            const cmd = this.command();
            child.execSync(cmd).toString();

            const files = fs.readdirSync(this.outputDirectory);
            filesGenerated = _.filter(files, (file) => file.startsWith(baseGrammarName, 0));
            filesGenerated = _.filter(filesGenerated, (file) => (file.indexOf('Listener.') !== -1 && this.config.listener) || file.indexOf('Listener.') === -1);
            filesGenerated = _.filter(filesGenerated, (file) => (file.indexOf('Visitor.') !== -1 && this.config.visitor) || file.indexOf('Visitor.') === -1);

            const list = _.filter(filesGenerated, (file) => /(.*Lexer\..*)|(.*Parser\..*)/.test(file));
            grammar = _.first(list).replace(/(Lexer.*)|(Parser.*)/, '');


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

exports.AntlrCompiler = AntlrCompiler;
