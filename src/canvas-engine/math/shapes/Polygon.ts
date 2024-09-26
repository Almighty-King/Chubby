import { ShapeType } from '@/canvas-engine/enum';
import { Shape } from './Shape';
import { Point } from '../Point';
import { FillStyle } from '@/canvas-engine/graphics/style/FillStyle';
import { LineStyle } from '@/canvas-engine/graphics/style/LineStyle';

export class Polygon extends Shape {
    public points: number[];
    public closeStroke = false;
    public type = ShapeType.Polygon;
    constructor() {
        super();
        this.points = [];
    }
    public contain(point: Point): boolean {
        return true;
    }

    public draw(
        ctx: CanvasRenderingContext2D,
        fillStyle: FillStyle,
        lineStyle: LineStyle,
    ) {
        const polygon = this;

        const { points, closeStroke } = polygon;

        ctx.moveTo(points[0], points[1]);

        for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i], points[i + 1]);
        }

        if (closeStroke) {
            ctx.closePath();
        }

        if (fillStyle.visible) {
            ctx.globalAlpha = fillStyle.alpha;
            ctx.fill();
        }

        if (lineStyle.visible) {
            ctx.globalAlpha = lineStyle.alpha;
            ctx.stroke();
        }
    }
}
