import { Rectangle } from "@/canvas-engine/math/shapes/Rectangle";
import { Container } from "../base/Container";
import { IApplicationOptions } from "../Application";

export class CanvasRender {
    public canvasEle: HTMLCanvasElement;
    public screen: Rectangle;
    public ctx: CanvasRenderingContext2D;
    private background: string | undefined;
    constructor(options: IApplicationOptions) {
        const { view, backgroundColor } = options;
        this.canvasEle = view;
        this.screen = new Rectangle();
        this.screen.width = view.width;
        this.screen.height = view.height;
        this.background = backgroundColor;
        this.ctx = view.getContext('2d') as CanvasRenderingContext2D;
    }

    public resizeView(width: number, height: number) {
        this.canvasEle.width = width;
        this.canvasEle.height = height;
    }

    public render(container: Container) {
        container.updateTransform();

        this.ctx.save();
        this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
        if (this.background) {
            this.ctx.fillStyle = this.background;
            this.ctx.fillRect(0, 0, this.screen.width, this.screen.height);
        }
        container.renderCanvasRecursive(this);
        this.ctx.restore();
    }
}