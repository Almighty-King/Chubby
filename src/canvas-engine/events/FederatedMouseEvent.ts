import { Container } from "../base";
import { Point } from "../math/Point";
import { EventPhase } from "./constant";

export class FederatedMouseEvent {
    public isTrusted = true;
    public timeStamp = 0;
    public type: keyof FederatedEventMap = "mousemove";
    public button = 0;
    public buttons = 0;
    public global = new Point();
    public propagationStopped = false;
    public eventPhase = EventPhase.NONE;
    public target = new Container();
    public currentTarget = new Container();
    public deltaY = 0;
    public deltaX = 0;

    public stopPropagation() {
        this.propagationStopped = true;
    }
}

export interface FederatedEventMap {
    mousedown: FederatedMouseEvent;
    mouseup: FederatedMouseEvent;
    click: FederatedMouseEvent;
    mouseenter: FederatedMouseEvent;
    mouseleave: FederatedMouseEvent;
    mousemove: FederatedMouseEvent;
    mouseout: FederatedMouseEvent;
    mouseover: FederatedMouseEvent;
    wheel: FederatedMouseEvent;
}
