import { COL_WIDTH, ROW_HEIGHT, SCROLL_STEP } from "@/utils/const";
import { Container } from "../base";
import { FederatedMouseEvent } from "../events/FederatedMouseEvent";
import { throttle } from "@/utils";
import { Application } from "../Application";

export interface ViewPortProps {
    x: number;
    y: number;
    width: number;
    height: number;
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
    frozenRows: number;
    frozenCols: number;
    allowScrollX?: boolean;
    allowScrollY?: boolean;
}

export class ViewPort {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public app: Application;
    private _scrollX: number;
    private _scrollY: number;
    private _startRow: number;
    private _startCol: number;
    private _endRow: number;
    private _endCol: number;
    private _visibleRows: number[];
    private _visibleCols: number[];
    private _frozenRows: number;
    private _frozenCols: number;
    private _rowHeight: number;
    private _colWidth: number;
    private _allowScrollX: boolean;
    private _allowScrollY: boolean;
    private _renderCallback: Function [];

    constructor(props: ViewPortProps, app: Application) {
        this.x = props.x;
        this.y = props.y;
        this.width = props.width;
        this.height = props.height;
        this._scrollX = 0;
        this._scrollY = 0;
        this._startRow = props.startRow;
        this._startCol = props.startCol;
        this._endRow = props.endRow;
        this._endCol = props.endCol;
        this._rowHeight = ROW_HEIGHT;
        this._colWidth = COL_WIDTH;
        this._renderCallback = [];
        this._allowScrollX = props.allowScrollX ?? true;
        this._allowScrollY = props.allowScrollY ?? true;
        this._visibleRows = new Array(this._endRow - this._startRow).fill(this._rowHeight).reduce((acc, curr, index) => {
            acc[index] = (acc[index - 1] || 0) + curr;
            return acc;
        }, []);
        this._visibleCols = new Array(this._endCol - this._startCol).fill(this._colWidth).reduce((acc, curr, index) => {
            acc[index] = (acc[index - 1] || 0) + curr;
            return acc;
        }, []);
        this._frozenRows = props.frozenRows;
        this._frozenCols = props.frozenCols;
        this.app = app;
        this.app.stage.addEventListener('wheel', throttle(this.onWheel, 50));
    }

    private onWheel = (e: FederatedMouseEvent) => {
        if (this._allowScrollX) {
            const scrollX = SCROLL_STEP * this.colWidth;
            if (e.deltaX > 0) {
                this._scrollX = Math.min(Math.max(this._scrollX + scrollX, 0), this._visibleCols[this._visibleCols.length - 1]);
            } else {
                this._scrollX = Math.min(Math.max(this._scrollX - scrollX, 0), this._visibleCols[this._visibleCols.length - 1]);
            }
        }
        if (this._allowScrollY) {
            const scrollY = SCROLL_STEP * this.rowHeight;
            if (e.deltaY > 0) { 
                this._scrollY = Math.min(Math.max(this._scrollY + scrollY, 0), this._visibleRows[this._visibleRows.length - 1] - (Math.round(this.height / this.rowHeight) * this.rowHeight));
            } else {
                this._scrollY = Math.min(Math.max(this._scrollY - scrollY, 0), this._visibleRows[this._visibleRows.length - 1] - (Math.round(this.height / this.rowHeight) * this.rowHeight));
            }
        }
        this.updateRender();
    }

    public updateRender() {
        this._renderCallback.forEach(fn => fn());
    }

    get scrollX(): number {
        return this._scrollX;
    }

    get scrollY(): number {
        return this._scrollY;
    }

    public clip() {
        const ctx = this.app.renderer?.ctx;
        if (ctx) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.clip();
        }
    }

    public unclip() {
        const ctx = this.app?.renderer?.ctx;
        if (ctx) {
            ctx.restore();
        }
    }

    get rowHeight(): number {
        return this._rowHeight;
    }

    get colWidth(): number {
        return this._colWidth;
    }

    get visibleRows(): number[] {
        return this._visibleRows;
    }

    get visibleCols(): number[] {
        return this._visibleCols;
    }

    set rowHeight(value: number) {
        this._rowHeight = value;
        this._visibleRows = new Array(this._endRow - this._startRow + 1).fill(this._rowHeight).reduce((pre, next) => pre + next, 0);
    }

    set colWidth(value: number) {
        this._colWidth = value;
        this._visibleCols = new Array(this._endCol - this._startCol + 1).fill(this._colWidth).reduce((pre, next) => pre + next, 0);
    }

    // 获取可见区域信息的方法
    get visibleArea() {
        const startRow = this._visibleRows.findIndex(row => row >= this._scrollY);
        const startCol = this._visibleCols.findIndex(col => col >= this._scrollX);
        const endRow = this._visibleRows.findIndex(row => row >= this._scrollY + this.height + 1);
        const endCol = this._visibleCols.findIndex(col => col >= this._scrollX + this.width + 1);
        return {
            startRow: startRow === -1 ? 0 : startRow,
            startCol: startCol === -1 ? 0 : startCol,
            endRow: endRow === -1 ? this._visibleRows.length - 1 : endRow,
            endCol: endCol === -1 ? this._visibleCols.length - 1 : endCol
        };
    }

    public registerRenderEvent(fn: Function) {
        this._renderCallback.push(fn);
    }

    public unregisterRenderEvent(fn: Function) {
        this._renderCallback = this._renderCallback.filter(item => item !== fn);
    }

    public render() {
        this.app.render();
    }
}