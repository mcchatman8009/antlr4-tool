import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as util from './util';
import * as vm from 'vm';

export function readLexer(grammar: string, lexerFile: string) {
    const contents = fs.readFileSync(lexerFile).toString();
    const context = { require, exports: {} };
    vm.createContext(context);
    vm.runInContext(contents, context);
    const Lexer = context.exports[`${grammar}Lexer`];
    const lexer = new Lexer(null);

    return lexer;
}

export function readParser(grammar: string, parserFile: string) {
    const contents = fs.readFileSync(parserFile).toString();
    const context = { require, exports: {} };
    vm.createContext(context);
    vm.runInContext(contents, context);
    const Parser = context.exports[`${grammar}Parser`];
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

export function classContextRules(parserClass: any) {
    return Object.keys(parserClass)
        .map((key: any) => parserClass[key])
        .filter(value => typeof value === 'function');
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
    const ownMethods = _.filter(methods, method => (
        ruleToContextMap.has(method.name) || symbols.has(method.name)
    ));

    return _.map(ownMethods, (method) => {
        const methodObj = {} as any;
        methodObj.name = method.name;

        if (ruleToContextMap.has(method.name)) {
            methodObj.type = ruleToContextMap.get(method.name);
            methodObj.args = method.args;
        } else if (symbols.has(method.name)) {
            methodObj.type = 'TerminalNode';
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
    const ParserClass = parser.constructor;
    const classCtxNames = classContextRules(ParserClass).map(rule => rule.name);
    const instanceCtxNames = contextRuleNames(parser);
    const ctxNames = _.union(instanceCtxNames, classCtxNames);

    const exportsStatements = _.map(ctxNames, (ctxType) => {
        return `exports.${ctxType} = ${ctxType};\n${ParserClass.name}.${ctxType} = ${ctxType};\n`;
    });

    return exportsStatements;
}

/**
 * Return all modules AST of all the rules
 * @param parser
 * @returns [...,{id: string, type: string}]
 */
export function contextObjectAst(parser: any) {
    const types = classContextRules(parser.constructor);
    const ruleToContextMap = ruleToContextTypeMap(parser);
    const symbols = symbolSet(parser);
    const rules = contextRuleNames(parser);

    return _.map(types, (context) => {
        const obj = {} as any;
        obj.name = context.name;

        const methods = _.filter(util.getMethods(context.prototype), (mth) => mth !== 'depth');
        const ownMethods = _.filter(methods, method => (
            ruleToContextMap.has(method.name) || symbols.has(method.name)
        ));

        obj.methods = _.map(ownMethods, (method) => {
            const methodObj = {} as any;
            methodObj.name = method.name;
            methodObj.args = method.args;

            if (ruleToContextMap.has(method.name)) {
                methodObj.type = ruleToContextMap.get(method.name);
            } else if (symbols.has(method.name)) {
                methodObj.type = 'TerminalNode';
            }

            return methodObj;
        });

        return obj;
    });
}
