const fs = require('fs');
const util = require('./util');
const _ = require('lodash');
const path = require('path');
const _eval = require("node-eval");

function readLexer(grammar, lexerFile) {
    const outputDir = path.dirname(lexerFile);
    const contents = fs.readFileSync(lexerFile).toString();
    const Lexer = _eval(contents, `${outputDir}/eval.js`)[`${grammar}Lexer`];
    const lexer = new Lexer(null);

    return lexer;
}

function readParser(grammar, parserFile) {
    const outputDir = path.dirname(parserFile);
    const contents = fs.readFileSync(parserFile).toString();
    const Parser = _eval(contents, `${outputDir}/eval.js`)[`${grammar}Parser`];
    const parser = new Parser(null);

    return parser;
}

function contextRuleNames(parser) {
    return _.map(parser.ruleNames, (rule) => `${util.capitalizeFirstLetter(rule)}Context`);
}

function contextRules(parser) {
    const rules = contextRuleNames(parser);

    return _.map(rules, (context) => {
        return parser.constructor[context];
    });
}

function contextToRuleMap(parser) {
    const map = new Map();
    _.each(parser.ruleNames, (rule) => {
        const context = `${util.capitalizeFirstLetter(rule)}Context`;
        map.set(context, rule);
    });

    return map;
}

function ruleToContextTypeMap(parser) {
    const map = new Map();
    _.each(parser.ruleNames, (rule) => {
        const context = `${util.capitalizeFirstLetter(rule)}Context`;
        map.set(rule, context);
    });

    return map;
}

function symbolSet(parser) {
    const set = new Set();
    _.each(parser.symbolicNames, (name) => {
        set.add(name);
    });

    return set;
}

function parserMethods(parser) {
    const ruleToContextMap = ruleToContextTypeMap(parser);
    const symbols = symbolSet(parser);
    const obj = {};

    const methods = util.noArgMethods(parser);

    return _.map(methods, (method) => {
        const methodObj = {};
        methodObj.name = method;

        if (ruleToContextMap.has(method)) {
            methodObj.type = ruleToContextMap.get(method);
        } else if (symbols.has(method)) {
            methodObj.type = 'TerminalNode';
        } else {
            methodObj.type = 'any';
        }

        return methodObj;
    });
}

/**
 *
 * @param parser
 * @returns {string[]}
 */
function exportedContextTypes(parser) {
    const ParserClass = parser.constructor.name;
    const contextRules = contextRuleNames(parser);

    const exportsStatements = _.map(contextRules, (ctxType) => {
        return `exports.${ctxType} = ${ctxType};\n${ParserClass}.${ctxType} = ${ctxType};\n`;
    });

    return exportsStatements;
}

/**
 * Return all modules AST of all the rules
 * @param parser
 * @returns [...,{id: string, type: string}]
 */
function contextObjectAst(parser) {
    const types = contextRules(parser);
    const ruleToContextMap = ruleToContextTypeMap(parser);
    const symbols = symbolSet(parser);
    const rules = contextRuleNames(parser);

    return _.map(types, (context) => {
        const obj = {};
        obj.name = context.name;

        const methods = _.filter(util.noArgMethods(context.prototype), (mth) => mth !== 'depth');
        obj.methods = _.map(methods, (method) => {
            const methodObj = {};
            methodObj.name = method;

            if (ruleToContextMap.has(method)) {
                methodObj.type = ruleToContextMap.get(method);
            } else if (symbols.has(method)) {
                methodObj.type = 'TerminalNode';
            } else {
                methodObj.type = 'any';
            }

            return methodObj;
        });

        return obj;
    });
}

exports.readParser = readParser;
exports.readLexer = readLexer;
exports.contextObjectAst = contextObjectAst;
exports.parserMethods = parserMethods;
exports.symbolSet = symbolSet;
exports.ruleToContextTypeMap = ruleToContextTypeMap;
exports.contextToRuleMap = contextToRuleMap;
exports.contextRules = contextRules;
exports.contextRuleNames = contextRuleNames;
exports.exportedContextTypes = exportedContextTypes;
