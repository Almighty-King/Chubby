import { ShapeType } from "@/canvas-engine/enum";
import { Shape } from "./Shape";
import { Point } from "../Point";
import { FillStyle } from "@/canvas-engine/graphics/style/FillStyle";
import { LineStyle } from "@/canvas-engine/graphics/style/LineStyle";

export class Ellipse extends Shape {
    public x: number;
    public y: number;
    public radiusX: number;
    public radiusY: number;
    public readonly type: ShapeType;
    constructor(x = 0, y = 0, radiusX = 0, radiusY = 0) {
        super();
        this.type = ShapeType.Ellipse;
        this.x = x;
        this.y = y;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
    }
    
    public contain(point: Point): boolean {
        if (Math.pow((point.x - this.x), 2) / Math.pow(this.radiusX, 2) + Math.pow((point.y - this.y), 2) / Math.pow(this.radiusY, 2) <= 1) {
            return true;
        }
        return false;
    }

    public draw(ctx: CanvasRenderingContext2D, fillStyle: FillStyle, lineStyle: LineStyle): void {
        const { x, y, radiusX, radiusY } = this;
        ctx.beginPath();
        ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
        if (fillStyle.visible) {
            ctx.fillStyle = fillStyle.color;
            ctx.globalAlpha = fillStyle.alpha;
            ctx.fill();
        }
        if (lineStyle.visible) {
            ctx.strokeStyle = lineStyle.color;
            ctx.globalAlpha = lineStyle.alpha;
            ctx.stroke();
        }
    }
    
}