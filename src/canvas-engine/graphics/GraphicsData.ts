import { Shape } from "../math/shapes/Shape";
import { FillStyle } from "./style/FillStyle";
import { LineStyle } from "./style/LineStyle";

export class GraphicsData {
    public shape: Shape;
    public lineStyle: LineStyle;
    public fillStyle: FillStyle;
    public points: number[];   // 两个元素表示一个点的坐标

    constructor(shape: Shape, lineStyle: LineStyle, fillStyle: FillStyle) {
        this.points = [];
        this.shape = shape;
        this.lineStyle = lineStyle;
        this.fillStyle = fillStyle;
    }

}