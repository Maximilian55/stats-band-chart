/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*/

"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import "./../style/visual.less";

import { transformData } from "./dataTransform";
import {
    calculateBandStatistics,
    BandStatistics
} from "./statistics";

import {
    VisualFormattingSettingsModel
} from "./settings";

import VisualConstructorOptions =
    powerbi.extensibility.visual.VisualConstructorOptions;

import VisualUpdateOptions =
    powerbi.extensibility.visual.VisualUpdateOptions;

import IVisual =
    powerbi.extensibility.visual.IVisual;

import IVisualHost =
    powerbi.extensibility.visual.IVisualHost;

import IVisualEventService =
    powerbi.extensibility.IVisualEventService;

import ITooltipService =
    powerbi.extensibility.ITooltipService;

import VisualTooltipDataItem =
    powerbi.extensibility.VisualTooltipDataItem;

import DataView =
    powerbi.DataView;

export class Visual implements IVisual {

    private host: IVisualHost;
    private events: IVisualEventService;
    private tooltipService: ITooltipService;
    private target: HTMLElement;

    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {

        this.host = options.host;
        this.events = options.host.eventService;
        this.tooltipService = options.host.tooltipService;
        this.target = options.element;

        this.formattingSettingsService =
            new FormattingSettingsService();
    }

    public update(options: VisualUpdateOptions): void {

        this.events.renderingStarted(options);

        try {

            const dataView = options.dataViews?.[0];

            if (!dataView) {
                this.clearTarget();
                this.events.renderingFinished(options);
                return;
            }

            this.formattingSettings =
                this.formattingSettingsService
                    .populateFormattingSettingsModel(
                        VisualFormattingSettingsModel,
                        dataView
                    );

            this.applyThemeDefaults(dataView);

            /*
             * Clamp numeric formatting values.
             */

            this.formattingSettings.line.lineThickness.value =
                Math.max(
                    1
                    ,Math.min(
                        10
                        ,this.formattingSettings
                            .line
                            .lineThickness
                            .value
                    )
                );

            this.formattingSettings.points.pointSize.value =
                Math.max(
                    1
                    ,Math.min(
                        20
                        ,this.formattingSettings
                            .points
                            .pointSize
                            .value
                    )
                );

            this.formattingSettings.xAxis.fontSize.value =
                Math.max(
                    6
                    ,Math.min(
                        40
                        ,this.formattingSettings
                            .xAxis
                            .fontSize
                            .value
                    )
                );

            this.formattingSettings.xAxis.labelRotation.value =
                Math.max(
                    -90
                    ,Math.min(
                        90
                        ,this.formattingSettings
                            .xAxis
                            .labelRotation
                            .value
                    )
                );

            this.formattingSettings.yAxis.fontSize.value =
                Math.max(
                    6
                    ,Math.min(
                        40
                        ,this.formattingSettings
                            .yAxis
                            .fontSize
                            .value
                    )
                );

            const data =
                transformData(dataView);

            if (!data) {

                this.showMessage(
                    "Add at least one X Axis field, " +
                    "one Grain field, and one Measure."
                );

                this.events.renderingFinished(options);
                return;
            }

            const statistics =
                calculateBandStatistics(data);

            if (statistics.length === 0) {

                this.showMessage(
                    "No valid numeric observations were returned."
                );

                this.events.renderingFinished(options);
                return;
            }

            this.renderChart(
                statistics
                ,options.viewport.width
                ,options.viewport.height
                ,data.measureColumn.format
            );

            this.events.renderingFinished(options);
        }
        catch (error) {

            console.error(
                "Error in update method"
                ,error
            );

            this.showMessage(
                "Unable to render visual."
            );

            this.events.renderingFailed(
                options
                ,String(error)
            );
        }
    }

    /**
     * Apply colors from the current Power BI theme
     * unless the user has explicitly formatted
     * that property.
     */
    private applyThemeDefaults(
        dataView: DataView
    ): void {

        const palette =
            this.host.colorPalette;

        const lineColor =
            palette.getColor(
                "StatsBandChart.Line"
            ).value;

        const minMaxColor =
            palette.getColor(
                "StatsBandChart.MinMax"
            ).value;

        const p5p95Color =
            palette.getColor(
                "StatsBandChart.P5P95"
            ).value;

        const p33p67Color =
            palette.getColor(
                "StatsBandChart.P33P67"
            ).value;

        const medianColor =
            palette.getColor(
                "StatsBandChart.Median"
            ).value;

        const averageColor =
            palette.getColor(
                "StatsBandChart.Average"
            ).value;

        if (
            !this.hasFormattingProperty(
                dataView
                ,"line"
                ,"lineColor"
            )
        ) {
            this.formattingSettings
                .line
                .lineColor
                .value = {
                    value: lineColor
                };
        }

        if (
            !this.hasFormattingProperty(
                dataView
                ,"minMax"
                ,"color"
            )
        ) {
            this.formattingSettings
                .minMax
                .color
                .value = {
                    value: minMaxColor
                };
        }

        if (
            !this.hasFormattingProperty(
                dataView
                ,"p5p95"
                ,"color"
            )
        ) {
            this.formattingSettings
                .p5p95
                .color
                .value = {
                    value: p5p95Color
                };
        }

        if (
            !this.hasFormattingProperty(
                dataView
                ,"p33p67"
                ,"color"
            )
        ) {
            this.formattingSettings
                .p33p67
                .color
                .value = {
                    value: p33p67Color
                };
        }

        if (
            !this.hasFormattingProperty(
                dataView
                ,"median"
                ,"color"
            )
        ) {
            this.formattingSettings
                .median
                .color
                .value = {
                    value: medianColor
                };
        }

        if (
            !this.hasFormattingProperty(
                dataView
                ,"average"
                ,"color"
            )
        ) {
            this.formattingSettings
                .average
                .color
                .value = {
                    value: averageColor
                };
        }
    }

    private hasFormattingProperty(
        dataView: DataView
        ,objectName: string
        ,propertyName: string
    ): boolean {

        const object =
            dataView.metadata.objects?.[
                objectName
            ];

        if (!object) {
            return false;
        }

        return Object.prototype
            .hasOwnProperty.call(
                object
                ,propertyName
            );
    }


    private getNiceStep(
        min: number
        ,max: number
        ,targetTickCounter: number
    ): number {

            const range =
                Math.abs(max - min)
            
            if (range === 0) {
                return 1;
            }

            const roughStep =
                range / targetTickCounter
            
            const magnitude =
                Math.pow(
                    10
                    ,Math.floor(
                        Math.log10(
                            roughStep
                        )
                    )
                );
            
            const normalized =
                roughStep / magnitude;

            let niceNormalized: number;
            
            if (normalized <= 1) {
                niceNormalized = 1;
            }

            else if (normalized <= 2) {
                niceNormalized = 2;
            }

            else if (normalized <= 5) {
                niceNormalized = 5;
            }

            else {
                niceNormalized = 10;
            }

            return (
                niceNormalized * magnitude
            );

    }

    private drawCategorySeparator(
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


    private renderChart(
        statistics: BandStatistics[]
        ,width: number
        ,height: number
        ,formatString?: string
    ): void {

        this.clearTarget();

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

        this.target.appendChild(svg);

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
            this.getNiceStep(
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

        /*
         * Y axis and gridlines.
         */
        if (
            this.formattingSettings
                .yAxis
                .show
                .value
        ) {

            for (
                let tickValue = yMin;
                tickValue <= yMax + majorStep * 0.001;
                tickValue += majorStep
            ) {
                const y =
                    yScale(
                        tickValue
                    );

                /*
                 * Gridline
                 */
                if (
                    this.formattingSettings
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
                        ,margin.left.toString()
                    );

                    gridline.setAttribute(
                        "x2"
                        ,(
                            width -
                            margin.right
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

                if (
                    this.formattingSettings
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
                            ,margin.left.toString()
                        );

                        minorLine.setAttribute(
                            "x2"
                            ,(
                                width - margin.right
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
                        margin.left - 5
                    ).toString()
                );

                tick.setAttribute(
                    "x2"
                    ,margin.left.toString()
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
                 * Y-axis tick label
                 */
                const label =
                    document.createElementNS(
                        svgNamespace
                        ,"text"
                    );

                label.setAttribute(
                    "x"
                    ,(
                        margin.left - 10
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
                    ,this.formattingSettings
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
                ,margin.left.toString()
            );

            axisLine.setAttribute(
                "x2"
                ,margin.left.toString()
            );

            axisLine.setAttribute(
                "y1"
                ,margin.top.toString()
            );

            axisLine.setAttribute(
                "y2"
                ,(
                    margin.top +
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

        /*
         * Equal X spacing.
         */
        const xSpacing =
            chartWidth /
            statistics.length;

        if (
            this.formattingSettings
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

                this.drawCategorySeparator(
                    svg
                    ,separatorX
                    ,margin.top
                    ,margin.top + chartHeight
                    ,this.formattingSettings
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
            this.formattingSettings
                .line
                .lineColor
                .value
                .value;

        const lineThickness =
            this.formattingSettings
                .line
                .lineThickness
                .value;

        const pointSize =
            this.formattingSettings
                .points
                .pointSize
                .value;

        const minMaxColor =
            this.formattingSettings
                .minMax
                .color
                .value
                .value;

        const minMaxShape =
            String(
                this.formattingSettings
                    .minMax
                    .shape
                    .value
                    .value
            );

        const p5p95Color =
            this.formattingSettings
                .p5p95
                .color
                .value
                .value;

        const p5p95Shape =
            String(
                this.formattingSettings
                    .p5p95
                    .shape
                    .value
                    .value
            );

        const p33p67Color =
            this.formattingSettings
                .p33p67
                .color
                .value
                .value;

        const p33p67Shape =
            String(
                this.formattingSettings
                    .p33p67
                    .shape
                    .value
                    .value
            );

        const medianColor =
            this.formattingSettings
                .median
                .color
                .value
                .value;

        const medianShape =
            String(
                this.formattingSettings
                    .median
                    .shape
                    .value
                    .value
            );

        const averageColor =
            this.formattingSettings
                .average
                .color
                .value
                .value;

        const averageShape =
            String(
                this.formattingSettings
                    .average
                    .shape
                    .value
                    .value
            );

        const xAxisFontSize =
            this.formattingSettings
                .xAxis
                .fontSize
                .value;

        const xAxisRotation =
            this.formattingSettings
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
                        !this.tooltipService.enabled()
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

                    this.tooltipService.show({
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
                        !this.tooltipService.enabled()
                    ) {
                        return;
                    }
                    this.tooltipService.hide({
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
            this.drawMarker(
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
            );

            /*
             * Max
             */
            this.drawMarker(
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
            );

            /*
             * P5 - inverted
             */
            this.drawMarker(
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
                ,true
            );

            /*
             * P95
             */
            this.drawMarker(
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
            );

            /*
             * P33 - inverted
             */
            this.drawMarker(
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
                ,true
            );

            /*
             * P67
             */
            this.drawMarker(
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
            );

            /*
             * Median
             */
            this.drawMarker(
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
            );

            /*
             * Average
             */
            this.drawMarker(
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
            );

            /*
             * X-axis label.
             */
            const labelY =
                margin.top +
                chartHeight +
                20;

            const label =
                document.createElementNS(
                    svgNamespace
                    ,"text"
                );

            label.setAttribute(
                "x"
                ,x.toString()
            );

            label.setAttribute(
                "y"
                ,labelY.toString()
            );

            label.setAttribute(
                "text-anchor"
                ,xAxisRotation === 0
                    ? "middle"
                    : xAxisRotation > 0
                        ? "start"
                        : "end"
            );

            label.setAttribute(
                "font-size"
                ,xAxisFontSize.toString()
            );

            label.setAttribute(
                "transform"
                ,`rotate(${xAxisRotation} ${x} ${labelY})`
            );

            label.textContent =
                categoryName;

            svg.appendChild(
                label
            );
        }
    }

    /**
     * Draw one statistical marker and attach
     * a native Power BI tooltip.
     */
    private drawMarker(
        svg: SVGSVGElement
        ,x: number
        ,y: number
        ,size: number
        ,color: string
        ,shape: string
        ,categoryName: string
        ,statisticName: string
        ,value: number
        ,formatter: valueFormatter.IValueFormatter
        ,inverted: boolean = false
    ): void {

        const svgNamespace =
            "http://www.w3.org/2000/svg";

        let marker: SVGElement;

        const hitTarget =
            document.createElementNS(
                svgNamespace
                ,"circle"
            );

        hitTarget.setAttribute(
            "cx"
            ,x.toString()
        );

        hitTarget.setAttribute(
            "cy"
            ,y.toString()
        );

        hitTarget.setAttribute(
            "r"
            ,Math.max(
                size * 2
                ,20
            ).toString()
        );

        hitTarget.setAttribute(
            "fill"
            ,"transparent"
        );

        hitTarget.setAttribute(
            "pointer-events"
            ,"all"
        );

        /*
         * Square
         */
        if (shape === "square") {

            const square =
                document.createElementNS(
                    svgNamespace
                    ,"rect"
                );

            square.setAttribute(
                "x"
                ,(
                    x - size
                ).toString()
            );

            square.setAttribute(
                "y"
                ,(
                    y - size
                ).toString()
            );

            square.setAttribute(
                "width"
                ,(
                    size * 2
                ).toString()
            );

            square.setAttribute(
                "height"
                ,(
                    size * 2
                ).toString()
            );

            square.setAttribute(
                "fill"
                ,color
            );

            marker = square;
        }

        /*
         * Diamond
         */
        else if (
            shape === "diamond"
        ) {

            const diamond =
                document.createElementNS(
                    svgNamespace
                    ,"polygon"
                );

            const points = [
                `${x},${y - size}`
                ,`${x + size},${y}`
                ,`${x},${y + size}`
                ,`${x - size},${y}`
            ].join(" ");

            diamond.setAttribute(
                "points"
                ,points
            );

            diamond.setAttribute(
                "fill"
                ,color
            );

            marker = diamond;
        }

        /*
         * Triangle
         */
        else if (
            shape === "triangle"
        ) {

            const triangle =
                document.createElementNS(
                    svgNamespace
                    ,"polygon"
                );

            const points = [
                `${x},${y - size}`
                ,`${x + size},${y + size}`
                ,`${x - size},${y + size}`
            ].join(" ");

            triangle.setAttribute(
                "points"
                ,points
            );

            triangle.setAttribute(
                "fill"
                ,color
            );

            marker = triangle;
        }

        /*
         * Default: Circle
         */
        else {

            const circle =
                document.createElementNS(
                    svgNamespace
                    ,"circle"
                );

            circle.setAttribute(
                "cx"
                ,x.toString()
            );

            circle.setAttribute(
                "cy"
                ,y.toString()
            );

            circle.setAttribute(
                "r"
                ,size.toString()
            );

            circle.setAttribute(
                "fill"
                ,color
            );

            marker = circle;
        }

        /*
         * Invert P5 and P33.
         */
        if (inverted) {

            marker.setAttribute(
                "transform"
                ,`rotate(180 ${x} ${y})`
            );
        }

        /*
         * Make cursor behavior feel interactive.
         */
        hitTarget.setAttribute(
            "cursor"
            ,"default"
        );

        /*
         * Native Power BI tooltip.
         */
        hitTarget.addEventListener(
            "mousemove"
            ,(
                event: MouseEvent
            ) => {

                if (
                    !this.tooltipService.enabled()
                ) {
                    return;
                }

                const tooltipData:
                    VisualTooltipDataItem[] = [
                        {
                            displayName:
                                "Category"
                            ,value:
                                categoryName
                        }
                        ,{
                            displayName:
                                statisticName
                            ,value:
                                formatter.format(
                                    value
                                )
                        }
                    ];

                this.tooltipService.show({
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

        hitTarget.addEventListener(
            "mouseout"
            ,() => {

                if (
                    !this.tooltipService.enabled()
                ) {
                    return;
                }

                this.tooltipService.hide({
                    isTouchEvent: false
                    ,immediately: true
                });
            }
        );

        svg.appendChild(
            marker
        );

        svg.appendChild(
            hitTarget
        );
    }

    private clearTarget(): void {

        while (
            this.target.firstChild
        ) {

            this.target.removeChild(
                this.target.firstChild
            );
        }
    }

    private showMessage(
        message: string
    ): void {

        this.clearTarget();

        const element =
            document.createElement(
                "div"
            );

        element.className =
            "bandChartMessage";

        element.textContent =
            message;

        this.target.appendChild(
            element
        );
    }

    public getFormattingModel():
        powerbi.visuals.FormattingModel {

        return this
            .formattingSettingsService
            .buildFormattingModel(
                this.formattingSettings
            );
    }
}