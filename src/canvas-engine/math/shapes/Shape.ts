import { FillStyle } from "@/canvas-engine/graphics/style/FillStyle";
import { ShapeType } from "../../enum";
import { Point } from "../Point";
import { LineStyle } from "@/canvas-engine/graphics/style/LineStyle";

export abstract class Shape {
    public abstract type: ShapeType;
    public abstract contain (point: Point): boolean;
    public abstract draw (ctx: CanvasRenderingContext2D, fillStyle: FillStyle, lineStyle: LineStyle): void;
}