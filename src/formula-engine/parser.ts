import {
    EmbeddedActionsParser,
    IToken,
    tokenMatcher,
} from 'chevrotain';
import {
    AdditionOp,
    allTokens,
    ArrayColumnSeparator,
    BooleanOp,
    CellReference,
    ConcatenateOp,
    DivOp,
    EqualsOp,
    LParen,
    MinusOp,
    MultiplicationOp,
    NotEqualOp,
    NumberLiteral,
    PlusOp,
    PowerOp,
    ProcedureName,
    RangeSeparator,
    RParen,
    StringLiteral,
    TimesOp,
} from './lexer';
import {
    buildCellRangeAst,

    buildCellReferenceAst,
    buildConcatenateOpAst,
    buildDivOpAst,
    buildEqualsOpAst,
    buildErrorAst,
    buildMinusOpAst,
    buildMinusUnaryOpAst,
    buildNotEqualOpAst,
    buildNumberAst,
    buildParenthesisAst,
    buildPlusOpAst,
    buildPlusUnaryOpAst,
    buildPowerOpAst,
    buildTimesOpAst,
    buildStringAst,
    buildEmptyArgAst,
    buildProcedureAst,
} from './ast';
import { AstNode, AstNodeType } from './type';

type AstRule = (...args: any[]) => AstNode;

// doc: https://chevrotain.io/docs/tutorial/step3b_adding_actions_embedded.html#introduction
export class FormulaParser extends EmbeddedActionsParser {
    /**
    优先级从高到低可以分为以下几种：
    1.函数调用：e.g.: SUM(), IF()
    2.范围运算符：e.g.: :(区域)、 ,(连接符)
    3.数学运算：e.g.: *、/、^、+、-
    4.比较运算：e.g.: >、<、=、<=、>=、<>。
    5.文本运算：&（字符串连接）。
    */
    /**
     * 解析公式入口
     *
     * @returns
     */
    public formula: AstRule = this.RULE('formula', () => {
        const equalsOp = this.CONSUME(EqualsOp);
        return this.SUBRULE(this.concatenateExpression);
    });

    /**
     * 处理字符串拼接符 &  e.g.: =A1 & ""
     * @returns
     */
    private concatenateExpression: AstRule = this.RULE(
        'concatenateExpression',
        () => {
            let lhs: AstNode = this.SUBRULE(this.booleanExpression);
            this.MANY(() => {
                this.CONSUME(ConcatenateOp) as IToken;
                const rhs = this.SUBRULE2(this.booleanExpression);
                lhs = buildConcatenateOpAst(lhs, rhs);
            });

            return lhs;
        },
    );
    private booleanExpression: AstRule = this.RULE('booleanExpression', () => {
        let lhs: AstNode = this.SUBRULE(this.additionExpression);

        this.MANY(() => {
            const op = this.CONSUME(BooleanOp) as IToken;
            const rhs = this.SUBRULE2(this.additionExpression);
            if (tokenMatcher(op, EqualsOp)) {
                lhs = buildEqualsOpAst(lhs, rhs);
            } else if (tokenMatcher(op, NotEqualOp)) {
                lhs = buildNotEqualOpAst(lhs, rhs);
            } else {
                this.ACTION(() => {
                    throw Error('Operator not supported');
                });
            }
        });
        return lhs;
    });

    private additionExpression = this.RULE('additionExpression', () => {
        let lhs: AstNode = this.SUBRULE(this.multiplicationExpression);

        this.MANY(() => {
            const op = this.CONSUME(AdditionOp) as IToken;
            const rhs = this.SUBRULE2(this.multiplicationExpression);

            if (tokenMatcher(op, PlusOp)) {
                lhs = buildPlusOpAst(lhs, rhs);
            } else if (tokenMatcher(op, MinusOp)) {
                lhs = buildMinusOpAst(lhs, rhs);
            } else {
                this.ACTION(() => {
                    throw Error('Operator not supported');
                });
            }
        });

        return lhs;
    });

    private multiplicationExpression: AstRule = this.RULE(
        'multiplicationExpression',
        () => {
            let lhs: AstNode = this.SUBRULE(this.powerExpression);

            this.MANY(() => {
                const op = this.CONSUME(MultiplicationOp) as IToken;
                const rhs = this.SUBRULE2(this.powerExpression);

                if (tokenMatcher(op, TimesOp)) {
                    lhs = buildTimesOpAst(lhs, rhs);
                } else if (tokenMatcher(op, DivOp)) {
                    lhs = buildDivOpAst(lhs, rhs);
                } else {
                    this.ACTION(() => {
                        throw Error('Operator not supported');
                    });
                }
            });

            return lhs;
        },
    );

    private powerExpression: AstRule = this.RULE('powerExpression', () => {
        let lhs: AstNode = this.SUBRULE(this.atomicExpression);

        this.MANY(() => {
            const op = this.CONSUME(PowerOp) as IToken;
            const rhs = this.SUBRULE2(this.atomicExpression);

            if (tokenMatcher(op, PowerOp)) {
                lhs = buildPowerOpAst(lhs, rhs);
            } else {
                this.ACTION(() => {
                    throw Error('Operator not supported');
                });
            }
        });

        return lhs;
    });

    private atomicExpression: AstRule = this.RULE('atomicExpression', () => {
        return this.OR([
            {
                ALT: () => {
                    const op = this.CONSUME(AdditionOp) as IToken;
                    const value = this.SUBRULE(this.atomicExpression);
                    if (tokenMatcher(op, PlusOp)) {
                        return buildPlusUnaryOpAst(value);
                    } else if (tokenMatcher(op, MinusOp)) {
                        return buildMinusUnaryOpAst(value);
                    } else {
                        return buildErrorAst('Operator not supported');
                    }
                },
            },
            // 添加其他可能的原子表达式，例如数字、变量等
            {
                ALT: () => this.SUBRULE(this.positiveAtomicExpression),
            },
        ]);
    });

    private positiveAtomicExpression: AstRule = this.RULE(
        'positiveAtomicExpression',
        () => {
            return this.OR([
                {
                    // 将 cellRangeExpression 移到 cellReference 之前
                    ALT: () => this.SUBRULE(this.cellRangeExpression),
                },
                {
                    ALT: () => this.SUBRULE(this.cellReference),
                },
                {
                    ALT: () => this.SUBRULE(this.procedureExpression),
                },
                {
                    ALT: () => {
                        const number = this.CONSUME(NumberLiteral) as IToken;
                        return buildNumberAst(parseFloat(number.image));
                    },
                },
                {
                    ALT: () => {
                        const str = this.CONSUME(StringLiteral) as IToken;
                        return buildStringAst(str.image.slice(1, -1));
                    },
                },
                {
                    ALT: () => this.SUBRULE(this.parenthesisExpression),
                },
            ]);
        },
    );

    private cellReference: AstRule = this.RULE('cellReference', () => {
        const cell = this.CONSUME(CellReference) as IToken;
        return buildCellReferenceAst(cell.image);
    });

    private cellRangeExpression: AstRule = this.RULE(
        'cellRangeExpression',
        () => {
            const startCell = this.CONSUME(CellReference) as IToken;
            this.CONSUME(RangeSeparator);
            const endCell = this.CONSUME2(CellReference) as IToken;
            return buildCellRangeAst(startCell.image, endCell.image);
        },
    );

    private booleanExpressionOrEmpty: AstRule = this.RULE(
        'booleanExpressionOrEmpty',
        () => {
            return this.OR([
                { ALT: () => this.SUBRULE(this.booleanExpression) },
                { ALT: () => buildEmptyArgAst() },
            ]);
        },
    );

    private procedureExpression: AstRule = this.RULE(
        'procedureExpression',
        () => {
            const procedureNameToken = this.CONSUME(ProcedureName) as IToken;
            const procedureName = procedureNameToken.image
                .toUpperCase()
                .slice(0, -1);
            const canonicalProcedureName = procedureName;
            const args: AstNode[] = [];

            let argument = this.SUBRULE(this.booleanExpressionOrEmpty);
            this.MANY(() => {
                this.CONSUME(ArrayColumnSeparator); // 消费函数参数分隔符 ,
                args.push(argument);
                argument = this.SUBRULE2(this.booleanExpressionOrEmpty);
            });
            args.push(argument);
            if (args.length === 1 && args[0].type === AstNodeType.EMPTY) {
                args.length = 0;
            }

            this.CONSUME(RParen) as IToken;
            return buildProcedureAst(canonicalProcedureName, args);
        },
    );

    private parenthesisExpression: AstRule = this.RULE(
        'parenthesisExpression',
        () => {
            this.CONSUME(LParen) as IToken;
            const expression = this.SUBRULE(this.booleanExpression);
            this.CONSUME(RParen) as IToken;
            return buildParenthesisAst(expression);
        },
    );

    constructor() {
        super(allTokens);
        this.performSelfAnalysis();
    }
}
