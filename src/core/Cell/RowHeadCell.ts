import { Text } from "@/canvas-engine/text/Text";
import { Cell } from "./Cell";

export class RowHeadCell extends Cell {
    renderCell() {
        // this.beginFill(this.bgColor || 'white');
        // this.drawRect(0, 0, this.width, this.height);
        // this.endFill();
        let text = new Text(this.m, 10, 0, {
            fontSize: 16,
            fontFamily: 'Arial',
            fill: 'black',
            lineHeight: this.height,
            verticalAlign: 'middle',
            align: 'center'
        });
        this.addChild(text);
    }
}