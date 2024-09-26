import { Point } from './Point';

export class Matrix {
    public a: number;
    public b: number;
    public c: number;
    public d: number;
    public tx: number;
    public ty: number;

    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    }

    set(a: number, b: number, c: number, d: number, tx: number, ty: number) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    }

    public clone(): Matrix {
        return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
    }

    /**
     * 矩阵右乘
     * @param matrix
     * @returns
     */
    public append(matrix: Matrix): Matrix {
        const a = this.a * matrix.a + this.c * matrix.b;
        const b = this.b * matrix.a + this.d * matrix.b;
        const c = this.a * matrix.c + this.c * matrix.d;
        const d = this.b * matrix.c + this.d * matrix.d;
        const tx = this.a * matrix.tx + this.c * matrix.ty + this.tx;
        const ty = this.b * matrix.tx + this.d * matrix.ty + this.ty;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    }

    /**
     * 矩阵左乘
     * @param matrix
     * @returns
     */
    public prepend(matrix: Matrix): Matrix {
        const a = matrix.a * this.a + matrix.c * this.b;
        const b = matrix.b * this.a + matrix.d * this.b;
        const c = matrix.a * this.c + matrix.c * this.d;
        const d = matrix.b * this.c + matrix.d * this.d;
        const tx = matrix.a * this.tx + matrix.c * this.ty + matrix.tx;
        const ty = matrix.b * this.tx + matrix.d * this.ty + matrix.ty;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    }

    /**
     *  矩阵逆变换， 可用于global坐标转local坐标
     * @param p 
     * @returns 
     */
    public applyInverse(p: Point): Point {
        let newPoint = new Point();
        const dpr = window.devicePixelRatio || 1;
        const id = 1 / (this.a * this.d + this.c * -this.b);

        const x = p.x;
        const y = p.y;

        newPoint.x =
            this.d * id * x +
            -this.c * id * y +
            (this.ty * this.c - this.tx * this.d) * id;
        newPoint.y =
            this.a * id * y +
            -this.b * id * x +
            (-this.ty * this.a + this.tx * this.b) * id;

        // newPoint.x /= dpr;
        // newPoint.y /= dpr;
        return newPoint;
    }

    /**
     * 矩阵正向变换，可用于local坐标转global坐标
     * @param p 
     * @returns 
     */
    public apply(p: Point): Point {
        let newPoint = new Point();
        const dpr = window.devicePixelRatio || 1;

        newPoint.x = this.a * p.x + this.c * p.y + this.tx;
        newPoint.y = this.b * p.x + this.d * p.y + this.ty;

        // newPoint.x /= dpr;
        // newPoint.y /= dpr;
        return newPoint;
    }
}
