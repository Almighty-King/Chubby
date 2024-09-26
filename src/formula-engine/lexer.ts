import { Lexer, createToken } from 'chevrotain';

export const WhiteSpace = createToken({
    name: 'WhiteSpace',
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

// 数组公式中的行分隔符 e.g.: =TRANSPOSE({1,2,3;4,5,6})
export const ArrayRowSeparator = createToken({
    name: 'ArrayRowSeparator',
    pattern: ';',
});

// 数组公式中的列分隔符 e.g.: =TRANSPOSE({1,2,3;4,5,6})
export const ArrayColumnSeparator = createToken({
    name: 'ArrayColumnSeparator',
    pattern: ',',
});

export const NumberLiteral = createToken({
    name: 'NumberLiteral',
    pattern: /(([.]\d+)|(\d+([.]\d*)?))(e[+-]?\d+)?/,
});

export const AdditionOp = createToken({
    name: 'AdditionOp',
    pattern: Lexer.NA,
});

export const PlusOp = createToken({
    name: 'PlusOp',
    pattern: /\+/,
    categories: AdditionOp,
});

export const MinusOp = createToken({
    name: 'MinusOp',
    pattern: /-/,
    categories: AdditionOp,
});

export const MultiplicationOp = createToken({
    name: 'MultiplicationOp',
    pattern: Lexer.NA,
});

export const TimesOp = createToken({
    name: 'TimesOp',
    pattern: /\*/,
    categories: MultiplicationOp,
});

export const DivOp = createToken({
    name: 'DivOp',
    pattern: /\//,
    categories: MultiplicationOp,
});

export const PowerOp = createToken({
    name: 'PowerOp',
    pattern: /\^/,
});

export const PercentOp = createToken({
    name: 'PercentOp',
    pattern: /%/,
});

export const BooleanOp = createToken({
    name: 'BooleanOp',
    pattern: Lexer.NA,
});

export const EqualsOp = createToken({
    name: 'EqualsOp',
    pattern: /=/,
    categories: BooleanOp,
});

export const NotEqualOp = createToken({
    name: 'NotEqualOp',
    pattern: /<>/,
    categories: BooleanOp,
});

export const GreaterThanOp = createToken({
    name: 'GreaterThanOp',
    pattern: />/,
    categories: BooleanOp,
});

export const LessThanOp = createToken({
    name: 'LessThanOp',
    pattern: /</,
    categories: BooleanOp,
});

export const GreaterThanOrEqualOp = createToken({
    name: 'GreaterThanOrEqualOp',
    pattern: />=/,
    categories: BooleanOp,
});

export const LessThanOrEqualOp = createToken({
    name: 'LessThanOrEqualOp',
    pattern: /<=/,
    categories: BooleanOp,
});

export const ConcatenateOp = createToken({
    name: 'ConcatenateOp',
    pattern: /&/,
});

export const LParen = createToken({
    name: 'LParen',
    pattern: /\(/,
});

export const RParen = createToken({
    name: 'RParen',
    pattern: /\)/,
});

export const ArrayLParen = createToken({
    name: 'ArrayLParen',
    pattern: /{/,
});

export const ArrayRParen = createToken({
    name: 'ArrayRParen',
    pattern: /}/,
});

export const StringLiteral = createToken({
    name: 'StringLiteral',
    pattern: /"([^"\\]*(\\.[^"\\]*)*)"/,
});

export const ErrorLiteral = createToken({
    name: 'ErrorLiteral',
    pattern: /#[A-Za-z0-9\/]+[?!]?/,
});

export const RangeSeparator = createToken({
    name: 'RangeSeparator',
    pattern: /:/,
});

// 匹配 Excel 单元格列区域引用，包括相对或绝对引用 e.g.: Sheet1!A:C, $A:$C
export const ColumnRange = createToken({
    name: 'ColumnRange',
    pattern:
        /(([A-Za-zÀ-ʯ0-9_]+|'(((?!').|'')*)')!)?\$?[A-Za-z]+:(([A-Za-zÀ-ʯ0-9_]+|'(((?!').|'')*)')!)?\$?[A-Za-z]+/,
});

// 匹配 Excel 单元格行引用，包括相对或绝对引用 e.g.: Sheet1!1:10, $1:$10
export const RowRange = createToken({
    name: 'RowRange',
    pattern:
        /(([A-Za-zÀ-ʯ0-9_]+|'(((?!').|'')*)')!)?\$?[0-9]+:(([A-Za-zÀ-ʯ0-9_]+|'(((?!').|'')*)')!)?\$?[0-9]+/,
});

// 匹配函数名称以及后边紧跟着的左括号 e.g.: SUM(,
export const ProcedureName = createToken({
    name: 'ProcedureName',
    pattern: /([A-Za-zÀ-ʯ][A-Za-zÀ-ʯ0-9_.]*)\(/,
});

// e.g.: A1, $A$1, B$3
export const CellReference = createToken({
    name: 'CellReference',
    pattern: /(\$?[A-Za-z]+)(\$?[0-9]+)/,
});

export const ArgSeparator = createToken({
    name: 'ArgSeparator',
    pattern: ",",
});

export const allTokens = [
    WhiteSpace,
    PlusOp,
    MinusOp,
    TimesOp,
    DivOp,
    PowerOp,
    EqualsOp,
    NotEqualOp,
    PercentOp,
    GreaterThanOrEqualOp,
    LessThanOrEqualOp,
    GreaterThanOp,
    LessThanOp,
    LParen,
    RParen,
    ArrayLParen,
    ArrayRParen,
    ProcedureName,
    RangeSeparator,
    ColumnRange,
    RowRange,
    NumberLiteral,
    StringLiteral,
    ErrorLiteral,
    ConcatenateOp,
    BooleanOp,
    AdditionOp,
    MultiplicationOp,
    CellReference,
    ArrayRowSeparator,
    ArrayColumnSeparator,  // 他和函数分隔符一样都是逗号
];
