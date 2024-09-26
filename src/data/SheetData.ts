import { ICellData } from "@/core/Sheet";
import EventEmitter from "eventemitter3";

class SheetData extends EventEmitter {
    public data: ICellData[][];
    constructor(data: ICellData[][]) {
        super();
        this.data = data;
    }

    public getCellData(row: number, col: number): ICellData {
        return this.data[row][col];
    }

    public setCellValue(row: number, col: number, value: string | number, emit?: boolean = true) {
        this.data[row][col].v = value;
        this.data[row][col].dirty = false;
        this.data[row][col].m = value.toString();
        if (emit) {
            this.emit('setCellValue', { row, col, value });
        }

    }
    public setCellFormula(row: number, col: number, formula: string) {
        if (formula !== this.data[row][col].formula) {
            this.data[row][col].formula = formula;
            this.data[row][col].dirty = true;
            this.emit('setCellFormula', { row, col, value: formula });
        }
    }

    public getCellValue(row: number, col: number): string | number {
        return this.data[row][col].v;
    }

    public getCellFormula(row: number, col: number): string {
        return this.data[row][col].formula;
    }

    public isDirty(row: number, col: number): boolean {
        return this.data[row][col].dirty ?? false;
    }

    public setDirty(row: number, col: number, dirty: boolean) {
        this.data[row][col].dirty = dirty;
    }

    public addListener(event: string | symbol, listener: (...args: any[]) => void): this {
        this.on(event, listener);
        return this;
    }

    public removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
        this.off(event, listener);
        return this;
    }
}

export { SheetData };
