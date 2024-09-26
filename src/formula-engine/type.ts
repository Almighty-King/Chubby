export enum AstNodeType {
    EMPTY = 'EMPTY',

    NUMBER = 'NUMBER',
    STRING = 'STRING',

    MINUS_UNARY_OP = 'MINUS_UNARY_OP',
    PLUS_UNARY_OP = 'PLUS_UNARY_OP',

    PERCENT_OP = 'PERCENT_OP',

    CONCATENATE_OP = 'CONCATENATE_OP',

    EQUALS_OP = 'EQUALS_OP',
    NOT_EQUAL_OP = 'NOT_EQUAL_OP',
    GREATER_THAN_OP = 'GREATER_THAN_OP',
    LESS_THAN_OP = 'LESS_THAN_OP',
    GREATER_THAN_OR_EQUAL_OP = 'GREATER_THAN_OR_EQUAL_OP',
    LESS_THAN_OR_EQUAL_OP = 'LESS_THAN_OR_EQUAL_OP',

    PLUS_OP = 'PLUS_OP',
    MINUS_OP = 'MINUS_OP',
    TIMES_OP = 'TIMES_OP',
    DIV_OP = 'DIV_OP',
    POWER_OP = 'POWER_OP',

    FUNCTION_CALL = 'FUNCTION_CALL',
    NAMED_EXPRESSION = 'NAMED_EXPRESSION',

    PARENTHESIS = 'PARENTHESES',

    CELL_REFERENCE = 'CELL_REFERENCE',

    CELL_RANGE = 'CELL_RANGE',
    COLUMN_RANGE = 'COLUMN_RANGE',
    ROW_RANGE = 'ROW_RANGE',

    ERROR = 'ERROR',

    ERROR_WITH_RAW_INPUT = 'ERROR_WITH_RAW_INPUT',

    ARRAY = 'ARRAY'
}

export interface AstNode {

    type: string;
    value?: any;
}

export interface NumberLiteralAstNode {
    type: AstNodeType.NUMBER;
    value: number;
}

export interface StringLiteralAstNode {
    type: AstNodeType.STRING;
    value: string;
}

export interface ErrorAstNode {
    type: AstNodeType.ERROR;
    value: string;
}

export interface ConcatenateAstNode {
    type: AstNodeType.CONCATENATE_OP;
    left: AstNode;
    right: AstNode;
}

export interface DivOpAstNode {
    type: AstNodeType.DIV_OP;
    left: AstNode;
    right: AstNode;
}

export interface MinusOpAstNode {
    type: AstNodeType.MINUS_OP;
    left: AstNode;
    right: AstNode;
}

export interface MinusUnaryOpAstNode {
    type: AstNodeType.MINUS_UNARY_OP;
    value: AstNode;
}

export interface PlusUnaryOpAstNode {
    type: AstNodeType.PLUS_UNARY_OP;
    value: AstNode;
}

export interface EqualsOpAstNode {
    type: AstNodeType.EQUALS_OP;
    left: AstNode;
    right: AstNode;
}

export interface NotEqualOpAstNode {
    type: AstNodeType.NOT_EQUAL_OP;
    left: AstNode;
    right: AstNode;
}

export interface PlusOpAstNode {
    type: AstNodeType.PLUS_OP;
    left: AstNode;
    right: AstNode;
}

export interface MinusOpAstNode {
    type: AstNodeType.MINUS_OP;
    left: AstNode;
    right: AstNode;
}

export interface TimesOpAstNode {
    type: AstNodeType.TIMES_OP;
    left: AstNode;
    right: AstNode;
}

export interface PowerOpAstNode {
    type: AstNodeType.POWER_OP;
    left: AstNode;
    right: AstNode;
}

export interface PlusUnaryOpAstNode {
    type: AstNodeType.PLUS_UNARY_OP;
    value: AstNode;
}

export interface MinusUnaryOpAstNode {
    type: AstNodeType.MINUS_UNARY_OP;
    value: AstNode;
}

export interface CellReferenceAstNode {
    type: AstNodeType.CELL_REFERENCE;
    cell: string;
}

export interface CellRangeAstNode {
    type: AstNodeType.CELL_RANGE;
    startCell: string;
    endCell: string;
}

export interface FunctionCallAstNode {
    type: AstNodeType.FUNCTION_CALL;
    functionName: string;
    args: AstNode[];
}

export interface NumberAstNode {
    type: AstNodeType.NUMBER;
    value: number;
}
    
export interface StringAstNode {
    type: AstNodeType.STRING;
    value: string;
}

export interface ParenthesisAstNode {
    type: AstNodeType.PARENTHESIS;
    expression: AstNode;
}



export enum ErrorType {
    DivByZero = 'DIV_BY_ZERO',
    NotAvailable = 'NOT_AVAILABLE',
    Name = 'NAME',
    Null = 'NULL',
    Number = 'NUMBER',
    Ref = 'REF',
    Value = 'VALUE',
}

export interface EmptyArgAstNode {
    type: AstNodeType.EMPTY;
}

export interface ProcedureAstNode {
    type: AstNodeType.FUNCTION_CALL;
    procedureName: string;
    args: AstNode[];
}

export type BaseAstNode = 
    | NumberLiteralAstNode
    | StringLiteralAstNode
    | ErrorAstNode
    | ConcatenateAstNode
    | DivOpAstNode
    | MinusOpAstNode
    | PlusOpAstNode
    | TimesOpAstNode
    | PowerOpAstNode
    | CellRangeAstNode
    | FunctionCallAstNode
    | EqualsOpAstNode
    | NotEqualOpAstNode
    | NumberAstNode
    | StringAstNode
    | ParenthesisAstNode
    | EmptyArgAstNode
    | ProcedureAstNode;