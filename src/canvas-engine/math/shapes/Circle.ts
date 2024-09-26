import { ShapeType } from "@/canvas-engine/enum";
import { Point } from "../Point";
import { Shape } from "./Shape";
import { FillStyle } from "@/canvas-engine/graphics/style/FillStyle";
import { LineStyle } from "@/canvas-engine/graphics/style/LineStyle";

export class Circle extends Shape {

    public x: number;
    public y: number;
    public radius: number;
    public readonly type: ShapeType;
    constructor(x = 0, y = 0, radius = 0) {
        super();
        this.type = ShapeType.Circle;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }


    public contain(point: Point): boolean {
        if (Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2) <= Math.pow(this.radius, 2)) {
            return true;
        }
        return false;
    }

    public draw(ctx: CanvasRenderingContext2D, fillStyle: FillStyle, lineStyle: LineStyle): void {
        const { x, y, radius } = this;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
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
    