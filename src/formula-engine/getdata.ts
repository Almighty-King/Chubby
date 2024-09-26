import { ICellData } from "@/core/Sheet";
// 简单的解析文本到行和列
export const parseCellReference = (cell: string) => {
    const row = parseInt(cell.slice(1)) - 1;

    const col = cell.charCodeAt(0) - 'A'.charCodeAt(0);
    return { row, col };
};

export const getCellValue = (cell: string, data: ICellData[][]): any => {
    const { row, col } = parseCellReference(cell);
    if (row >= data.length || col >= data[0].length) {
        return 0;
    }
    return data[row][col].v;
};

export const getCellRangeValues = (startCell: string, endCell: string, data: ICellData[][]): any => {
    const { row: startRow, col: startCol } = parseCellReference(startCell);
    const { row: endRow, col: endCol } = parseCellReference(endCell);
    const result = [];
    if (startRow >= data.length || startCol >= data[0].length || endRow >= data.length || endCol >= data[0].length) {
        return [];
    }
    for (let i = startRow; i <= endRow; i++) {
        for (let j = startCol; j <= endCol; j++) {
            result.push(data[i][j].v);
        }
    }
    return result;
};