import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as util from './util';

const _eval = require('node-eval');

export function readLexer(grammar: string, lexerFile: string) {
    const outputDir = path.dirname(lexerFile);
    const contents = fs.readFileSync(lexerFile).toString();
    const Lexer = _eval(contents, `${outputDir}/eval.js`)[`${grammar}Lexer`];
    const lexer = new Lexer(null);

    return lexer;
}

export function readParser(grammar: string, parserFile: string) {
    const outputDir = path.dirname(parserFile);
    const contents = fs.readFileSync(parserFile).toString();
    const Parser = _eval(contents, `${outputDir}/eval.js`)[`${grammar}Parser`];
    const parser = new Parser(null);

    return parser;
}

export function contextRuleNames(parser: any) {
    return _.map(parser.ruleNames, (rule) => `${util.capitalizeFirstLetter(rule)}Context`);
}

export function contextRules(parser: any) {
    const rules = contextRuleNames(parser);

    return _.map(rules, (context) => {
        return parser.constructor[context];
    });
}

export function contextToRuleMap(parser: any) {
    const map = new Map();
    _.each(parser.ruleNames, (rule) => {
        const context = `${util.capitalizeFirstLetter(rule)}Context`;
        map.set(context, rule);
    });

    return map;
}

export function ruleToContextTypeMap(parser: any) {
    const map = new Map();
    _.each(parser.ruleNames, (rule) => {
        const context = `${util.capitalizeFirstLetter(rule)}Context`;
        map.set(rule, context);
    });

    return map;
}

export function symbolSet(parser: any) {
    const set = new Set();
    _.each(parser.symbolicNames, (name) => {
        set.add(name);
    });

    return set;
}

export function parserMethods(parser: any) {
    const ruleToContextMap = ruleToContextTypeMap(parser);
    const symbols = symbolSet(parser);
    const obj = {};

    const methods = util.getMethods(parser);

    return _.map(methods, (method) => {
        const methodObj = {} as any;
        methodObj.name = method.name;

        if (ruleToContextMap.has(method.name)) {
            methodObj.type = ruleToContextMap.get(method.name);
            methodObj.args = method.args;
        } else if (symbols.has(method.name)) {
            methodObj.type = 'TerminalNode';
            methodObj.args = method.args;
        } else {
            methodObj.type = 'any';
            methodObj.args = method.args;
        }

        return methodObj;
    });
}

/**
 *
 * @param parser
 * @returns {string[]}
 */
export function exportedContextTypes(parser: any) {
    const ParserClass = parser.constructor.name;
    const ctxNames = contextRuleNames(parser);

    const exportsStatements = _.map(ctxNames, (ctxType) => {
        return `exports.${ctxType} = ${ctxType};\n${ParserClass}.${ctxType} = ${ctxType};\n`;
    });

    return exportsStatements;
}

/**
 * Return all modules AST of all the rules
 * @param parser
 * @returns [...,{id: string, type: string}]
 */
export function contextObjectAst(parser: any) {
    const types = contextRules(parser);
    const ruleToContextMap = ruleToContextTypeMap(parser);
    const symbols = symbolSet(parser);
    const rules = contextRuleNames(parser);

    return _.map(types, (context) => {
        const obj = {} as any;
        obj.name = context.name;

        const methods = _.filter(util.getMethods(context.prototype), (mth) => mth !== 'depth');
        obj.methods = _.map(methods, (method) => {
            const methodObj = {} as any;
            methodObj.name = method.name;
            methodObj.args = method.args;

            if (ruleToContextMap.has(method.name)) {
                methodObj.type = ruleToContextMap.get(method.name);
            } else if (symbols.has(method.name)) {
                methodObj.type = 'TerminalNode';
            } else {
                methodObj.type = 'any';
            }

            return methodObj;
        });

        return obj;
    });
}
