import {
    AstNode,
    AstNodeType,
    CellRangeAstNode,
    CellReferenceAstNode,
    ConcatenateAstNode,
    DivOpAstNode,
    EmptyArgAstNode,
    EqualsOpAstNode,
    ErrorAstNode,
    MinusOpAstNode,
    MinusUnaryOpAstNode,
    NotEqualOpAstNode,
    NumberAstNode,
    ParenthesisAstNode,
    PlusOpAstNode,
    PlusUnaryOpAstNode,
    PowerOpAstNode,
    ProcedureAstNode,
    StringAstNode,
    TimesOpAstNode,
} from './type';

export const buildConcatenateOpAst = (
    lhs: AstNode,
    rhs: AstNode,
): ConcatenateAstNode => {
    return {
        type: AstNodeType.CONCATENATE_OP,
        left: lhs,
        right: rhs,
    };
};

export const buildDivOpAst = (lhs: AstNode, rhs: AstNode): DivOpAstNode => {
    return {
        type: AstNodeType.DIV_OP,
        left: lhs,
        right: rhs,
    };
};

export const buildEqualsOpAst = (
    lhs: AstNode,
    rhs: AstNode,
): EqualsOpAstNode => {
    return {
        type: AstNodeType.EQUALS_OP,
        left: lhs,
        right: rhs,
    };
};

export const buildNotEqualOpAst = (
    lhs: AstNode,
    rhs: AstNode,
): NotEqualOpAstNode => {
    return {
        type: AstNodeType.NOT_EQUAL_OP,
        left: lhs,
        right: rhs,
    };
};

export const buildPlusOpAst = (lhs: AstNode, rhs: AstNode): PlusOpAstNode => {
    return {
        type: AstNodeType.PLUS_OP,
        left: lhs,
        right: rhs,
    };
};

export const buildPlusUnaryOpAst = (value: AstNode): PlusUnaryOpAstNode => {
    return {
        type: AstNodeType.PLUS_UNARY_OP,
        value: value,
    };
};

export const buildMinusUnaryOpAst = (value: AstNode): MinusUnaryOpAstNode => {
    return {
        type: AstNodeType.MINUS_UNARY_OP,
        value: value,
    };
};

export const buildMinusOpAst = (lhs: AstNode, rhs: AstNode): MinusOpAstNode => {
    return {
        type: AstNodeType.MINUS_OP,
        left: lhs,
        right: rhs,
    };
};

export const buildTimesOpAst = (lhs: AstNode, rhs: AstNode): TimesOpAstNode => {
    return {
        type: AstNodeType.TIMES_OP,
        left: lhs,
        right: rhs,
    };
};

export const buildPowerOpAst = (lhs: AstNode, rhs: AstNode): PowerOpAstNode => {
    return {
        type: AstNodeType.POWER_OP,
        left: lhs,
        right: rhs,
    };
};

export const buildCellReferenceAst = (cell: string): CellReferenceAstNode => {
    return {
        type: AstNodeType.CELL_REFERENCE,
        cell,
    };
};

export const buildErrorAst = (message: string): ErrorAstNode => {
    return {
        type: AstNodeType.ERROR,
        value: message,
    };
};

export const buildCellRangeAst = (
    startCell: string,
    endCell: string,
): CellRangeAstNode => {
    return {
        type: AstNodeType.CELL_RANGE,
        startCell,
        endCell,
    };
};
export const buildNumberAst = (value: number): NumberAstNode => {
    return {
        type: AstNodeType.NUMBER,
        value,
    };
};

export const buildStringAst = (value: string): StringAstNode => {
    return {
        type: AstNodeType.STRING,
        value,
    };
};

export const buildParenthesisAst = (
    expression: AstNode,
): ParenthesisAstNode => {
    return {
        type: AstNodeType.PARENTHESIS,
        expression,
    };
};

export const buildEmptyArgAst = (): EmptyArgAstNode => {
    return {
        type: AstNodeType.EMPTY,
    };
};

export const buildProcedureAst = (
    procedureName: string,
    args: AstNode[],
): ProcedureAstNode => {
    return {
        type: AstNodeType.FUNCTION_CALL,
        procedureName,
        args,
    };
};