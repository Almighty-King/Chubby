import { ShapeType } from "@/canvas-engine/enum";
import { Point } from "../Point";
import { Shape } from "./Shape";
import { FillStyle } from "@/canvas-engine/graphics/style/FillStyle";
import { LineStyle } from "@/canvas-engine/graphics/style/LineStyle";

export class Rectangle extends Shape {
    public type: ShapeType;
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x = 0, y=0, width=0, height=0) {
        super();
        this.type = ShapeType.Rectangle;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public contain(point: Point): boolean {
        if (point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height) {
            return true;
        }
        return false;
    }

    public draw(ctx: CanvasRenderingContext2D, fillStyle: FillStyle, lineStyle: LineStyle): void {
        const { x, y, width, height } = this;
        if (fillStyle.visible) {
            ctx.fillStyle = fillStyle.color;
            ctx.globalAlpha = fillStyle.alpha;
            ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
        }
        if (lineStyle.visible) {
            ctx.strokeStyle = lineStyle.color;
            ctx.lineWidth = lineStyle.width;
            ctx.lineWidth = lineStyle.width;
            ctx.lineCap = lineStyle.cap;
            ctx.globalAlpha = lineStyle.alpha;
            ctx.strokeRect(x, y, width, height);
        }
    }
}