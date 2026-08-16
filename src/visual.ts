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
    calculateBandStatistics
} from "./statistics";

import {
    VisualFormattingSettingsModel
} from "./settings";

import {
    renderChart
} from "./rendering/chartRenderer";

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

            renderChart({
                target:
                    this.target
                ,statistics
                ,width:
                    options.viewport.width
                ,height:
                    options.viewport.height
                ,formatString:
                    data.measureColumn.format
                ,formattingSettings:
                    this.formattingSettings
                ,tooltipService:
                    this.tooltipService
            });

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