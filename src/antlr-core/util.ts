import * as path from 'path';
import * as _ from 'lodash';

export function getNoArgMethods(obj: any): any[] {
    const result: any[] = [];

    _.each(obj, (val, id) => {
        try {
            if (typeof(obj[id]) === 'function' && obj[id].length === 0) {
                result.push(id);
            }
        } catch (err) {
        }
    });

    return result;
}

export function grammar(config: any): string {
    const grammarFile = config.grammar;
    return path.basename(grammarFile, '.g4');
}

export function capitalizeFirstLetter(val: string): string {
    return val.charAt(0).toUpperCase() + val.slice(1);
}
