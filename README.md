# antlr4-tool

## Overview
The **antlr4-tool** generates both Typescript and JavaScript Antlr4 Parsers and Lexers.
The generated Antlr4 Parsers and Lexers have full **ES5+** browser support.

## Requirements
* Java Runtime Environment 1.6+ (1.8+ recommended)


## Getting Stated

1. Install antlr4-tool,  adding it to your package.json

```bash
npm install --save-dev antlr4-tool
```

2. Install Antlr4 

```bash
npm install -S antlr4
```
3. **(TypeScript Only)** Install the Antlr4 types

```bash
npm install -S @types/antlr4
```

4. Add a grammar to your project, e.g. path/to/Grammar.g4

```json
"scripts": {
  "generateParser": "antlr4-tool -o parser path/to/Grammar.g4"
}
```

5. Run the NPM script command
```bash
npm run generateParser
```

6. Use your generated Parser

**JavaScript**
```javascript

const antlr4 = require('antlr4')
const InputStream = antlr4.InputStream;
const CommonTokenStream = antlr4.CommonTokenStream;

const GrammarParser = require('./parser/GrammarParser').GrammarParser;
const GrammarLexer = require('./parser/GrammarLexer').GrammarLexer;

const inputStream = new InputStream('int x = 10;');
const lexer = new GrammarLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new GrammarParser(tokenStream);

// Parse the input, where `compilationUnit` is whatever entry point you defined
const tree = parser.compilationUnit();
console.log(tree);
```

**TypeScript**
```typescript
import {InputStream, CommonTokenStream} from 'antlr4';
import {GrammarParser} from './parser/GrammarParser';
import {GrammarLexer} from './parser/GrammarLexer';

const inputStream = new InputStream('enter you grammar here');
const lexer = new GrammarLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new GrammarParser(tokenStream);

// Parse the input, where `compilationUnit` is whatever entry point you defined
const tree = parser.compilationUnit();
console.log(tree);
```




## For Command-Line Use

### Installation For Command-Line Use
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

