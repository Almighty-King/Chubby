import { Container } from "./base/Container";
import { CanvasRender } from "./render/CanvasRender";
import { EventSystem } from './events/EventSystem';

export  interface IApplicationOptions {
    view: HTMLCanvasElement;
    backgroundColor?: string;
}

export class Application {
    public stage: Container;
    public view: HTMLCanvasElement;
    public renderer: CanvasRender;
    private eventSystem: EventSystem;

    constructor (options: IApplicationOptions) {
        const { view } = options;
        this.view = view;
        this.renderer = new CanvasRender(options);
        this.stage = new Container('Stage', this);
        this.eventSystem = new EventSystem(this.view, this.stage);
    }

    public render() {
        this.renderer.render(this.stage);
    }
}