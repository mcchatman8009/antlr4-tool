import * as path from 'path';

export function getFields(obj: any): any[] {
    const result: any[] = [];
    for (const id of Object.keys(obj)) {
        try {
            if (obj[id] === null) {
                result.push(id);
            }
        } catch (err) {
        }
    }

    return result;
}

export function getMethods(obj: any): any[] {
    const result: any[] = [];
    for (const id of Object.keys(obj)) {
        try {
            if (typeof(obj[id]) === 'function' && obj[id].length === 0) {
                const mth = {name: id, args: ''};
                result.push(mth);
            }
        } catch (err) {
        }
    }

    return result;
}

export function grammar(config: any): string {
    const grammarFile = config.grammar;
    return path.basename(grammarFile, '.g4');
}

export function capitalizeFirstLetter(val: string): string {
    return val.charAt(0).toUpperCase() + val.slice(1);
}
