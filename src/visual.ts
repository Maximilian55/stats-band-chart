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

import DataView =
    powerbi.DataView;

export class Visual implements IVisual {

    private host: IVisualHost;
    private events: IVisualEventService;
    private target: HTMLElement;

    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {

        this.host = options.host;
        this.events = options.host.eventService;
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
             * Keep numeric formatting values
             * within reasonable limits.
             */
            this.formattingSettings.line.lineThickness.value =
                Math.max(
                    1,
                    Math.min(
                        10,
                        this.formattingSettings.line.lineThickness.value
                    )
                );

            this.formattingSettings.points.pointSize.value =
                Math.max(
                    1,
                    Math.min(
                        20,
                        this.formattingSettings.points.pointSize.value
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
                statistics,
                options.viewport.width,
                options.viewport.height
            );

            this.events.renderingFinished(options);
        }
        catch (error) {

            console.error(
                "Error in update method",
                error
            );

            this.showMessage(
                "Unable to render visual."
            );

            this.events.renderingFailed(
                options,
                String(error)
            );
        }
    }

    /**
     * Apply colors from the current Power BI report theme
     * unless the user has explicitly formatted the property.
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
                dataView,
                "line",
                "lineColor"
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
                dataView,
                "minMax",
                "color"
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
                dataView,
                "p5p95",
                "color"
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
                dataView,
                "p33p67",
                "color"
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
                dataView,
                "median",
                "color"
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
                dataView,
                "average",
                "color"
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

    /**
     * Returns true when the user has explicitly
     * formatted a property.
     */
    private hasFormattingProperty(
        dataView: DataView,
        objectName: string,
        propertyName: string
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
                object,
                propertyName
            );
    }

    private renderChart(
        statistics: BandStatistics[],
        width: number,
        height: number
    ): void {

        this.clearTarget();

        const svgNamespace =
            "http://www.w3.org/2000/svg";

        const svg =
            document.createElementNS(
                svgNamespace,
                "svg"
            );

        svg.setAttribute(
            "width",
            width.toString()
        );

        svg.setAttribute(
            "height",
            height.toString()
        );

        this.target.appendChild(svg);

        const margin = {
            top: 20,
            right: 20,
            bottom: 50,
            left: 40
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
         * Determine overall Y range.
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

        const range =
            overallMax - overallMin;

        const padding =
            range === 0
                ? 1
                : range * 0.05;

        const yMin =
            overallMin - padding;

        const yMax =
            overallMax + padding;

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
         * Give every X-axis category
         * an equal amount of space.
         */
        const xSpacing =
            chartWidth /
            statistics.length;

        /*
         * Formatting values
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

        /*
         * Draw each category.
         */
        for (
            let i = 0;
            i < statistics.length;
            i++
        ) {

            const stat =
                statistics[i];

            const x =
                margin.left +
                xSpacing * i +
                xSpacing / 2;

            /*
             * Min-to-max line.
             */
            const line =
                document.createElementNS(
                    svgNamespace,
                    "line"
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
                yScale(stat.max).toString()
            );

            line.setAttribute(
                "y2",
                yScale(stat.min).toString()
            );

            line.setAttribute(
                "stroke",
                lineColor
            );

            line.setAttribute(
                "stroke-width",
                lineThickness.toString()
            );

            svg.appendChild(line);

            /*
             * Min / Max
             */
            this.drawMarker(
                svg,
                x,
                yScale(stat.min),
                pointSize,
                minMaxColor,
                minMaxShape
            );

            this.drawMarker(
                svg,
                x,
                yScale(stat.max),
                pointSize,
                minMaxColor,
                minMaxShape
            );

            /*
             * P5 / P95
             *
             * P5 is always inverted.
             */
            this.drawMarker(
                svg,
                x,
                yScale(stat.p05),
                pointSize,
                p5p95Color,
                p5p95Shape,
                true
            );

            this.drawMarker(
                svg,
                x,
                yScale(stat.p95),
                pointSize,
                p5p95Color,
                p5p95Shape
            );

            /*
             * P33 / P67
             *
             * P33 is always inverted.
             */
            this.drawMarker(
                svg,
                x,
                yScale(stat.p33),
                pointSize,
                p33p67Color,
                p33p67Shape,
                true
            );

            this.drawMarker(
                svg,
                x,
                yScale(stat.p67),
                pointSize,
                p33p67Color,
                p33p67Shape
            );

            /*
             * Median
             */
            this.drawMarker(
                svg,
                x,
                yScale(stat.p50),
                pointSize,
                medianColor,
                medianShape
            );

            /*
             * Average
             */
            this.drawMarker(
                svg,
                x,
                yScale(stat.average),
                pointSize,
                averageColor,
                averageShape
            );

            /*
             * X-axis category label.
             */
            const label =
                document.createElementNS(
                    svgNamespace,
                    "text"
                );

            label.setAttribute(
                "x",
                x.toString()
            );

            label.setAttribute(
                "y",
                (
                    height - 15
                ).toString()
            );

            label.setAttribute(
                "text-anchor",
                "middle"
            );

            label.setAttribute(
                "font-size",
                "12"
            );

            label.textContent =
                stat.xValues.join(" > ");

            svg.appendChild(label);
        }
    }

    /**
     * Draw a marker.
     *
     * If inverted is true, the entire marker
     * is rotated 180 degrees around its center.
     */
    private drawMarker(
        svg: SVGSVGElement,
        x: number,
        y: number,
        size: number,
        color: string,
        shape: string,
        inverted: boolean = false
    ): void {

        const svgNamespace =
            "http://www.w3.org/2000/svg";

        let marker: SVGElement;

        /*
         * Square
         */
        if (shape === "square") {

            const square =
                document.createElementNS(
                    svgNamespace,
                    "rect"
                );

            square.setAttribute(
                "x",
                (x - size).toString()
            );

            square.setAttribute(
                "y",
                (y - size).toString()
            );

            square.setAttribute(
                "width",
                (size * 2).toString()
            );

            square.setAttribute(
                "height",
                (size * 2).toString()
            );

            square.setAttribute(
                "fill",
                color
            );

            marker = square;
        }

        /*
         * Diamond
         */
        else if (shape === "diamond") {

            const diamond =
                document.createElementNS(
                    svgNamespace,
                    "polygon"
                );

            const points = [
                `${x},${y - size}`,
                `${x + size},${y}`,
                `${x},${y + size}`,
                `${x - size},${y}`
            ].join(" ");

            diamond.setAttribute(
                "points",
                points
            );

            diamond.setAttribute(
                "fill",
                color
            );

            marker = diamond;
        }

        /*
         * Triangle
         */
        else if (shape === "triangle") {

            const triangle =
                document.createElementNS(
                    svgNamespace,
                    "polygon"
                );

            const points = [
                `${x},${y - size}`,
                `${x + size},${y + size}`,
                `${x - size},${y + size}`
            ].join(" ");

            triangle.setAttribute(
                "points",
                points
            );

            triangle.setAttribute(
                "fill",
                color
            );

            marker = triangle;
        }

        /*
         * Default: Circle
         */
        else {

            const circle =
                document.createElementNS(
                    svgNamespace,
                    "circle"
                );

            circle.setAttribute(
                "cx",
                x.toString()
            );

            circle.setAttribute(
                "cy",
                y.toString()
            );

            circle.setAttribute(
                "r",
                size.toString()
            );

            circle.setAttribute(
                "fill",
                color
            );

            marker = circle;
        }

        /*
         * Always use the same inversion rule.
         *
         * P5 and P33 call this method with
         * inverted = true.
         */
        if (inverted) {

            marker.setAttribute(
                "transform",
                `rotate(180 ${x} ${y})`
            );
        }

        svg.appendChild(marker);
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