import powerbi from "powerbi-visuals-api";

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
    createValueFormatters
} from "../formatting/valueFormatting";

import {
    drawMarker
    ,MarkerStyle
} from "./markerRenderer";

import {
    drawYAxis,
    drawXAxisLabel,
    drawCategorySeparator
} from "./axisRenderer";

import {
    attachBandTooltip
} from "./tooltipRenderer";

import {
    drawLegend    
} from "./legendRenderer";

import ITooltipService =
    powerbi.extensibility.ITooltipService;

import ISelectionManager =
    powerbi.extensibility.ISelectionManager;

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

    selectionManager:
        ISelectionManager;
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
        ,selectionManager
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

    svg.addEventListener(
        "click",
        () => {

            selectionManager.clear();
        }
    );

    /*
        * Margins
        *
        * Left margin is larger now because
        * the Y-axis needs room for labels.
        */

    const showLegend =
        formattingSettings
            .legend
            .show
            .value;

    const margin = {
        top: 20
        ,right: 20
        ,bottom:
            showLegend
                ? 110
                : 80
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
    const formatters =
        createValueFormatters(
            formatString
        );
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
        ,formatter:
            formatters.axis
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

    const minMaxStyle:
        MarkerStyle = {
            fillColor:
                formattingSettings
                    .minMax
                    .color
                    .value
                    .value
            ,fillTransparency:
                formattingSettings
                    .minMax
                    .fillTransparency
                    .value
            ,borderColor:
                formattingSettings
                    .minMax
                    .borderColor
                    .value
                    .value
            ,borderTransparency:
                formattingSettings
                    .minMax
                    .borderTransparency
                    .value
            ,borderWidth:
                formattingSettings
                    .minMax
                    .borderWidth
                    .value
            ,shape:
                String(
                    formattingSettings
                        .minMax
                        .shape
                        .value
                        .value
                )
        };

    const p5p95Style:
        MarkerStyle = {
            fillColor:
                formattingSettings
                    .p5p95
                    .color
                    .value
                    .value
            ,fillTransparency:
                formattingSettings
                    .p5p95
                    .fillTransparency
                    .value
            ,borderColor:
                formattingSettings
                    .p5p95
                    .borderColor
                    .value
                    .value
            ,borderTransparency:
                formattingSettings
                    .p5p95
                    .borderTransparency
                    .value
            ,borderWidth:
                formattingSettings
                    .p5p95
                    .borderWidth
                    .value
            ,shape:
                String(
                    formattingSettings
                        .p5p95
                        .shape
                        .value
                        .value
                )
        };

    const p33p67Style:
        MarkerStyle = {
            fillColor:
                formattingSettings
                    .p33p67
                    .color
                    .value
                    .value
            ,fillTransparency:
                formattingSettings
                    .p33p67
                    .fillTransparency
                    .value
            ,borderColor:
                formattingSettings
                    .p33p67
                    .borderColor
                    .value
                    .value
            ,borderTransparency:
                formattingSettings
                    .p33p67
                    .borderTransparency
                    .value
            ,borderWidth:
                formattingSettings
                    .p33p67
                    .borderWidth
                    .value
            ,shape:
                String(
                    formattingSettings
                        .p33p67
                        .shape
                        .value
                        .value
                )
        };

    const medianStyle:
        MarkerStyle = {
            fillColor:
                formattingSettings
                    .median
                    .color
                    .value
                    .value
            ,fillTransparency:
                formattingSettings
                    .median
                    .fillTransparency
                    .value
            ,borderColor:
                formattingSettings
                    .median
                    .borderColor
                    .value
                    .value
            ,borderTransparency:
                formattingSettings
                    .median
                    .borderTransparency
                    .value
            ,borderWidth:
                formattingSettings
                    .median
                    .borderWidth
                    .value
            ,shape:
                String(
                    formattingSettings
                        .median
                        .shape
                        .value
                        .value
                )
        };

    const averageStyle:
        MarkerStyle = {
            fillColor:
                formattingSettings
                    .average
                    .color
                    .value
                    .value
            ,fillTransparency:
                formattingSettings
                    .average
                    .fillTransparency
                    .value
            ,borderColor:
                formattingSettings
                    .average
                    .borderColor
                    .value
                    .value
            ,borderTransparency:
                formattingSettings
                    .average
                    .borderTransparency
                    .value
            ,borderWidth:
                formattingSettings
                    .average
                    .borderWidth
                    .value
            ,shape:
                String(
                    formattingSettings
                        .average
                        .shape
                        .value
                        .value
                )
        };

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

    if (showLegend) {
        drawLegend({
            svg
            ,items: [
                {
                    label: "Min / Max"
                    ,style: minMaxStyle
                }
                ,{
                    label: "P05 / P95"
                    ,style: p5p95Style
                }
                ,{
                    label: "P33 / P67"
                    ,style: p33p67Style
                }
                ,{
                    label: "P50"
                    ,style: medianStyle
                }
                ,{
                    label: "Average"
                    ,style: averageStyle
                }
            ]
            ,width
            ,y: height - 30
            ,fontSize:
                formattingSettings
                    .legend
                    .fontSize
                    .value
            ,bold:
                formattingSettings
                    .legend
                    .bold
                    .value
        });
    }
    

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
            ,"pointer"
        );

        attachBandTooltip(
            lineHitTarget
            ,tooltipService
            ,categoryName
            ,stat
            ,formatters.tooltip
        );

        lineHitTarget.addEventListener(
            "click"
            ,(event:MouseEvent) => {
                event.stopPropagation();
                selectionManager.select(
                    stat.selectionIds
                    ,event.ctrlKey
                );
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
            ,minMaxStyle
            ,categoryName
            ,"Min"
            ,stat.min
            ,formatters.tooltip
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
            ,minMaxStyle
            ,categoryName
            ,"Max"
            ,stat.max
            ,formatters.tooltip
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
            ,p5p95Style
            ,categoryName
            ,"P5"
            ,stat.p05
            ,formatters.tooltip
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
            ,p5p95Style
            ,categoryName
            ,"P95"
            ,stat.p95
            ,formatters.tooltip
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
            ,p33p67Style
            ,categoryName
            ,"P33"
            ,stat.p33
            ,formatters.tooltip
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
            ,p33p67Style
            ,categoryName
            ,"P67"
            ,stat.p67
            ,formatters.tooltip
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
            ,medianStyle
            ,categoryName
            ,"Median"
            ,stat.p50
            ,formatters.tooltip
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
            ,averageStyle
            ,categoryName
            ,"Average"
            ,stat.average
            ,formatters.tooltip
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