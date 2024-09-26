import { FederatedMouseEvent } from '../../canvas-engine/events/FederatedMouseEvent';
import { Graphics } from '@/canvas-engine';

export enum CellType {
    Text = 'text',
    Number = 'number',
    Boolean = 'boolean',
    Date = 'date',
    Time = 'time',
    DateTime = 'datetime',
    Formula = 'formula',
}

export interface CellStyle {
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    border: string;
    textAlign: string;
    verticalAlign: string;
    textWrap: boolean;
    textOverflow: string;
    textIndent: number;
}

export interface ICellProps {
    cellType: CellType;
    v: any;
    row: number;
    col: number;
    formula?: string;
    styleId?: string;
    style?: Partial<CellStyle>;
    bgColor?: string;
    width: number;
    height: number;
    border?: IBorder;
    onClick?: (event: FederatedMouseEvent) => void;
    onDoubleClick?: () => void;
}

export type BorderProps = {
    width: number;
    color: string;
}
export interface IBorder {
    l?: BorderProps;
    r?: BorderProps;
    t?: BorderProps;
    b?: BorderProps;
}

export abstract class Cell extends Graphics implements ICellProps {
    public cellType: CellType;
    public v: any;
    public row: number;
    public col: number;
    public formula?: string;
    public styleId?: string;
    public style?: Partial<CellStyle>;
    public width: number;
    public height: number;
    public bgColor?: string;
    public border?: IBorder = {};
    public onClick?: (event: FederatedMouseEvent) => void;
    public onDoubleClick?: () => void;

    private clickTimeout: NodeJS.Timeout | null = null;
    private clickCount: number = 0;

    constructor(props: ICellProps) {
        super();
        this.cellType = props.cellType;
        this.row = props.row;
        this.col = props.col;
        this.v = props.v;
        this.formula = props.formula;
        this.styleId = props.styleId;
        this.style = props.style;
        this.width = props.width;
        this.height = props.height;
        this.bgColor = props.bgColor;
        this.border = props.border || {};
        this.onClick = props.onClick;
        this.onDoubleClick = props.onDoubleClick;
        this.addEventListener('click', this.handleClick);
        this.renderCell();
        this.drawBorder();
    }

    private handleClick = (event: FederatedMouseEvent) => {
        // 立即执行单击事件
        this.handleSingleClick(event);

        // 检查是否为双击
        if (this.clickCount === 0) {
            this.clickCount = 1;
            this.clickTimeout = setTimeout(() => {
                this.clickCount = 0;
            }, 150);
        } else {
            clearTimeout(this.clickTimeout!);
            this.handleDoubleClick();
            this.clickCount = 0;
        }
        event.stopPropagation();
    }

    private handleSingleClick = (event: FederatedMouseEvent) => {
        if (this.onClick) {
            this.onClick(event);
        }
    }

    private handleDoubleClick = () => {
        if (this.onDoubleClick) {
            this.onDoubleClick();
        }
    }

    get m(): string {
        return String(this.v);
    }

    public drawBorder() {
        if (Object.keys(this.border || {}).length === 0) {
            this.moveTo(this.x + 0.5, this.y + 0.5);
            this.lineTo(this.x + 0.5 + this.width, this.y + 0.5);
            this.lineTo(this.x + 0.5 + this.width, this.y + 0.5 + this.height);
            this.lineTo(this.x + 0.5, this.y + 0.5 + this.height);
            this.lineTo(this.x + 0.5, this.y + 0.5);
        } else {
            if (this.border?.l) {
                this.moveTo(this.x + 0.5, this.y + 0.5);
                this.lineTo(this.x + 0.5, this.y + 0.5 + this.height);
            }
            if (this.border?.r) {
                this.moveTo(this.x + 0.5 + this.width, this.y + 0.5);
                this.lineTo(this.x + 0.5 + this.width, this.y + 0.5 + this.height);
            }
            if (this.border?.t) {
                this.moveTo(this.x + 0.5, this.y + 0.5);
                this.lineTo(this.x + 0.5 + this.width, this.y + 0.5);
            }
            if (this.border?.b) {
                this.moveTo(this.x + 0.5, this.y + 0.5 + this.height);
                this.lineTo(this.x + 0.5 + this.width, this.y + 0.5 + this.height);
            }
        }

    }
    

    abstract renderCell(): void;
}