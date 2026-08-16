import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import {
    VisualFormattingSettingsModel
} from "../settings";

export function drawCategorySeparator(
    svg: SVGSVGElement
    ,x: number
    ,top: number
    ,bottom: number
    ,angled: boolean
): void {
    const svgNamespace =
        "http://www.w3.org/2000/svg";

    const path =
        document.createElementNS(
            svgNamespace
            ,"path"
        );
    
    let pathData =
        `M ${x} ${top} ` +
        `L ${x} ${bottom}`;

    if (angled) {
        
        const extension =
            18;

        pathData +=
            ` L ${x + extension} ${bottom + extension}`
    }

    path.setAttribute(
        "d"
        ,pathData
    );

    path.setAttribute(
        "fill"
        ,"none"
    );

    path.setAttribute(
        "stroke"
        ,"#D9D9D9"
    );

    path.setAttribute(
        "stroke-width"
        ,"1"
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

    formatter:
        valueFormatter.IValueFormatter;

    formattingSettings:
        VisualFormattingSettingsModel;
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

    const svgNamespace =
        "http://www.w3.org/2000/svg";

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
                document.createElementNS(
                    svgNamespace
                    ,"line"
                );

            gridline.setAttribute(
                "x1"
                ,marginLeft.toString()
            );

            gridline.setAttribute(
                "x2"
                ,(
                    width -
                    marginRight
                ).toString()
            );

            gridline.setAttribute(
                "y1"
                ,y.toString()
            );

            gridline.setAttribute(
                "y2"
                ,y.toString()
            );

            gridline.setAttribute(
                "stroke"
                ,"#D9D9D9"
            );

            gridline.setAttribute(
                "stroke-width"
                ,"1"
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
                    document.createElementNS(
                        svgNamespace
                        ,"line"
                    );

                minorLine.setAttribute(
                    "x1"
                    ,marginLeft.toString()
                );

                minorLine.setAttribute(
                    "x2"
                    ,(
                        width -
                        marginRight
                    ).toString()
                );

                minorLine.setAttribute(
                    "y1"
                    ,minorY.toString()
                );

                minorLine.setAttribute(
                    "y2"
                    ,minorY.toString()
                );

                minorLine.setAttribute(
                    "stroke"
                    ,"#EEEEEE"
                );

                minorLine.setAttribute(
                    "stroke-width"
                    ,"1"
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
            document.createElementNS(
                svgNamespace
                ,"line"
            );

        tick.setAttribute(
            "x1"
            ,(
                marginLeft - 5
            ).toString()
        );

        tick.setAttribute(
            "x2"
            ,marginLeft.toString()
        );

        tick.setAttribute(
            "y1"
            ,y.toString()
        );

        tick.setAttribute(
            "y2"
            ,y.toString()
        );

        tick.setAttribute(
            "stroke"
            ,"#666666"
        );

        tick.setAttribute(
            "stroke-width"
            ,"1"
        );

        svg.appendChild(
            tick
        );

        /*
         * Tick label
         */
        const label =
            document.createElementNS(
                svgNamespace
                ,"text"
            );

        label.setAttribute(
            "x"
            ,(
                marginLeft - 10
            ).toString()
        );

        label.setAttribute(
            "y"
            ,y.toString()
        );

        label.setAttribute(
            "text-anchor"
            ,"end"
        );

        label.setAttribute(
            "dominant-baseline"
            ,"middle"
        );

        label.setAttribute(
            "font-size"
            ,formattingSettings
                .yAxis
                .fontSize
                .value
                .toString()
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
        document.createElementNS(
            svgNamespace
            ,"line"
        );

    axisLine.setAttribute(
        "x1"
        ,marginLeft.toString()
    );

    axisLine.setAttribute(
        "x2"
        ,marginLeft.toString()
    );

    axisLine.setAttribute(
        "y1"
        ,marginTop.toString()
    );

    axisLine.setAttribute(
        "y2"
        ,(
            marginTop +
            chartHeight
        ).toString()
    );

    axisLine.setAttribute(
        "stroke"
        ,"#666666"
    );

    axisLine.setAttribute(
        "stroke-width"
        ,"1"
    );

    svg.appendChild(
        axisLine
    );
}