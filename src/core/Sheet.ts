import { Container, Graphics } from '@/canvas-engine';
import { Cell, CellType } from './Cell/Cell';
import { NormalCell } from './Cell/NormalCell';
import ShowInput from '@/utils/showInput';
import { ROW_BLANK_WIDTH, ROW_NUM_WIDTH } from '@/utils/const';
import { RowHeadCell } from './Cell/RowHeadCell';
import { Point } from '@/canvas-engine/math/Point';
import { ViewPort } from '@/canvas-engine/viewport/ViewPort';
import { AstNode } from '@/formula-engine/type';
import { SheetData } from '@/data';
export interface IRange {
    start: {
        row: number;
        col: number;
        x: number;
        y: number;
    };
    end: {
        row: number;
        col: number;
        x: number;
        y: number;
    };
}

export interface ICellData {
    row: number;
    col: number;
    v: string | number;
    formula: string;
    m?: string;
    ast?: AstNode;
    dirty?: boolean;
}


export interface ISheet {
    name: string;
    selectRangeList: IRange[];
    data: SheetData;
}

export class Sheet extends Container implements ISheet {
    private mainBody: Graphics;
    public selectRangeList: IRange[];
    public data: SheetData;
    public viewPort: ViewPort;
    private rows: Cell[][] = [];
    constructor(sheetData: SheetData, viewPort: ViewPort) {
        super();
        this.name = 'SheetContainer';
        this.mainBody = this.createMainBody();
        this.data = sheetData;
        this.selectRangeList = new Proxy([], {
            set: (target: IRange[], prop: string | symbol, value: IRange) => {
                this.reRenderSelectRange();
                target[prop as any] = value;
                return true;
            },
        });
        this.viewPort = viewPort;
        this.createCell();
        this.renderBorder();
        this.viewPort.registerRenderEvent(() => {
            this.clear();
            this.createCell();
            this.renderBorder();
            this.viewPort.render();
        });
        this.viewPort.render();
    }

    private createMainBody: () => Graphics = () => {
        this.mainBody = new Graphics();
        this.addChild(this.mainBody);
        return this.mainBody;
    };

    private createCell() {
        const { startRow, startCol, endRow, endCol } = this.viewPort.visibleArea;
        for (let row = startRow; row <= endRow; row++) {
            const rowContainer = new Container(`RowContainer${row}`);
            rowContainer.y = Math.floor((row - startRow) * this.viewPort.rowHeight);
            rowContainer.x = Math.floor(ROW_BLANK_WIDTH);

            const rowData  = this.data.data[row];
            const rowHeadCell = new RowHeadCell({
                cellType: CellType.Text,
                row,
                col: 0,
                v: `${row + 1}`,
                formula: '',
                styleId: '',
                style: {},
                width: ROW_NUM_WIDTH,
                height: this.viewPort.rowHeight
            });
            const rowCellArr = [rowHeadCell];
            rowContainer.addChild(rowHeadCell);
            this.mainBody.addChild(rowContainer);
            for (let col = startCol; col <= endCol; col++) {
                const cellData = rowData[col];
                const cell = new NormalCell({
                    cellType: CellType.Text,
                    row,
                    col,
                    v: cellData.v,
                    formula: cellData.formula,
                    styleId: '',
                    style: {},
                    width: this.viewPort.colWidth,
                    height: this.viewPort.rowHeight,
                    bgColor: 'white',
                    // 移除单独的边框设置
                });
                cell.name = `${row} + ${col}`;
                cell.x = Math.floor(col * this.viewPort.colWidth) + ROW_NUM_WIDTH;
                cell.y = Math.floor(0);
                rowContainer.addChild(cell);
                cell.onClick = this.onCellClick.bind(this, cell);
                cell.onDoubleClick = this.onCellDoubleClick.bind(this, cell);
                rowCellArr.push(cell);
            }
            this.rows.push(rowCellArr);
        }
    }

    //TODO: 在mainBody中事件委托
    // 单击单元格，选中单元格
    private onCellClick(cell: Cell) {
        this.selectRangeList.length = 0;
        const point = cell.parent!.worldTransform.apply(new Point(cell.x, cell.y));
        this.selectRangeList.push({
            start: {
                row: cell.row,
                col: cell.col,
                x: point.x - this.x,
                y: point.y - this.y,
            },
            end: {
                row: cell.row,
                col: cell.col,
                x: point.x + this.viewPort.colWidth - this.x,
                y: point.y + this.viewPort.rowHeight - this.y,
            },
        });
        this.viewPort.render();
    }

    //TODO: 在mainBody中事件委托 通过 位置确定哪个cell被双击
    // 双击单元格，弹出输入框
    private onCellDoubleClick(cell: Cell) {
        const point = cell.parent!.worldTransform.apply(new Point(cell.x, cell.y));
        const dpr = window.devicePixelRatio || 1;
        const showInput = ShowInput.getInstance();
        showInput.show(
            cell.formula ? cell.formula : cell.v,
            'gridView',
            {
                x: (point.x - this.x) / dpr,
                y: point.y / dpr,
                width: this.viewPort.colWidth / dpr,
                height: this.viewPort.rowHeight,
            },
            (value) => this.handleInputClose(cell.row, cell.col, value),
        );
        this.viewPort.render();
    }

    private handleInputClose(row: number, col: number, value: string | number) {
        if (typeof value === 'string' && value.startsWith('=')) {
            this.data.setCellFormula(row, col, value);
        } else {
            this.data.setCellValue(row, col, value);
        }
    }

    private reRenderSelectRange() {
        this.mainBody.removeChildByName(`selectMask`);
        const continer = new Container();
        continer.name = `selectMask`;
        this.selectRangeList.forEach((range) => {
            const start = range.start;
            const end = range.end;
            const startX = start.x;
            const startY = start.y;
            const endX = end.x;
            const endY = end.y;
            const mask = new Graphics();
            mask.lineStyle(1, '#dd5352', 1);
            mask.drawRect(startX, startY, endX - startX, endY - startY);
            continer.addChild(mask);
        });
        this.mainBody.addChild(continer);
    }

    private renderBorder() {
        const borderGraphics = new Graphics();
        borderGraphics.lineStyle(1, '#C2C2C2', 1); // 设置全局边框样式
        borderGraphics.x = Math.floor(ROW_BLANK_WIDTH - 1);
        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            row.forEach((cell, index) => {
                if (index === 0) {
                    borderGraphics.moveTo(cell.x + 0.5, cell.y + 0.5 + i * cell.height);
                    borderGraphics.lineTo(cell.x + 0.5 + cell.width, cell.y + 0.5 + i * cell.height);
                    borderGraphics.moveTo(cell.x + 0.5, cell.y + 0.5 + (i + 1) * cell.height);
                    borderGraphics.lineTo(cell.x + 0.5 + cell.width, cell.y + (i + 1) * cell.height);
                    if (i === this.rows.length - 1) {
                        borderGraphics.moveTo(cell.x + 0.5, cell.y + 0.5 + (i + 1) * cell.height);
                    }
                } else {
                    borderGraphics.drawRect(
                        cell.x + 0.5,
                        cell.y + 0.5 + i * cell.height,
                        cell.width,
                        cell.height
                    );
                }

            });
        }
        this.mainBody.addChild(borderGraphics);
    }

    private clear() {
        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            row.forEach((cell) => {
                cell.removeAllListeners();
                cell.clear();
            });
        }
        this.rows.length = 0;
        this.mainBody.removeAllChildren();
    }
}
