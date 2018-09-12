interface MethodReturningTypes {
    [x: string]: string;
}

export const parserRuleContextTypes: MethodReturningTypes = {
    any: 'any',
    depth: 'number',
    getAltNumber: 'number',
    getChildCount: 'number',
    getPayload: 'RuleContext',
    getRuleContext: 'ParserRuleContext',
    getSourceInterval: 'Interval',
    getText: 'string',
    isEmpty: 'boolean',
    removeLastChild: 'void',
};

export const parserMethodsTypes: MethodReturningTypes = {
    any: 'any',
    reset: 'void',
    matchWildcard: 'Token',
    getParseListeners: 'ParseTreeListener[]',
    removeParseListeners: 'void',
    triggerEnterRuleEvent: 'void',
    triggerExitRuleEvent: 'void',
    getInputStream: 'InputStream',
    getCurrentToken: 'Token',
    consume: 'Token',
    addContextToParseTree: 'void',
    exitRule: 'void',
    getPrecedence: 'number',
    getExpectedTokens: 'Token[]',
    getExpectedTokensWithinCurrentRule: 'Token[]',
    getDFAStrings: 'string[]',
    dumpDFA: 'void',
    getSourceName: 'string',
    removeErrorListeners: 'void',
    getTokenTypeMap: '{[x: string]: string}',
    getRuleIndexMap: '{[x: string]: number}',
    getErrorListenerDispatch: 'ProxyErrorListener',
};
