import powerbi from "powerbi-visuals-api";

import {
    BandStatistics
} from "../statistics";

import {
    VisualFormattingSettingsModel
} from "../settings";

import {
    getNiceStep
    ,estimateRotatedTextHeight
} from "../utils/chartMath";

import {
    createValueFormatters
} from "../formatting/valueFormatting";

import {
    drawMarker
    ,createMarkerStyle
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

    const longestLabel =
        statistics
            .map(
                stat =>
                    stat.xValues.join(
                        " > "
                    )
            )
            .reduce(
                (
                    longest
                    ,current
                ) =>
                    current.length
                    > longest.length
                        ? current
                        : longest
                ,""
            );

    const rotatedLabelHeight =
        estimateRotatedTextHeight(
            longestLabel
            ,xAxisFontSize
            ,xAxisRotation
        );

    const showLegend =
        formattingSettings
            .legend
            .show
            .value;

    const xLabelTopPadding =
        20;

    const xLabelBottomPadding =
        15;

    const legendHeight =
        showLegend
            ? 35
            : 0;

    const bottomMargin =
        xLabelTopPadding
        + rotatedLabelHeight
        + xLabelBottomPadding
        + legendHeight;


    const margin = {
        top: 20
        ,right: 20
        ,bottom: bottomMargin
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

    const plotBottom =
        margin.top
        + chartHeight;

    const xAxisLabelY =
        plotBottom
        + xLabelTopPadding;

    const legendY =
        xAxisLabelY
        + rotatedLabelHeight
        + xLabelBottomPadding;

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

    const minMaxStyle =
        createMarkerStyle(
            formattingSettings.minMax
        );

    const p5p95Style =
        createMarkerStyle(
            formattingSettings.p5p95
        );

    const p33p67Style =
        createMarkerStyle(
            formattingSettings.p33p67
        );

    const medianStyle =
        createMarkerStyle(
            formattingSettings.median
        );

    const averageStyle =
        createMarkerStyle(
            formattingSettings.average
        );


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
            ,y: legendY
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

        drawXAxisLabel({
            svg
            ,x
            ,y: xAxisLabelY
            ,text: categoryName
            ,rotation: xAxisRotation
            ,fontSize: xAxisFontSize
        });
    }
}