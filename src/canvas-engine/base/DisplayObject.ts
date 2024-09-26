import EventEmitter from 'eventemitter3';
import { Container } from './Container';
import { Transform } from '../math/Transform';
import { ObservablePoint } from '../math/Point';
import { DEG_TO_RAD, RAD_TO_DEG } from '../math/constant';
import { FederatedEventMap } from '../events/FederatedMouseEvent';
import { Cursor } from '../events/types';
import { Shape } from '../math/shapes/Shape';

export abstract class BaseNode extends EventEmitter {
    protected _zIndex: number;
    public alpha: number;
    public visible: boolean;
    public parent: Container | null;
    public transform: Transform;
    public cursor: Cursor;
    public hitArea: Shape | null;

    constructor() {
        super();
        this._zIndex = 0;
        this.alpha = 1;
        this.visible = true;
        this.parent = null;
        this.hitArea = null;
        this.cursor = 'auto';
        this.transform = new Transform();
    }

    public updateTransform() {
        const parentTransform = this.parent?.transform || new Transform();
        this.transform.updateTransform(parentTransform);
    }

    get worldTransform() {
        return this.transform.worldTransform;
    }

    get zIndex(): number {
        return this._zIndex;
    }

    set zIndex(value: number) {
        this._zIndex = value;
    }

    get position(): ObservablePoint {
        return this.transform.position;
    }

    get skew(): ObservablePoint {
        return this.transform.skew;
    }

    get pivot(): ObservablePoint {
        return this.transform.pivot;
    }

    get x(): number {
        return this.position.x;
    }

    set x(value: number) {
        this.position.x = value;
    }

    get y(): number {
        return this.position.y;
    }

    set y(value: number) {
        this.position.y = value;
    }

    get scale(): ObservablePoint {
        return this.transform.scale;
    }

    get scaleX(): number {
        return this.scale.x;
    }

    get scaleY(): number {
        return this.scale.y;
    }

    get rotation(): number {
        return this.transform.rotation;
    }

    set rotation(value: number) {
        this.transform.rotation = value;
    }

    get angle(): number {
        return this.rotation * RAD_TO_DEG;
    }

    set angle(value: number) {
        this.transform.rotation = value * DEG_TO_RAD;
    }

    public addEventListener<K extends keyof FederatedEventMap>(
        type: K,
        listener: (ev: FederatedEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void {
        const capture =
            options && typeof options === 'object' ? options.capture : options;
        const realType = capture ? type : `${type}capture`;
        if (typeof options === 'object' && options.once) {
            this.once(realType, listener);
        } else {
            this.on(realType, listener);
        }
    }

    public removeEventListener<K extends keyof FederatedEventMap>(
        type: K,
        listener: (ev: FederatedEventMap[K]) => any,
        capture?: boolean,
    ): void {
        const realType = capture ? type : `${type}capture`;
        this.off(realType, listener);
    }
}
