import { Container } from '../base/Container';
import { EventBoundary } from './EventBoundary';
import { FederatedEventMap, FederatedMouseEvent } from './FederatedMouseEvent';

export class EventSystem {
    private canvasEle: HTMLCanvasElement;
    private eventBoundary: EventBoundary;
    private rootEvent = new FederatedMouseEvent();
    constructor(canvasEle: HTMLCanvasElement, stage: Container) {
        this.canvasEle = canvasEle;
        this.eventBoundary = new EventBoundary(stage);
        this.addEvents();
    }
    private addEvents = () => {
        this.canvasEle.addEventListener(
            'pointermove',
            this.onPointerMove,
            true,
        );
        this.canvasEle.addEventListener(
            'pointerleave',
            this.onPointerLeave,
            true,
        );
        this.canvasEle.addEventListener(
            'pointerdown',
            this.onPointerDown,
            true,
        );
        this.canvasEle.addEventListener('pointerup', this.onPointerup, true);
        this.canvasEle.addEventListener('wheel', this.onWheel, true);
    };
    private onPointerMove = (nativeEvent: PointerEvent) => {
        this.bootstrapEvent(nativeEvent);
        this.eventBoundary.fireEvent(this.rootEvent);
        this.setCursor();
    };
    private onPointerLeave = () => {
        this.eventBoundary.overTargets = [];
    };
    private onPointerDown = (nativeEvent: PointerEvent) => {
        this.bootstrapEvent(nativeEvent);
        this.eventBoundary.fireEvent(this.rootEvent);
    };
    private onPointerup = (nativeEvent: PointerEvent) => {
        this.bootstrapEvent(nativeEvent);
        this.eventBoundary.fireEvent(this.rootEvent);
    };
    private onWheel = (nativeEvent: WheelEvent) => {
        this.bootstrapEvent(nativeEvent);
        this.eventBoundary.fireEvent(this.rootEvent);
    };
    private bootstrapEvent = (nativeEvent: PointerEvent | WheelEvent) => {
        this.rootEvent.isTrusted = nativeEvent.isTrusted;
        this.rootEvent.timeStamp = performance.now();
        // 将pointer事件转换为mouse事件
        this.rootEvent.type = nativeEvent.type.replace(
            'pointer',
            'mouse',
        ) as keyof FederatedEventMap;
        this.rootEvent.button = nativeEvent instanceof PointerEvent ? nativeEvent.button : 0;
        this.rootEvent.buttons = nativeEvent instanceof PointerEvent ? nativeEvent.buttons : 0;
        this.rootEvent.global.x = (nativeEvent instanceof PointerEvent ? nativeEvent.offsetX : 0) * window.devicePixelRatio;
        this.rootEvent.global.y = (nativeEvent instanceof PointerEvent ? nativeEvent.offsetY : 0) * window.devicePixelRatio;
        if (nativeEvent instanceof WheelEvent) {
            this.rootEvent.deltaY = nativeEvent.deltaY;
            this.rootEvent.deltaX = nativeEvent.deltaX;
        }
    };
    private setCursor = () => {
        this.canvasEle.style.cursor = this.eventBoundary.cursor as string;
    };
}
