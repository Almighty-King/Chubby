import { Container } from '../base';
import { Point } from '../math/Point';
import { EventPhase } from './constant';
import { FederatedMouseEvent } from './FederatedMouseEvent';
import { Cursor } from './types';
export class EventBoundary {
    private rootContainer: Container;
    private hasFoundTarget: boolean = false;
    private hitTarget: Container | null = null;
    public cursor: Cursor | null = 'auto';
    private eventHandleMap: {
        [anyKey: string]: (e: FederatedMouseEvent) => any;
    } = {};

    private pressTargetsMap: {
        [anyKey: number]: Container[];
    } = {};

    public overTargets: Container[] = [];

    constructor(stage: Container) {
        this.rootContainer = stage;

        this.eventHandleMap = {
            mousedown: this.fireMouseDown,
            mouseup: this.fireMouseUp,
            mousemove: this.fireMouseMove,
            wheel: this.fireWheel, // 添加鼠标滚动事件
        };
    }

    private hitTestRecursive(curTarget: Container, globalPos: Point) {
        if (!curTarget.visible) return;
        if (this.hasFoundTarget) return; // 已经找到目标，不再继续查找

        // 深度优先遍历子元素
        for (let i = curTarget.children.length - 1; i >= 0; i--) {
            const child = curTarget.children[i];
            this.hitTestRecursive(child, globalPos);
        }

        if (this.hasFoundTarget) return;

        const p = curTarget.worldTransform.applyInverse(globalPos);
        if (curTarget.containsPoint(p)) {
            this.hasFoundTarget = true;
            this.hitTarget = curTarget;
        }
    }

    private hitTest(globalPos: Point): Container | null {
        this.hasFoundTarget = false;
        this.hitTarget = null;
        this.hitTestRecursive(this.rootContainer, globalPos);

        return this.hitTarget;
    }

    public fireEvent(e: FederatedMouseEvent) {
        this.handleEvent(e);
    }

    private handleEvent = (e: FederatedMouseEvent) => {
        const hitTarget = this.hitTest(e.global);
        if (!hitTarget) return;

        e.target = hitTarget;

        // 使用事件类型直接调用对应的处理方法
        switch (e.type) {
            case 'mousedown':
                this.fireMouseDown(e);
                break;
            case 'mouseup':
                this.fireMouseUp(e);
                break;
            case 'mousemove':
                this.fireMouseMove(e);
                break;
            case 'wheel':
                this.fireWheel(e);
                break;
            default:
                // 对于其他类型的事件，直接分发
                this.dispatchEvent(e);
        }
    };

    private fireMouseDown = (e: FederatedMouseEvent) => {
        const hitTarget = this.hitTest(e.global);
        if (!hitTarget) return; // 没有找到目标，直接返回

        e.target = hitTarget;
        this.dispatchEvent(e);

        // 记录点击节点的传播路径
        this.pressTargetsMap[e.button] = this.composedPath(hitTarget);
    };

    private fireMouseUp = (e: FederatedMouseEvent) => {
        const hitTarget = this.hitTest(e.global);
        if (!hitTarget) return; // 没有找到目标，直接返回

        e.target = hitTarget;
        this.dispatchEvent(e);

        const propagetionPath = this.pressTargetsMap[e.button];
        if (!propagetionPath) return;

        const pressTarget = propagetionPath[propagetionPath.length - 1];

        let clickTarget = pressTarget;
        const composedPath = this.composedPath(hitTarget);

        while (clickTarget) {
            if (!composedPath.includes(clickTarget)) {
                clickTarget = clickTarget.parent as Container;
            } else {
                break;
            }
        }

        e.type = 'click';
        e.target = clickTarget;
        this.dispatchEvent(e);
        delete this.pressTargetsMap[e.button];
    };

    private fireMouseMove = (e: FederatedMouseEvent) => {
        const hitTarget = this.hitTest(e.global);

        const topTarget =
            this.overTargets.length > 0
                ? this.overTargets[this.overTargets.length - 1]
                : null;
        if (topTarget && topTarget !== hitTarget) {
            // 触发 mouseout 事件
            e.target = topTarget;
            e.type = 'mouseout';
            this.dispatchEvent(e);

            if (
                !hitTarget ||
                !this.composedPath(hitTarget).includes(topTarget)
            ) {
                // 如果当前鼠标位置不在目标节点上，则触发 mouseleave 事件
                e.type = 'mouseleave';
                e.eventPhase = EventPhase.AT_TARGET;

                if (!hitTarget) {
                    for (const target of this.overTargets) {
                        e.target = target;
                        e.currentTarget = e.target;

                        // 分别执行捕获和冒泡
                        e.target.emit(`${e.type}capture`, e);
                        e.target.emit(e.type, e);
                    }
                } else {
                    let tempTarget = topTarget;
                    while (
                        tempTarget &&
                        !this.composedPath(hitTarget).includes(tempTarget)
                    ) {
                        e.target = tempTarget;
                        e.currentTarget = e.target;

                        // 分别执行捕获和冒泡
                        e.target.emit(`${e.type}capture`, e);
                        e.target.emit(e.type, e);

                        tempTarget = tempTarget.parent as Container;
                    }
                }
            }
        }

        if (hitTarget && topTarget !== hitTarget) {
            // 触发 mouseover 事件
            e.target = hitTarget;
            e.type = 'mouseover';
            this.dispatchEvent(e);

            // 触发 mouseenter 事件
            const composedPath = this.composedPath(hitTarget);
            e.type = 'mouseenter';
            e.eventPhase = EventPhase.AT_TARGET;
            if (!topTarget) {
                for (const target of composedPath) {
                    e.target = target;
                    e.currentTarget = e.target;

                    // 分别执行捕获和冒泡
                    e.target.emit(`${e.type}capture`, e);
                    e.target.emit(e.type, e);
                }
            } else {
                let forkedPointIdx = composedPath.length - 1;
                for (; forkedPointIdx >= 0; forkedPointIdx--) {
                    if (
                        this.composedPath(topTarget).includes(
                            composedPath[forkedPointIdx],
                        )
                    ) {
                        break;
                    }
                }
                // 自顶向下依次触发 mouseenter 事件
                for (let i = forkedPointIdx + 1; i < composedPath.length; i++) {
                    e.target = composedPath[i];
                    e.currentTarget = e.target;

                    // 分别执行捕获和冒泡
                    e.target.emit(`${e.type}capture`, e);
                    e.target.emit(e.type, e);
                }
            }
        }

        if (hitTarget) {
            // 触发 mousemove 事件
            e.target = hitTarget;
            e.type = 'mousemove';
            this.dispatchEvent(e);
        }

        this.overTargets = hitTarget ? this.composedPath(hitTarget) : [];
        if (hitTarget) {
            this.cursor = hitTarget.cursor;
        } else {
            this.cursor = 'auto';
        }
    };

    private fireWheel = (e: FederatedMouseEvent) => {
        const hitTarget = this.hitTest(e.global);
        if (!hitTarget) return; // 没有找到目标，直接返回

        e.target = hitTarget;
        this.dispatchEvent(e);
    };

    private notifyTarget(e: FederatedMouseEvent) {
        if (e.eventPhase === EventPhase.CAPTURING) {
            e.currentTarget.emit(`${e.type}capture`, e);
        } else {
            e.currentTarget.emit(e.type, e);
        }
    }

    /**
     * 从 根节点-> 目标节点 -> 根节点  捕获 -> 目标 -> 冒泡
     * @param e
     * @returns
     */
    private propagate(e: FederatedMouseEvent) {
        const composedPath = this.composedPath(e.target);
        // 捕获阶段
        e.eventPhase = EventPhase.CAPTURING;
        for (const target of composedPath) {
            e.currentTarget = target;
            this.notifyTarget(e);
            if (e.propagationStopped) return; // 停止传播
        }

        // 执行目标节点阶段
        e.eventPhase = EventPhase.AT_TARGET;
        e.currentTarget = e.target;
        e.currentTarget.emit(`${e.type}capture`, e);
        if (e.propagationStopped) return;
        e.currentTarget.emit(e.type, e);
        if (e.propagationStopped) return;

        // 冒泡阶段
        e.eventPhase = EventPhase.BUBBLING;
        for (let i = composedPath.length - 2; i >= 0; i--) {
            e.currentTarget = composedPath[i];
            this.notifyTarget(e);
            if (e.propagationStopped) return;
        }
    }

    private dispatchEvent(e: FederatedMouseEvent) {
        e.propagationStopped = false;
        this.propagate(e);
    }

    /**
     * 获取目标节点的所有祖先节点路径
     * @param target
     * @returns
     */
    private composedPath(target: Container) {
        const path: Container[] = [];
        while (target) {
            path.unshift(target);
            target = target.parent as Container;
        }
        return path;
    }
}
