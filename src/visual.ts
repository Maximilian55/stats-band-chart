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
import { calculateBandStatistics } from "./statistics";
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

            this.clearTarget();

            const container =
                document.createElement("div");

            container.className =
                "bandChartDebug";

            /*
             * Header
             */

            this.appendDataRow(
                container,
                "X Axis",
                data.xColumns
                    .map(column => column.displayName)
                    .join(" > ")
            );

            this.appendDataRow(
                container,
                "Grain",
                data.grainColumn.displayName
            );

            this.appendDataRow(
                container,
                "Measure",
                data.measureColumn.displayName
            );

            this.appendDataRow(
                container,
                "Observation count",
                data.rows.length.toString()
            );

            this.appendDataRow(
                container,
                "Band count",
                statistics.length.toString()
            );

            /*
             * Add spacing before statistics.
             */

            const separator =
                document.createElement("hr");

            container.appendChild(separator);

            /*
             * Display statistics for each X Axis group.
             *
             * This is temporary validation output.
             * Later this section will be replaced by the
             * SVG band chart renderer.
             */

            for (const stat of statistics) {

                const group =
                    document.createElement("div");

                group.className =
                    "bandChartStatGroup";

                const title =
                    document.createElement("strong");

                title.textContent =
                    stat.xValues.join(" > ");

                group.appendChild(title);

                const values =
                    document.createElement("div");

                values.textContent =
                    `Min: ${stat.min.toFixed(2)} | ` +
                    `P5: ${stat.p05.toFixed(2)} | ` +
                    `P33: ${stat.p33.toFixed(2)} | ` +
                    `P50: ${stat.p50.toFixed(2)} | ` +
                    `Avg: ${stat.average.toFixed(2)} | ` +
                    `P67: ${stat.p67.toFixed(2)} | ` +
                    `P95: ${stat.p95.toFixed(2)} | ` +
                    `Max: ${stat.max.toFixed(2)}`;

                group.appendChild(values);

                container.appendChild(group);
            }

            this.target.appendChild(container);

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
     * Removes all existing elements
     * from the visual container.
     */
    private clearTarget(): void {

        while (this.target.firstChild) {

            this.target.removeChild(
                this.target.firstChild
            );
        }
    }

    /**
     * Displays a simple message inside
     * the visual.
     */
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

        this.target.appendChild(element);
    }

    /**
     * Adds a label/value row to
     * the supplied container.
     */
    private appendDataRow(
        parent: HTMLElement,
        label: string,
        value: string
    ): void {

        const row =
            document.createElement("div");

        const labelElement =
            document.createElement("strong");

        labelElement.textContent =
            `${label}: `;

        const valueElement =
            document.createTextNode(value);

        row.appendChild(labelElement);
        row.appendChild(valueElement);

        parent.appendChild(row);
    }

    /**
     * Returns properties pane formatting model
     * content hierarchies, properties, and
     * latest formatting values.
     */
    public getFormattingModel():
        powerbi.visuals.FormattingModel {

        return this.formattingSettingsService
            .buildFormattingModel(
                this.formattingSettings
            );
    }
}