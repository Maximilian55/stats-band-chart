import powerbi from "powerbi-visuals-api";

import {
    valueFormatter
} from "powerbi-visuals-utils-formattingutils";

import {
    BandStatistics
} from "../statistics";

import {
    VisualFormattingSettingsModel
} from "../settings";

import {
    getNiceStep
} from "../utils/chartMath";

import {
    drawMarker
} from "./markerRenderer";

import {
    drawYAxis,
    drawXAxisLabel,
    drawCategorySeparator
} from "./axisRenderer";

import ITooltipService =
    powerbi.extensibility.ITooltipService;

import VisualTooltipDataItem =
    powerbi.extensibility.VisualTooltipDataItem;

export interface ChartRenderOptions {

    target: HTMLElement;

    statistics:
        BandStatistics[];

    width: number;
    height: number;

    formatString?: string;

    formattingSettings:
        VisualFormattingSettingsModel;

    tooltipService:
        ITooltipService;
}

export function renderChart(
    options:
        ChartRenderOptions
): void {
    const {
        target
        ,statistics
        ,width
        ,height
        ,formatString
        ,formattingSettings
        ,tooltipService
    } = options;

    while (
        target.firstChild
    ) {
        target.removeChild(
            target.firstChild
        );
    }

    const svgNamespace =
        "http://www.w3.org/2000/svg";

    const svg =
        document.createElementNS(
            svgNamespace
            ,"svg"
        );

    svg.setAttribute(
        "width"
        ,width.toString()
    );

    svg.setAttribute(
        "height"
        ,height.toString()
    );

    target.appendChild(svg);

    /*
        * Margins
        *
        * Left margin is larger now because
        * the Y-axis needs room for labels.
        */
    const margin = {
        top: 20
        ,right: 20
        ,bottom: 80
        ,left: 80
    };

    const chartWidth =
        width -
        margin.left -
        margin.right;

    const chartHeight =
        height -
        margin.top -
        margin.bottom;

    if (
        chartWidth <= 0 ||
        chartHeight <= 0
    ) {
        return;
    }

    /*
        * Formatter based on the Power BI
        * measure's format string.
        */
    const formatter =
        valueFormatter.create({
            format: formatString
        });

    /*
        * Determine overall Y-axis range.
        */
    const overallMin =
        Math.min(
            ...statistics.map(
                stat => stat.min
            )
        );

    const overallMax =
        Math.max(
            ...statistics.map(
                stat => stat.max
            )
        );

    const majorStep =
        getNiceStep(
            overallMin
            ,overallMax
            ,5
        );

    let yMin =
        Math.floor(
            overallMin / majorStep
        ) * majorStep;

    let yMax =
        Math.ceil(
            overallMax / majorStep
        ) * majorStep;
    
    if (yMin === yMax) {
        yMin -= majorStep;
        yMax += majorStep;
    }

    const yScale = (
        value: number
    ): number => {

        const ratio =
            (value - yMin) /
            (yMax - yMin);

        return (
            margin.top +
            chartHeight -
            ratio * chartHeight
        );
    };

    drawYAxis({
        svg
        ,width
        ,marginLeft:
            margin.left
        ,marginRight:
            margin.right
        ,marginTop:
            margin.top
        ,chartHeight
        ,yMin
        ,yMax
        ,majorStep
        ,yScale
        ,formatter
        ,formattingSettings:
            formattingSettings
    });


    /*
        * Equal X spacing.
        */
    const xSpacing =
        chartWidth /
        statistics.length;

    if (
        formattingSettings
            .xAxis
            .gridlines
            .value
    ) {
        for (
            let i = 1;
            i < statistics.length;
            i++
        ) {
            const separatorX =
                margin.left +
                xSpacing * i;

            drawCategorySeparator(
                svg
                ,separatorX
                ,margin.top
                ,margin.top + chartHeight
                ,formattingSettings
                    .xAxis
                    .angledGridlines
                    .value
            );
        }


    }



    /*
        * Formatting values.
        */
    const lineColor =
        formattingSettings
            .line
            .lineColor
            .value
            .value;

    const lineThickness =
        formattingSettings
            .line
            .lineThickness
            .value;

    const pointSize =
        formattingSettings
            .points
            .pointSize
            .value;

    const minMaxColor =
        formattingSettings
            .minMax
            .color
            .value
            .value;

    const minMaxShape =
        String(
            formattingSettings
                .minMax
                .shape
                .value
                .value
        );

    const p5p95Color =
        formattingSettings
            .p5p95
            .color
            .value
            .value;

    const p5p95Shape =
        String(
            formattingSettings
                .p5p95
                .shape
                .value
                .value
        );

    const p33p67Color =
        formattingSettings
            .p33p67
            .color
            .value
            .value;

    const p33p67Shape =
        String(
            formattingSettings
                .p33p67
                .shape
                .value
                .value
        );

    const medianColor =
        formattingSettings
            .median
            .color
            .value
            .value;

    const medianShape =
        String(
            formattingSettings
                .median
                .shape
                .value
                .value
        );

    const averageColor =
        formattingSettings
            .average
            .color
            .value
            .value;

    const averageShape =
        String(
            formattingSettings
                .average
                .shape
                .value
                .value
        );

    const xAxisFontSize =
        formattingSettings
            .xAxis
            .fontSize
            .value;

    const xAxisRotation =
        formattingSettings
            .xAxis
            .labelRotation
            .value;

    /*
        * Draw categories.
        */
    for (
        let i = 0;
        i < statistics.length;
        i++
    ) {

        const stat =
            statistics[i];

        const categoryName =
            stat.xValues.join(
                " > "
            );

        const x =
            margin.left +
            xSpacing * i +
            xSpacing / 2;

        /*
            * Min-to-max line.
            */
        const line =
            document.createElementNS(
                svgNamespace
                ,"line"
            );

        line.setAttribute(
            "x1",
            x.toString()
        );

        line.setAttribute(
            "x2",
            x.toString()
        );

        line.setAttribute(
            "y1",
            yScale(
                stat.max
            ).toString()
        );

        line.setAttribute(
            "y2",
            yScale(
                stat.min
            ).toString()
        );

        line.setAttribute(
            "stroke",
            lineColor
        );

        line.setAttribute(
            "stroke-width",
            lineThickness.toString()
        );

        svg.appendChild(
            line
        );

        const lineHitTarget =
            document.createElementNS(
                svgNamespace
                ,"line"
            );

        lineHitTarget.setAttribute(
            "x1"
            ,x.toString()
        );

        lineHitTarget.setAttribute(
            "x2"
            ,x.toString()
        );

        lineHitTarget.setAttribute(
            "y1"
            ,yScale(stat.max).toString()
        );

        lineHitTarget.setAttribute(
            "y2"
            ,yScale(stat.min).toString()
        );

        lineHitTarget.setAttribute(
            "stroke"
            ,"transparent"
        );

        lineHitTarget.setAttribute(
            "stroke-width"
            ,"20"
        );

        lineHitTarget.setAttribute(
            "pointer-events"
            ,"stroke"
        );

        lineHitTarget.setAttribute(
            "cursor"
            ,"default"
        );

        lineHitTarget.addEventListener(
            "mousemove"
            ,(event: MouseEvent) => {
                if (
                    !tooltipService.enabled()
                ) {
                    return;
                }

                const tooltipData:
                    VisualTooltipDataItem[] = [
                        {
                            displayName: "Category"
                            ,value: categoryName
                        }
                        ,{
                            displayName: "Min"
                            ,value: formatter.format(
                                stat.min
                            )
                        }
                        ,{
                            displayName: "P05"
                            ,value: formatter.format(
                                stat.p05
                            )
                        }
                        ,{
                            displayName: "P33"
                            ,value: formatter.format(
                                stat.p33
                            )
                        }
                        ,{
                            displayName: "P50"
                            ,value: formatter.format(
                                stat.p50
                            )
                        }
                        ,{
                            displayName: "Average"
                            ,value: formatter.format(
                                stat.average
                            )
                        }
                        ,{
                            displayName: "P67"
                            ,value: formatter.format(
                                stat.p67
                            )
                        }
                        ,{
                            displayName: "P95"
                            ,value: formatter.format(
                                stat.p95
                            )
                        }
                        ,{
                            displayName: "Max"
                            ,value: formatter.format(
                                stat.max
                            )
                        }
                    ];

                tooltipService.show({
                    coordinates: [
                        event.clientX
                        ,event.clientY
                    ]
                    ,isTouchEvent: false
                    ,dataItems: tooltipData
                    ,identities: []
                });
            }
        );

        lineHitTarget.addEventListener(
            "mouseout"
            ,() => {
                if (
                    !tooltipService.enabled()
                ) {
                    return;
                }
                tooltipService.hide({
                    isTouchEvent: false
                    ,immediately: true
                });
            }
        );

        svg.appendChild(
            lineHitTarget
        );

        /*
            * Min
            */
        drawMarker(
            svg
            ,x
            ,yScale(stat.min)
            ,pointSize
            ,minMaxColor
            ,minMaxShape
            ,categoryName
            ,"Min"
            ,stat.min
            ,formatter
            ,tooltipService
        );

        /*
            * Max
            */
        drawMarker(
            svg
            ,x
            ,yScale(stat.max)
            ,pointSize
            ,minMaxColor
            ,minMaxShape
            ,categoryName
            ,"Max"
            ,stat.max
            ,formatter
            ,tooltipService
        );

        /*
            * P5 - inverted
            */
        drawMarker(
            svg
            ,x
            ,yScale(stat.p05)
            ,pointSize
            ,p5p95Color
            ,p5p95Shape
            ,categoryName
            ,"P5"
            ,stat.p05
            ,formatter
            ,tooltipService
            ,true
        );

        /*
            * P95
            */
        drawMarker(
            svg
            ,x
            ,yScale(stat.p95)
            ,pointSize
            ,p5p95Color
            ,p5p95Shape
            ,categoryName
            ,"P95"
            ,stat.p95
            ,formatter
            ,tooltipService
        );

        /*
            * P33 - inverted
            */
        drawMarker(
            svg
            ,x
            ,yScale(stat.p33)
            ,pointSize
            ,p33p67Color
            ,p33p67Shape
            ,categoryName
            ,"P33"
            ,stat.p33
            ,formatter
            ,tooltipService
            ,true
        );

        /*
            * P67
            */
        drawMarker(
            svg
            ,x
            ,yScale(stat.p67)
            ,pointSize
            ,p33p67Color
            ,p33p67Shape
            ,categoryName
            ,"P67"
            ,stat.p67
            ,formatter
            ,tooltipService
        );

        /*
            * Median
            */
        drawMarker(
            svg
            ,x
            ,yScale(stat.p50)
            ,pointSize
            ,medianColor
            ,medianShape
            ,categoryName
            ,"Median"
            ,stat.p50
            ,formatter
            ,tooltipService
        );

        /*
            * Average
            */
        drawMarker(
            svg
            ,x
            ,yScale(stat.average)
            ,pointSize
            ,averageColor
            ,averageShape
            ,categoryName
            ,"Average"
            ,stat.average
            ,formatter
            ,tooltipService
        );

        /*
            * X-axis label.
            */
        const labelY =
            margin.top +
            chartHeight +
            20;

        drawXAxisLabel({
            svg
            ,x
            ,y: labelY
            ,text: categoryName
            ,rotation: xAxisRotation
            ,fontSize: xAxisFontSize
        });
    }
}