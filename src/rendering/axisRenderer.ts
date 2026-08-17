import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import {
    VisualFormattingSettingsModel
} from "../settings";

import {
    createSvgElement
    ,setSvgAttributes
} from "../utils/svgUtils";
import { normalizeFileName } from "powerbi-visuals-utils-formattingutils/lib/stringExtensions";

export function drawCategorySeparator(
    svg: SVGSVGElement
    ,x: number
    ,top: number
    ,bottom: number
    ,angled: boolean
): void {

    const path =
        createSvgElement(
            "path"
        );
    
    let pathData =
        `M ${x} ${top} ` +
        `L ${x} ${bottom}`;

    if (angled) {
        const extension =
            18;
        pathData +=
            ` L ${x + extension} ${bottom + extension}`;
    }

    setSvgAttributes(
        path
        ,{
            "d": pathData
            ,"fill": "none"
            ,"stroke": "#D9D9D9"
            ,"stroke-width": 1
        }
    );

    svg.appendChild(
        path
    );
}

export interface YAxisRenderOptions {
    svg: SVGSVGElement;
    width: number;

    marginLeft: number;
    marginRight: number;
    marginTop: number;

    chartHeight: number;

    yMin: number;
    yMax: number;
    majorStep: number;

    yScale: (
        value: number
    ) => number;

    formatter: valueFormatter.IValueFormatter;

    formattingSettings: VisualFormattingSettingsModel;
}

export function drawYAxis(
    options: YAxisRenderOptions
): void {

    const {
        svg
        ,width
        ,marginLeft
        ,marginRight
        ,marginTop
        ,chartHeight
        ,yMin
        ,yMax
        ,majorStep
        ,yScale
        ,formatter
        ,formattingSettings
    } = options;

    if (
        !formattingSettings
            .yAxis
            .show
            .value
    ) {
        return;
    }

    for (
        let tickValue = yMin;
        tickValue <=
            yMax +
            majorStep * 0.001;
        tickValue += majorStep
    ) {

        const y =
            yScale(
                tickValue
            );

        /*
         * Major gridline
         */
        if (
            formattingSettings
                .yAxis
                .gridlines
                .value
        ) {

            const gridline =
                createSvgElement(
                    "line"
                );

            setSvgAttributes(
                gridline
                ,{
                    "x1": marginLeft
                    ,"x2":
                        width
                        - marginRight
                    ,"y1": y
                    ,"y2": y
                    ,"stroke": "#D9D9D9"
                    ,"stroke-width": 1
                }
            );

            svg.appendChild(
                gridline
            );
        }

        /*
         * Minor gridline
         */
        if (
            formattingSettings
                .yAxis
                .minorGridlines
                .value
        ) {

            const minorValue =
                tickValue +
                majorStep / 2;

            if (
                minorValue < yMax
            ) {

                const minorY =
                    yScale(
                        minorValue
                    );

                const minorLine =
                    createSvgElement(
                        "line"
                    );

                setSvgAttributes(
                    minorLine
                    ,{
                        "x1": marginLeft
                        ,"x2":
                            width
                            - marginRight
                        ,"y1": minorY
                        ,"y2": minorY
                        ,"stroke": "#EEEEEE"
                        ,"stroke-width": 1
                    }
                );

                svg.appendChild(
                    minorLine
                );
            }
        }

        /*
         * Tick mark
         */
        const tick =
            createSvgElement(
                "line"
            );

        setSvgAttributes(
            tick
            ,{
                "x1":
                    marginLeft
                    - 5
                ,"x2":
                    marginLeft
                ,"y1": y
                ,"y2": y
                ,"stroke": "#666666"
                ,"stroke-width": 1
            }
        );

        svg.appendChild(
            tick
        );

        /*
         * Tick label
         */
        const label =
            createSvgElement(
                "text"
            );

        setSvgAttributes(
            label
            ,{
                "x":
                    marginLeft
                    - 10
                ,"y": y
                ,"text-anchor": "end"
                ,"dominant-baseline": "middle"
                ,"font-size":
                    formattingSettings
                        .yAxis
                        .fontSize
                        .value
            }
        );

        label.textContent =
            formatter.format(
                tickValue
            );

        svg.appendChild(
            label
        );
    }

    /*
     * Y-axis vertical line
     */
    const axisLine =
        createSvgElement(
            "line"
        );

    setSvgAttributes(
        axisLine
        ,{
            "x1": marginLeft
            ,"x2": marginLeft
            ,"y1": marginTop
            ,"y2":
                marginTop
                + chartHeight
            ,"stroke": "#666666"
            ,"stroke-width": 1
        }
    );

    svg.appendChild(
        axisLine
    );
}

export interface XAxisLabelOptions {
    svg: SVGSVGElement;
    x: number;
    y: number;
    text: string;
    rotation: number;
    fontSize: number;
}

export function drawXAxisLabel(
    options: XAxisLabelOptions
): void {

    const {
        svg
        ,x
        ,y
        ,text
        ,rotation
        ,fontSize
    } = options;

    const label =
        createSvgElement(
            "text"
        );

    setSvgAttributes(
        label
        ,{
            "x": x
            ,"y": y
            ,"text-anchor":
                rotation === 0
                    ? "middle"
                    : rotation > 0
                        ? "start"
                        : "end"
            ,"font-size": fontSize
            ,"transform":
                `rotate(${rotation} ${x} ${y})`
        }
    );

    label.textContent =
        text;

    svg.appendChild(
        label
    );
}