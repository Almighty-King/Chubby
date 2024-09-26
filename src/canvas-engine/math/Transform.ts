import { Matrix } from './Matrix';
import { ObservablePoint } from './Point';

export class Transform {
    public localTransform = new Matrix();
    public worldTransform = new Matrix();
    // 位置、缩放、轴心点和倾斜属性
    public position: ObservablePoint;
    public scale: ObservablePoint;
    public pivot: ObservablePoint;
    public skew: ObservablePoint;
    public _rotation = 0;
    private transformMatrix: Matrix | null = null;

    public shouldUpdateLocalTransform = false;
    public shouldUpdateWorldTransform = false;

    constructor() {
        this.position = new ObservablePoint(this.onChange);
        this.scale = new ObservablePoint(this.onChange, 1, 1);
        this.pivot = new ObservablePoint(this.onChange);
        this.skew = new ObservablePoint(this.onChange);
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(value: number) {
        this._rotation = value;
        this.onChange();
    }

    // 当属性变化时触发更新
    private onChange = () => {
        this.shouldUpdateLocalTransform = true;
    };

    // 更新本地变换矩阵
    private updateLocalTransform() {
        if (!this.shouldUpdateLocalTransform) return;

        if (this.transformMatrix) {
            this.localTransform = this.transformMatrix;
            return;
        }

        const rotateMatrix = new Matrix(
            Math.cos(this.rotation),
            Math.sin(this.rotation),
            -Math.sin(this.rotation),
            Math.cos(this.rotation),
        );
        const skewMatrix = new Matrix(
            Math.cos(this.skew.y),
            Math.sin(this.skew.y),
            Math.sin(this.skew.x),
            Math.cos(this.skew.x),
        );
        const scaleMatrix = new Matrix(this.scale.x, 0, 0, this.scale.y);

        const { a, b, c, d } = rotateMatrix
            .append(skewMatrix)
            .append(scaleMatrix);

        // 计算新的轴心点位置
        const newPivotX = a * this.pivot.x + c * this.pivot.y;
        const newPivotY = b * this.pivot.x + d * this.pivot.y;

        const tx = this.position.x - newPivotX;
        const ty = this.position.y - newPivotY;

        this.localTransform.set(a, b, c, d, tx, ty);
        this.shouldUpdateLocalTransform = false;

        this.shouldUpdateWorldTransform = true;
    }

    // 更新世界变换矩阵
    public updateTransform(parentTransform: Transform): boolean {
        this.updateLocalTransform();

        if (!this.shouldUpdateWorldTransform) return false;

        this.worldTransform = this.localTransform
            .clone()
            .prepend(parentTransform.worldTransform);

        this.shouldUpdateWorldTransform = false;

        return true;
    }

    // 直接设置变换矩阵
    public setFromMatrix(matrix: Matrix) {
        this.transformMatrix = matrix;
        this.shouldUpdateLocalTransform = true;
    }
}
