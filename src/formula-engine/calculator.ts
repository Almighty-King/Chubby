import { ICellData } from "@/core/Sheet";
import { functionMap } from "./function";
import { getCellValue, getCellRangeValues } from "./getdata";

export const evaluate = (node: any, data: ICellData[][]): any => {
    switch (node.type) {
        case "NUMBER":
            return node.value;
        case "STRING":
            return node.value;
        case "CELL_REFERENCE":
            return getCellValue(node.cell, data);
        case "CELL_RANGE":
            return getCellRangeValues(node.startCell, node.endCell, data);
        case "FUNCTION_CALL":
            const args = node.args.map((arg: any) => evaluate(arg, data)); // 递归计算函数参数
            const fn = functionMap[node.procedureName];
            if (!fn) {
                throw new Error(`未定义函数: ${node.procedureName}`);
            }
            return fn(Array.isArray(args[0]) ? args[0] : args);
        case "CONCATENATE_OP":
            return String(evaluate(node.left, data)) + String(evaluate(node.right, data));
        case "MINUS_OP":
            return evaluate(node.left, data) - evaluate(node.right, data);
        default:
            throw new Error(`Type 非法 ${node.type}`);
    }
};