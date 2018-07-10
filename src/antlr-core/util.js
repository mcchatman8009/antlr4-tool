const path = require('path');

function getNoArgMethods(obj) {
    var result = [];
    for (var id in obj) {
        try {
            if (typeof(obj[id]) == "function" && obj[id].length === 0) {
                result.push(id);
            }
        } catch (err) {
        }
    }
    return result;
}

function grammar(config) {
    const grammarFile = config.grammar;
    const grammar = path.basename(grammarFile, '.g4');

    return grammar;
}

function capitalizeFirstLetter(val) {
    return val.charAt(0).toUpperCase() + val.slice(1);
}

exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.grammar = grammar;
exports.noArgMethods = getNoArgMethods;
