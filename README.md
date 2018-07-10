# antlr4-tool

## Overview
The **Antlr4** Tool generates both Typescript Declarations and JavaScript Antlr4 Parsers/Lexers

## Requirements
* Java Runtime Environment 1.6+ (1.8+ recommended)


## Installation For Command-Line Use
```bash
npm install -g antlr4-tool
```

```
  Usage: antlr4-tool [options] <grammars...>

  Options:

    -o --output-dir [output_dir]  Output Directory
    -l --language [language]      Language (Default: TypeScript)
    -h, --help                    output usage information
```


### Example Creating a C Parser for TypeScript & JavaScript
```bash
antlr4-tool -o c-parser samples/c/C.g4
```

![Example](./docs/c-parser.png)


## Installation For Development
```bash
npm install antlr4-tool
```

## Using antlr4-tool As A Library
```javascript
const tool = require('antlr4-tool');

const opts = {
   language: 'Typescript' ,
   grammarFiles:  ['samples/c/C.g4'],
   outputDirectory: 'c-parser'
};

const compiledResults = tool.compile(opts);

console.log(compiledResults);
```

