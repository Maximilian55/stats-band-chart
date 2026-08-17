import {
    drawMarkerShape
    ,MarkerStyle
} from "./markerRenderer";

import {
    createSvgElement
    ,setSvgAttributes
} from "../utils/svgUtils";

export interface LegendItem {
    label: string;
    style: MarkerStyle;
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
            ,item.style
            ,item.inverted ?? false
        );

        const label =
            createSvgElement(
                "text"
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

        setSvgAttributes(
            label
            ,{
                "x": labelX
                ,"y": y
                ,"font-size": fontSize
                ,"font-weight":
                    bold
                        ? "700"
                        : "400"
                ,"dominant-baseline":
                    "middle"
            }
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
            itemGap;
    }
}