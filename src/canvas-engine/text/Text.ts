import { Container } from "../base";
import { CanvasRender } from "../render/CanvasRender";

export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    fontStyle: string;
    fontWeight: string;
    fill: string | null;
    align: 'left' | 'center' | 'right';
    stroke: string | null;
    strokeThickness: number;
    letterSpacing: number;
    lineHeight: number;
    wordWrap: boolean;
    wordWrapWidth: number;
    verticalAlign: 'top' | 'middle' | 'bottom';
}

export class Text extends Container {
    private _text: string;
    private _x: number;
    private _y: number;
    private _style: TextStyle;
    private _width: number;
    private _height: number;

    constructor(
        text: string,
        x: number,
        y: number,
        style: Partial<TextStyle> = {},
    ) {
        super()
        this._text = text;
        this._x = x;
        this._y = y;
        this._style = {
            fontFamily: 'Arial',
            fontSize: 16,
            fontStyle: 'normal',
            fontWeight: 'normal',
            fill: 'black',
            align: 'left',
            stroke: null,
            strokeThickness: 0,
            letterSpacing: 0,
            lineHeight: 0,
            wordWrap: false,
            wordWrapWidth: 100,
            verticalAlign: 'top',
            ...style,
        };
        this._width = 0;
        this._height = 0;
        this.updateMetrics();
    }

    protected renderCanvas(render: CanvasRender): void {
        const ctx = render.ctx;
        ctx.save();

        // 设置字体
        ctx.font = `${this._style.fontStyle} ${this._style.fontWeight} ${this._style.fontSize}px ${this._style.fontFamily}`;

        // 设置文本对齐
        ctx.textAlign = this._style.align as CanvasTextAlign;
        
        // 根据 verticalAlign 设置 textBaseline
        switch (this._style.verticalAlign) {
            case 'top':
                ctx.textBaseline = 'top';
                break;
            case 'middle':
                ctx.textBaseline = 'middle';
                break;
            case 'bottom':
                ctx.textBaseline = 'bottom';
                break;
        }

        // 计算起始 y 坐标
        let y = this._y;
        if (this._style.verticalAlign === 'middle') {
            y += this._height / 2 - this._style.fontSize / 2 + 1;
        } else if (this._style.verticalAlign === 'bottom') {
            y += this._height - this._style.fontSize;
        }

        // 应用字间距
        let x = this._x;
        const lines = this.getLines();
        const lineHeight = this._style.fontSize + (this._style.lineHeight || 0);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let lineY = y;

            if (this._style.verticalAlign === 'middle') {
                lineY += (i - (lines.length - 1) / 2) * lineHeight;
            } else if (this._style.verticalAlign === 'top') {
                lineY += i * lineHeight;
            } else if (this._style.verticalAlign === 'bottom') {
                lineY -= (lines.length - 1 - i) * lineHeight;
            }

            // 填充文本
            if (this._style.fill) {
                ctx.fillStyle = this._style.fill;
                ctx.fillText(line, x, lineY);
            }

            // 描边文本
            if (this._style.stroke && this._style.strokeThickness) {
                ctx.strokeStyle = this._style.stroke;
                ctx.lineWidth = this._style.strokeThickness;
                ctx.strokeText(line, x, lineY);
            }

            x += this._style.letterSpacing * line.length;
        }

        ctx.restore();
    }

    private getLines(): string[] {
        if (!this._style.wordWrap) {
            return [this._text];
        }

        const words = this._text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = this.getTextWidth(currentLine + ' ' + word);

            if (width < this._style.wordWrapWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        lines.push(currentLine);
        return lines;
    }

    private getTextWidth(text: string): number {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            context.font = `${this._style.fontStyle} ${this._style.fontWeight} ${this._style.fontSize}px ${this._style.fontFamily}`;
            return context.measureText(text).width;
        }
        return 0;
    }

    private updateMetrics(): void {
        const lines = this.getLines();
        this._width = Math.max(...lines.map((line) => this.getTextWidth(line)));
        this._height =
            lines.length *
            (this._style.fontSize + (this._style.lineHeight || 0));
    }

    get text(): string {
        return this._text;
    }
    set text(value: string) {
        this._text = value;
        this.updateMetrics();
    }

    get x(): number {
        return this._x;
    }
    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }
    set y(value: number) {
        this._y = value;
    }

    get style(): TextStyle {
        return this._style;
    }
    set style(value: Partial<TextStyle>) {
        this._style = { ...this._style, ...value };
        this.updateMetrics();
    }

    get width(): number {
        return this._width;
    }
    get height(): number {
        return this._height;
    }
}
