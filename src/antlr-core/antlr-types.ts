interface ParserMethodReturningTypes {
    [x: string]: string;
}

export const parserRuleContextTypes: ParserMethodReturningTypes = {
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
