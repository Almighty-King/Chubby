import { Application } from '../Application';
import { Point } from '../math/Point';
import { Transform } from '../math/Transform';
import { CanvasRender } from '../render/CanvasRender';
import { BaseNode } from './DisplayObject';

export class Container extends BaseNode {
    public sortDirty: boolean;
    public readonly children: Container[];
    public parent: Container | null;
    public name: string;
    public mask: Container | null;
    public app?: Application;

    constructor(name?: string, app?: Application) {
        super();
        this.sortDirty = false;
        this.children = [];
        this.parent = null;
        this.name = name || '';
        this.mask = null;
        this.app = app;
    }

    /**
     * container 自身不渲染
     * @param render
     */
    protected renderCanvas(render: CanvasRender) {
        // do nothing
    }

    /**
     *  递归渲染所有子节点
     * @param render
     * @returns
     */
    public renderCanvasRecursive(render: CanvasRender) {
        if (!this.visible) {
            return;
        }
        this.renderCanvas(render);

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].renderCanvasRecursive(render);
        }
    }

    /**
     *
     * @param child
     * @returns
     */
    public removeChild(child: Container) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] === child) {
                this.children.splice(i, 1);
                return;
            }
        }
    }

    public addChild(child: Container) {
        child.parent?.removeChild(child); // 将添加进来的节点从其原来父节点中清除
        this.children.push(child);
        child.parent = this;
        this.sortDirty = true;
    }

    /**
     * 在有子节点改动后 sortDirty 会置为true 排序后置为false
     */
    public sortChildren() {
        if (!this.sortDirty) {
            return;
        }
        this.children.sort((a, b) => a.zIndex - b.zIndex); // 根据节点zIndex重排 zIndex高的放到后边渲染
        this.sortDirty = false; // 改为false后就标记该Container的子节点不需要重排避免重复计算
    }

    public removeChildByName(name: string) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].name === name) {
                this.children.splice(i, 1);
                return;
            }
        }
    }

    public removeAllChildren() {
        this.children.length = 0;
    }

    /**
     * 递归更新当前元素及所有子元素的transform
     */
    public updateTransform() {
        this.sortChildren();

        const parentTransform = this.parent?.transform || new Transform();
        this.transform.updateTransform(parentTransform);
        if (!this.visible) {
            return; // 如果当前节点不可见，则不需要更新子节点的transform
        }
        for (const child of this.children) {
            child.transform.shouldUpdateWorldTransform = true;
            child.updateTransform();
        }
    }

    /**
     * container 不渲染 所以直接返回false
     * @param point
     * @returns
     */
    public containsPoint(point: Point) {
        if (!this.hitArea) {
            return false;
        }

        return this.hitArea.contain(point);
    }
}
