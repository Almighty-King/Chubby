import { Shape } from '@/canvas-engine/math/shapes/Shape';
import { GraphicsData } from './GraphicsData';
import { FillStyle } from './style/FillStyle';
import { LineStyle } from './style/LineStyle';
import { Point } from '../math/Point';

export class GraphicsGeometry {
    public graphicsData: GraphicsData[];
    constructor() {
        this.graphicsData = [];
    }

    public drawShape(shape: Shape, fillStyle: FillStyle, lineStyle: LineStyle) {
        const data = new GraphicsData(shape, lineStyle, fillStyle);
        this.graphicsData.push(data);
    }

    public clear() {
        this.graphicsData = [];
    }

    public containsPoint(p: Point): boolean {
        for (let i = 0; i < this.graphicsData.length; i++) {
            const { shape, fillStyle } = this.graphicsData[i];
            if (!fillStyle.visible) {
                continue;
            }
            if (shape.contain(p)) {
                return true;
            }
        }

        return false;
    }
}
