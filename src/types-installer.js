const targz = require('targz');
const mkdir = require('mkdir-recursive').mkdirSync;

class TypesInstaller {
    constructor() {
        this.outputPath = `node_modules/@types/`;
        this.antlrTypesTgz = `${__dirname}/bin/antr4-types.tgz`;
    }

    install() {
        mkdir(this.outputPath);

        const src = this.antlrTypesTgz;
        const dest = this.outputPath;
        targz.decompress({
            src, dest, tar: {
                ignore: (name) => {
                    return name.includes('antlr4-tests.ts') || name.includes('.json');
                }
            }
        }, (err) => {
            if (err) {
                throw new Error(err);
            }
        });
    }
}

exports.TypesInstaller = TypesInstaller;
