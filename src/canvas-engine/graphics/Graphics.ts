import { Container } from '../base/Container';
import { FillStyle } from './style/FillStyle';
import { Polygon } from '../math/shapes/Polygon';
import { Shape } from '../math/shapes/Shape';
import { GraphicsGeometry } from './GraphicsGeometry';
import { LineStyle } from './style/LineStyle';
import { Rectangle } from '../math/shapes/Rectangle';
import { CanvasRender } from '../render/CanvasRender';
import { Circle } from '../math/shapes/Circle';
import { Ellipse } from '../math/shapes/Ellipse';
import { RoundedRectangle } from '../math/shapes/RoundedRectangle';
import { Point } from '../math/Point';
import { ILineStyleOptions } from '../types/graphics';

export class Graphics extends Container {
    private _fillStyle: FillStyle;
    private _lineStyle: LineStyle;
    public currentPath: Polygon;
    private _geometry: GraphicsGeometry;

    constructor() {
        super();
        this.currentPath = new Polygon();
        this._geometry = new GraphicsGeometry();
        this._fillStyle = new FillStyle();
        this._lineStyle = new LineStyle();
    }
    /**
     *
     * @param width
     * @param color
     * @param alpha
     */
    public lineStyle(width: number, color?: string, alpha?: number): this;
    public lineStyle(options: ILineStyleOptions): this;
    public lineStyle(
        options: ILineStyleOptions | number,
        color: string = '0x000000',
        alpha: number = 1,
    ) {
        this.startPoly();
        if (typeof options === 'object') {
            Object.assign(this._lineStyle, options);
        } else {
            const opts: ILineStyleOptions = { width: options, color, alpha };
            Object.assign(this._lineStyle, opts);
        }
        this._lineStyle.visible = true;
        return this;
    }

    public moveTo(x: number, y: number) {
        this.startPoly();
        this.currentPath.points[0] = x;
        this.currentPath.points[1] = y;

        return this;
    }

    /**
     *
     * @param x
     * @param y
     * @returns
     */
    public lineTo(x: number, y: number) {
        if (this.currentPath.points.length === 0) {
            this.moveTo(x, y);
            return this;
        }

        // 去除重复的点
        const points = this.currentPath.points;
        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];

        if (fromX !== x || fromY !== y) {
            points.push(x, y);
        }

        return this;
    }

    /**
     *
     * @returns
     */
    public closePath() {
        this.currentPath.closeStroke = true;
        this.startPoly();

        return this;
    }

    public beginFill(color = '#000000', alpha = 1) {
        if (this.currentPath) {
            this.startPoly();
        }

        this._fillStyle.color = color;
        this._fillStyle.alpha = alpha;

        if (this._fillStyle.alpha > 0) {
            this._fillStyle.visible = true;
        }

        return this;
    }

    /**
     *
     * @returns
     */
    public endFill() {
        this.startPoly();
        this._fillStyle.reset();
        return this;
    }

    /**
     * 清空已有path 绘制新的path
     */
    protected startPoly() {
        if (this.currentPath) {
            const len = this.currentPath.points.length;
            if (len > 2) {
                this.drawShape(this.currentPath);
            }
        }
        this.currentPath = new Polygon();
    }

    protected drawShape(shape: Shape): this {
        this._geometry.drawShape(
            shape,
            this._fillStyle.clone(),
            this._lineStyle.clone(),
        );
        return this;
    }

    public drawRect(x: number, y: number, width: number, height: number): this {
        return this.drawShape(new Rectangle(x, y, width, height));
    }

    public drawCircle(x: number, y: number, radius: number): this {
        return this.drawShape(new Circle(x, y, radius));
    }

    public drawEllipse(
        x: number,
        y: number,
        width: number,
        height: number,
    ): this {
        return this.drawShape(new Ellipse(x, y, width, height));
    }

    public drawRoundedRectangle(
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
    ): this {
        return this.drawShape(
            new RoundedRectangle(x, y, width, height, radius),
        );
    }

    public clear() {
        this._geometry.clear();
        this._fillStyle.reset();
        this._lineStyle.reset();
        this.currentPath = new Polygon();
        return this;
    }

    /**
     *  绘制到canvas
     * @param render
     */
    protected renderCanvas(render: CanvasRender) {
        const ctx = render.ctx;
        const { a, b, c, d, tx, ty } = this.transform.worldTransform;
        ctx.setTransform(a, b, c, d, tx, ty);

        const graphicsData = this._geometry.graphicsData;
        for (let i = 0; i < graphicsData.length; i++) {
            const data = graphicsData[i];
            const { lineStyle, fillStyle, shape } = data;
            shape.draw(ctx, fillStyle, lineStyle);
        }
    }

    public containsPoint(point: Point): boolean {
        if (this.hitArea) {
            return this.hitArea.contain(point);
        }
        return this._geometry.containsPoint(point);
    }
}
