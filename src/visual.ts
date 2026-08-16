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
import { calculateBandStatistics, BandStatistics } from "./statistics";
import { VisualFormattingSettingsModel } from "./settings";

import VisualConstructorOptions =
    powerbi.extensibility.visual.VisualConstructorOptions;

import VisualUpdateOptions =
    powerbi.extensibility.visual.VisualUpdateOptions;

import IVisual =
    powerbi.extensibility.visual.IVisual;

import IVisualEventService =
    powerbi.extensibility.IVisualEventService;

export class Visual implements IVisual {

    private events: IVisualEventService;
    private target: HTMLElement;

    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
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
                this.formattingSettingsService.populateFormattingSettingsModel(
                    VisualFormattingSettingsModel,
                    dataView
                );

            const data = transformData(dataView);

            if (!data) {
                this.showMessage(
                    "Add at least one X Axis field, one Grain field, and one Measure."
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
            width - margin.left - margin.right;

        const chartHeight =
            height - margin.top - margin.bottom;

        if (
            chartWidth <= 0 ||
            chartHeight <= 0
        ) {
            return;
        }

        /*
         * Overall Y-axis range.
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

        /*
         * Give the chart a small amount
         * of vertical padding.
         */

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
         * Equal spacing for each X-axis group.
         */

        const xSpacing =
            chartWidth /
            statistics.length;

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
                "black"
            );

            line.setAttribute(
                "stroke-width",
                "2"
            );

            svg.appendChild(line);

            /*
             * Statistic points.
             */

            const points = [
                stat.min,
                stat.p05,
                stat.p33,
                stat.p50,
                stat.average,
                stat.p67,
                stat.p95,
                stat.max
            ];

            for (const value of points) {

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
                    yScale(value).toString()
                );

                circle.setAttribute(
                    "r",
                    "4"
                );

                circle.setAttribute(
                    "fill",
                    "black"
                );

                svg.appendChild(circle);
            }

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
            document.createElement("div");

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