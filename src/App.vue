<script setup lang="ts">
import { Application, Container, Graphics } from '@/canvas-engine';
import { Rectangle } from '@/canvas-engine/math/shapes/Rectangle';
import { FormulaParser } from '@/formula-engine/parser';
import { Lexer } from 'chevrotain';
import { allTokens } from '@/formula-engine/lexer';
import { DependencyGraph } from '@/formula-engine/DependencyGraph';
import { ViewPort } from '@/canvas-engine/viewport/ViewPort';
import { Avatar, Col, Divider, Layout, Row } from '@arco-design/web-vue';
import { onMounted, ref } from 'vue';
import init from './formula-engine/pkg/formula_wasm';
import {
    IconNav,
    IconSettings,
    IconFilter,
    IconList,
    IconSortAscending,
    IconFullscreen,
} from '@arco-design/web-vue/es/icon';

import ToolbarItem from './components/ToolbarItem.vue';
import { throttle } from './utils';
import { ICellData, Sheet } from './core/Sheet';
import {
    BATCH_SIZE,
    FIRST_BATCH_SIZE,
    ROW_BLANK_WIDTH,
    ROW_NUM_WIDTH,
    SHEET_X,
    SHEET_Y,
} from './utils/const';
import { evaluate } from './formula-engine/calculator';
import { TaskScheduler } from './scheduler';
import { SheetData } from '@/data';

const setCanvasSize = (canvas: HTMLCanvasElement) => {
    if (canvas) {
        canvas.width = document.getElementById('gridView')
            ?.clientWidth as number;
        canvas.height = document.getElementById('gridView')
            ?.clientHeight as number;
    }
};

const CONTROL_BTN_LIST: { icon: typeof IconFilter; text: string }[] = [
    { icon: IconSettings, text: '字段配置' },
    { icon: IconFilter, text: '筛选' },
    { icon: IconList, text: '分组' },
    { icon: IconSortAscending, text: '排序' },
    { icon: IconFullscreen, text: '行高' },
];

const canvasSize = ref({
    width: 0,
    height: 0,
});
const numToChar = (num: number) => {
    return String.fromCharCode(65 + num);
};

const createSheetData = () => {
    const sheetData: ICellData[][] = new Array(10000).fill(0).map((_, index) => {
        return new Array(26).fill(0).map((_, c) => {
            if (c < 2) {
                return {
                    v: `${index + c}`,
                    formula: '',
                    row: index,
                    col: c,
                    // m: `${index}`,
                };
            } else {
                return {
                    v: 0,
                    dirty: true,
                    // =SUM(${numToChar(c - 2)}${index + 1} , ${numToChar(c - 1)}${index + 1})
                    formula: `=SUM(${numToChar(c - 2)}${index + 1} , ${numToChar(c - 1)}${index + 1})`,
                    row: index,
                    col: c,
                    // m: `${index}-${c}`,
                };
            }
        });
    });
    return sheetData;
};
onMounted(async () => {
    await init();
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    setCanvasSize(canvas);

    let dpr = window.devicePixelRatio;
    let { width: cssWidth, height: cssHeight } = canvas.getBoundingClientRect();
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    canvas.width = dpr * cssWidth;
    canvas.height = dpr * cssHeight;
    canvasSize.value.width = canvas.width;
    canvasSize.value.height = canvas.height;
    window.addEventListener('resize', throttle(setCanvasSize, 20));
    const scheduler = new TaskScheduler();
    const sheetData = createSheetData();
    const data: SheetData = new SheetData(sheetData);
    const app = new Application({
        view: canvas,
        backgroundColor: 'white',
    });
    app.stage.hitArea = new Rectangle(0, 0, app.view.width, app.view.height);
    const viewPortHeight = canvasSize.value.height - 40 - SHEET_Y;
    const viewPortWidth =
        canvasSize.value.width - ROW_NUM_WIDTH - ROW_BLANK_WIDTH - SHEET_X;

    let mainViewport: ViewPort;
    mainViewport= new ViewPort(
        {
            x: 0,
            y: 20,
            width: viewPortWidth,
            height: viewPortHeight,
            startRow: 0,
            startCol: 0,
            endRow: data.data.length,
            endCol: data.data[0].length,
            frozenRows: 0,
            frozenCols: 0,
        },
        app,
    );
    const sheet = new Sheet(data, mainViewport);
    data.on('setCellFormula', (changeData: { row: number; col: number; value: string }) => {
        const { row, col } = changeData;
        scheduler.addTask(() => {
            if (data.data[row][col].ast) {
                /// 如果原来单元格有公式 则尝试删除依赖项
                dependencyGraph.deleteDependency(`${row}-${col}`, data.data[row][col].ast);
            }
            const token = lexer.tokenize(data.data[row][col].formula);
            parser.input = token.tokens;
            const ast = parser.formula();
            
            data.data[row][col].ast = ast;
            // 新建依赖
            dependencyGraph.addDependency(`${row}-${col}`, ast);
            const runList = dependencyGraph.topologicalSortWasm([`${row}-${col}`]);
            for (let i = 0; i < runList.length; i++) {
                const runCell = runList[i];
                const [row, col] = runCell.split('-');
                const cell = data.getCellData(Number(row), Number(col));
                if (cell.formula) {
                    const result = evaluate(cell.ast, data.data);
                    data.setCellValue(Number(row), Number(col), result, false);
                }
            }
            mainViewport.updateRender();

        }, 'HIGH', true, true);
    });
    data.on('setCellValue', (changeData: { row: number; col: number; value: string }) => {
        const { row, col } = changeData;
        // 立即执行
        scheduler.addTask(() => {
            const runList = dependencyGraph.topologicalSortWasm([`${row}-${col}`]);
            for (let i = 0; i < runList.length; i++) {
                const runCell = runList[i];
                const [row, col] = runCell.split('-');
                const cell = data.getCellData(Number(row), Number(col));
                if (cell.formula) {
                    const result = evaluate(cell.ast, data.data);
                    data.setCellValue(Number(row), Number(col), result, false);
                }
            }
            mainViewport.updateRender();

        }, 'HIGH', true, true);
    });
    console.time('test');
    console.time('formula');
    let parser = new FormulaParser();
    let lexer = new Lexer(allTokens, { ensureOptimizations: true });
    console.timeEnd('formula');
    console.time('dependency');
    let dependencyGraph = new DependencyGraph();
    console.timeEnd('dependency');

    const func = (r: number, c: number, f: string) => {
       const token = lexer.tokenize(f);
       parser.input = token.tokens;
       const ast = parser.formula();
       data.data[r][c].ast = ast; // 缓存 AST
       const dependency = dependencyGraph.addDependency(
           `${r}-${c}`,
           ast,
       );
       for (let item of dependency) {
           const [row, col] = item.split('-').map(Number);
           if (
               data.data[row][col]?.formula &&
               !dependencyGraph.graph.has(`${row}-${col}`)
           ) {
               func(row, col, data.data[row][col].formula);
           }
       }
    };
    // 构建 DAG
    console.time('build');
    let noFormulaCells: string[] = [];
    const runFormula = (curRow: number, batchSize: number = BATCH_SIZE) => {
        for (
            let i = curRow;
            i < Math.min(curRow + batchSize, data.data.length);
            i++
        ) {
            for (let j = 0; j < data.data[0].length; j++) {
                if (
                    data.data[i][j].formula &&
                    !dependencyGraph.graph.has(`${i}-${j}`)
                ) {
                    func(i, j, data.data[i][j].formula);
                } else if (!data.data[i][j].formula) {
                    noFormulaCells.push(`${i}-${j}`);
                }
            }
        }

        const runList = dependencyGraph.topologicalSortWasm(noFormulaCells);
        noFormulaCells = [];
        for (let i = 0; i < runList.length; i++) {
            const runCell = runList[i];
            const [row, col] = runCell.split('-');
            const cell = data.data[Number(row)][Number(col)];
            if (cell.formula) {
                const result = evaluate(cell.ast, data.data);
                cell.v = result;
                cell.m = result.toString();
            }
        }
    };
    console.timeEnd('build');
    console.time('evaluate');


    if (data.data.length < 1000) {
        runFormula(0, data.data.length);
    } else {
        runFormula(0, FIRST_BATCH_SIZE);
        for (let i = FIRST_BATCH_SIZE; i < sheetData.length; i += BATCH_SIZE) {
            scheduler.addTask(
                () => {
                    runFormula(i, BATCH_SIZE);
                },
                'HIGH',
                false,
                true,
            );
        }
    }

    console.timeEnd('evaluate');
    console.timeEnd('test');

    sheet.x = 16;
    sheet.y = 12;
    app.stage.addChild(sheet);

    // const MaxHeight = Math.ceil((gridSize.rows * cellSize.height - canvasSize.value.height) / 100 ) * 100;
    // console.log(MaxHeight)
    // const xScrollbar = new Graphics();
    // xScrollbar.zIndex = 200;
    // const scrollbarHeight = canvasSize.value.height * (canvasSize.value.height / ((gridSize.rows - 1) * cellSize.height));
    // window.app = app;
    // xScrollbar.addEventListener('mouseenter', () => {
    //     xScrollbar.cursor = 'pointer';
    // });
    // xScrollbar.addEventListener('mouseleave', () => {
    //     xScrollbar.cursor = 'default';
    // });

    // xScrollbar.beginFill('#a2a2a2', 0.6);
    // xScrollbar.lineStyle(1, '#a2a2a2', 1)
    // const y = (canvasSize.value.height - cellSize.height - scrollbarHeight) * (sheet.y / -MaxHeight);
    // xScrollbar.drawRoundedRectangle(canvasSize.value.width - 12, cellSize.height + 12 , 6, scrollbarHeight, 3);
    // xScrollbar.endFill();
    // app.stage.addChild(xScrollbar);
    const fixBottomContainer = new Container('fixBottomContainer');
    const fixBottom = new Graphics();
    fixBottom.zIndex = 100;
    fixBottomContainer.addChild(fixBottom);
    fixBottom.lineStyle(1,  '0x000000', 1);
    fixBottom.beginFill('black', 0.2);
    fixBottom.drawRect(
        0,
        canvasSize.value.height - 40,
        canvasSize.value.width,
        40,
    );
    fixBottom.endFill();
    app.stage.addChild(fixBottomContainer);
    mainViewport.updateRender();
});
</script>

<template>
    <Layout class="h-screen flex flex-col">
        <Layout.Header>
            <Row class="p-2" align="center">
                <Col :span="12">
                    <div class="flex items-center">
                        <img
                            class="w-6 h-6 mr-2"
                            src="./assets/logo.jpg"
                            alt=""
                        />
                        <span class="font-bold text-[16px]">大聪明表格</span>
                    </div>
                </Col>
                <Col :span="12">
                    <Row justify="end">
                        <Avatar>
                            <img src="./assets/logo.jpg" alt="" />
                        </Avatar>
                    </Row>
                </Col>
            </Row>
        </Layout.Header>
        <Layout.Content class="p-4 bg-[#F2F3F5] flex-1 overflow-auto">
            <div class="bg-white rounded-[12px] h-full">
                <Row class="px-4" justify="start" align="center">
                    <div class="h-[40px] py-0 flex items-center pr-3">
                        <IconNav
                            size="16"
                            :strokeWidth="3"
                            strokeLinecap="round"
                            class="stroke-blue-600 mr-[5px]"
                        />
                        <span
                            class="text-[#1f2329] text-[14px] max-w-[200px] font-[500]"
                        >
                            数据表
                        </span>
                    </div>
                    <Divider direction="vertical" />
                    <div v-for="(btn, index) in CONTROL_BTN_LIST" :key="index">
                        <ToolbarItem :icon="btn.icon" :text="btn.text" />
                    </div>
                    <div class="grow"></div>
                    <div
                        class="items-center flex h-full hover:cursor-pointer hover:bg-gray-200 ml-3 rounded-[4px]"
                    >
                        <div
                            class="w-[24px] h-[24px] flex items-center justify-center"
                        >
                            <IconFindReplace
                                size="16"
                                :strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </div>
                    </div>
                </Row>
                <div
                    id="gridView"
                    class="gridView flex-1 overflow-auto relative"
                    style="height: calc(100% - 40px)"
                >
                    <canvas
                        tabindex="-1"
                        id="canvas"
                        class="w-full h-full rounded-[12px]"
                    ></canvas>
                </div>
            </div>
        </Layout.Content>
    </Layout>
</template>

<style scoped></style>
