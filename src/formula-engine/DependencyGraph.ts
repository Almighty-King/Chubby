import { parseCellReference } from './getdata';
import {
    AstNode,
    AstNodeType,
    CellRangeAstNode,
    CellReferenceAstNode,
    ConcatenateAstNode,
    FunctionCallAstNode,
} from './type';
import { topological_sort } from './pkg/formula_wasm'

// 有向无环图
class DependencyGraph {
    public graph: Map<string, Set<string>> = new Map();


    public addDependency(dependent: string, ast: AstNode): string[] {
        const dependence = this.getDependentsFromAst(ast);
        
        // 更新依赖图
        dependence.forEach((item: string) => {
            if (!this.graph.has(item)) {
                this.graph.set(item, new Set());
            }
            this.graph.get(item)?.add(dependent);
        });
        return dependence;
    }

    public deleteDependency(dependent: string, ast: AstNode): void {
        const dependents = this.getDependentsFromAst(ast);
        dependents.forEach((item: string) => {
            if (this.graph.has(item)) {
                this.graph.get(item)?.delete(dependent);
            }
        });
    }

    // 深度优先遍历Ast获取依赖
    private getDependentsFromAst(ast: AstNode): string[] {
        const dependents: string[] = [];

        const traverse = (node: AstNode) => {
            switch (node.type) {
                case AstNodeType.CELL_RANGE:
                    const cellRangeNode = node as CellRangeAstNode;
                    const { row: startRow, col: startCol } = parseCellReference(
                        cellRangeNode.startCell,
                    );
                    const { row: endRow, col: endCol } = parseCellReference(
                        cellRangeNode.endCell,
                    );
                    for (let r = startRow; r <= endRow; r++) {
                        for (let c = startCol; c <= endCol; c++) {
                            dependents.push(`${r}-${c}`);
                        }
                    }
                    break;
                case AstNodeType.CELL_REFERENCE:
                    const cellReferenceNode = node as CellReferenceAstNode;
                    const { row, col } = parseCellReference(
                        cellReferenceNode.cell,
                    );
                    dependents.push(`${row}-${col}`);
                    break;
                case AstNodeType.FUNCTION_CALL:
                    const functionCallNode = node as FunctionCallAstNode;
                    functionCallNode.args.forEach((arg) => traverse(arg)); // 递归
                    break;
                case AstNodeType.CONCATENATE_OP:
                    const concatenateOpNode = node as ConcatenateAstNode;
                    traverse(concatenateOpNode.left);
                    traverse(concatenateOpNode.right);
                    break;
                default:
                    break;
            }
        };

        traverse(ast);
        return dependents;
    }


    public topologicalSortWasm(affectedCells: string[]): string[] {
        const flattenGraph = [];
        for (const [node, dependents] of this.graph.entries()) {
            const [row, col] = node.split('-').map(Number); // 将 '1-1' 形式的键转换为数字
            flattenGraph.push(row, col); // 节点位置
            flattenGraph.push(dependents.size); // 依赖项数量
            for (const dependent of dependents) {
                const [depRow, depCol] = dependent.split('-').map(Number);
                flattenGraph.push(depRow, depCol); // 依赖项位置
            }
        }

        const buffer = new SharedArrayBuffer(flattenGraph.length * 4); // 4 字节的 Uint32Array
        const graphView = new Uint32Array(buffer);

        for (let i = 0; i < flattenGraph.length; i++) {
            graphView[i] = flattenGraph[i];
        }
        graphView.set(flattenGraph);

        const flattenAffectedCells = [];
        for (const cell of affectedCells) {
            const [row, col] = cell.split('-').map(Number);
            flattenAffectedCells.push(row, col);
        }
        const affectedBuffer = new SharedArrayBuffer(flattenAffectedCells.length * 4); // Uint32Array
        const affectedView = new Uint32Array(affectedBuffer);
        affectedView.set(flattenAffectedCells);
        const result = topological_sort(buffer, affectedBuffer);

        return result;
    }

    // 拓扑排序
    public topologicalSort(affectedCells: string[]): string[] {
        const inDegree: { [key:string]: number } = {};
        const queue: string[] = affectedCells;
        const result: string[] = [];

        for (const cell of affectedCells) {
            inDegree[cell] = 0;
        }
        
        // 计算入度
        const hasCalculated: { [key: string]: boolean } = {}; // 避免递归重复计算
        const calculateInDegree = (cell: string) => {
            if (!this.graph.has(cell)) return;
            if (hasCalculated[cell]) return;
            const dependencies = this.graph.get(cell)!;
            for (const dependencySet of dependencies.values()) {
                inDegree[dependencySet] = (inDegree[dependencySet] || 0) + 1;
                calculateInDegree(dependencySet);
                hasCalculated[dependencySet] = true;
            }
        };
        for (const cell of affectedCells) {
            calculateInDegree(cell);
        }
        // 主循环
        console.time('topologicalWhile');
        while (queue.length > 0) {
            const node = queue.shift()!;
            result.push(node);

            const dependencies = this.graph.get(node);
            if (!dependencies) continue;
            for (const dependency of dependencies) {
                // 找到一个依赖项 入度减1
                inDegree[dependency] = inDegree[dependency] - 1;
                // 入度为0 加入队列
                if (inDegree[dependency] === 0) {
                    queue.push(dependency);
                }
            }
        }
        console.timeEnd('topologicalWhile');
        return result;
    }

}

export { DependencyGraph };
