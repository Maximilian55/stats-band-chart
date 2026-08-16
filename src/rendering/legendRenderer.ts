import { font } from "powerbi-visuals-utils-formattingutils";
import {
    drawMarkerShape
} from "./markerRenderer";

export interface LegendItem {
    label: string;
    color: string;
    shape: string;
    inverted?: boolean;
}

export interface LegendRenderOptions {
    svg: SVGSVGElement;
    items: LegendItem[];
    width: number;
    y: number;
    fontSize: number;
    bold: boolean;
}

export function drawLegend(
    options: LegendRenderOptions
): void {

    const {
        svg
        ,items
        ,width
        ,y
        ,fontSize
        ,bold
    } = options;

    const svgNamespace =
        "http://www.w3.org/2000/svg";

    const markerSize =
        Math.max(
            4
            ,Math.min(
                14
                ,fontSize * 0.45
            )
        );

    const itemGap = 20;

    const itemWidths =
        items.map(
            item => 
                markerSize * 2 +
                5 +
                item.label.length *
                    fontSize *
                    0.6 +
                itemGap
        );
    
    const totalWidth =
        itemWidths.reduce(
            (sum, width) =>
                sum + width
                ,0
        );
    
    let currentX =
        (
            width - totalWidth
        ) / 2;


    for (
        const item of items
    ) {

        const markerX =
            currentX +
            markerSize;

        drawMarkerShape(
            svg
            ,markerX
            ,y
            ,markerSize
            ,item.color
            ,item.shape
            ,item.inverted ?? false
        );

        const label =
            document.createElementNS(
                svgNamespace
                ,"text"
            );

        const markerLabelGap =
            Math.max(
                4
                ,fontSize * 0.4
            );

        const labelX =
            markerX +
            markerSize +
            markerLabelGap;

        label.setAttribute(
            "x"
            ,labelX.toString()
        );

        label.setAttribute(
            "y"
            ,y.toString()
        );

        label.setAttribute(
            "font-size"
            ,fontSize.toString()
        );

        label.setAttribute(
            "font-weight"
            ,bold
                ? "700"
                : "400"
        );

        label.setAttribute(
            "dominant-baseline"
            ,"middle"
        );

        label.textContent =
            item.label;

        svg.appendChild(
            label
        );

        currentX =
            labelX +
            item.label.length *
                fontSize *
                0.6 +
            20;
    }
}