import { ShapeType } from '@/canvas-engine/enum';
import { Point } from '../Point';
import { Shape } from './Shape';
import { FillStyle } from '@/canvas-engine/graphics/style/FillStyle';
import { LineStyle } from '@/canvas-engine/graphics/style/LineStyle';

export class RoundedRectangle extends Shape {
    public readonly type: ShapeType;
    constructor(
        public x = 0,
        public y = 0,
        public width = 0,
        public height = 0,
        public radius = 20,
        public topLeftRadius = true,
        public topRightRadius = true,
        public bottomLeftRadius = true,
        public bottomRightRadius = true,
    ) {
        super();
        this.type = ShapeType.RoundedRectangle;
    }

    public contain(point: Point): boolean {
        if (
            !(
                point.x >= this.x &&
                point.x <= this.x + this.width &&
                point.y >= this.y &&
                point.y <= this.y + this.height
            )
        ) {
            return false;
        }
        // 判断point 是否在四个圆角的 1/4 圆内（x - c1x）^2 +（y - c1y）^2 <= radius^2
        // 判断左上角
        const c1x = this.x + this.radius;
        const c1y = this.y + this.radius;
        if (point.x < c1x && point.y < c1y) {
            if (
                (point.x - c1x) * (point.x - c1x) +
                    (point.y - c1y) * (point.y - c1y) <
                this.radius * this.radius
            ) {
                return true;
            } else {
                return false;
            }
        }

        // 判断左下角
        const c2x = this.x + this.radius;
        const c2y = this.y + this.height - this.radius;
        if (point.x < c2x && point.y > c2y) {
            if (
                (point.x - c2x) * (point.x - c2x) +
                    (point.y - c2y) * (point.y - c2y) <
                this.radius * this.radius
            ) {
                return true;
            } else {
                return false;
            }
        }

        // 判断右上角
        const c3x = this.x + this.width - this.radius;
        const c3y = this.y + this.radius;
        if (point.x > c3x && point.y < c3y) {
            if (
                (point.x - c3x) * (point.x - c3x) +
                    (point.y - c3y) * (point.y - c3y) <
                this.radius * this.radius
            ) {
                return true;
            } else {
                return false;
            }
        }

        // 判断右下角
        const c4x = this.x + this.width - this.radius;
        const c4y = this.y + this.height - this.radius;
        if (point.x > c4x && point.y < c4y) {
            if (
                (point.x - c4x) * (point.x - c4x) +
                    (point.y - c4y) * (point.y - c4y) <
                this.radius * this.radius
            ) {
                return true;
            } else {
                return false;
            }
        }

        return true;
    }

    /**
     * 绘制圆角矩形
     * @param ctx
     * @param fillStyle
     * @param lineStyle
     */
    public draw(
        ctx: CanvasRenderingContext2D,
        fillStyle: FillStyle,
        lineStyle: LineStyle,
    ) {
        ctx.save();
        let offset = lineStyle.width < 2 ? 0.5 : 0; // 线条宽度小于2时，偏移0.5，否则不偏移
        ctx.lineWidth = lineStyle.width;
        ctx.beginPath();
        ctx.moveTo(this.x + offset + this.radius, this.y + offset);

        // 右上角
        if (this.topRightRadius) {
            ctx.arcTo(
                this.x + offset + this.width,
                this.y + offset,
                this.x + offset + this.width,
                this.y + offset + this.radius,
                this.radius
            );
        } else {
            ctx.lineTo(this.x + offset + this.width, this.y + offset);
        }


        // 右下角
        if (this.bottomRightRadius) {
            ctx.arcTo(
                this.x + offset + this.width,
                this.y + offset + this.height,
                this.x + offset + this.width - this.radius,
                this.y + offset + this.height,
                this.radius
            );
        } else {
            ctx.lineTo(this.x + offset + this.width, this.y + offset + this.height);

        }

        // 左下角
        if (this.bottomLeftRadius) {
            ctx.arcTo(
                this.x + offset,
                this.y + offset + this.height,
                this.x + offset,
                this.y + offset + this.height - this.radius,
                this.radius
            );
        } else {
            ctx.lineTo(this.x + offset, this.y + offset + this.height);
        }

        // 左上角
        if (this.topLeftRadius) {
            ctx.arcTo(
                this.x + offset,
                this.y + offset,
                this.x + offset + this.radius,
                this.y + offset,
                this.radius
            );
        } else {
            ctx.lineTo(this.x + offset, this.y + offset);
        }

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
        
        ctx.restore();
    }
}
