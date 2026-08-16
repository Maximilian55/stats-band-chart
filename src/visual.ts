/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import { transformData } from "./dataTransform";
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

        console.log("Visual constructor", options);

        this.events = options.host.eventService;
        this.target = options.element;

        this.formattingSettingsService =
            new FormattingSettingsService();
    }

    public update(options: VisualUpdateOptions): void {

        this.events.renderingStarted(options);

        try {

            const dataView = options.dataViews?.[0];

            // Clear the visual if no DataView exists.
            if (!dataView) {
                this.target.innerHTML = "";
                this.events.renderingFinished(options);
                return;
            }

            // Populate formatting pane settings.
            this.formattingSettings =
                this.formattingSettingsService.populateFormattingSettingsModel(
                    VisualFormattingSettingsModel,
                    dataView
                );

            // Transform the Power BI table into our internal data model.
            const data = transformData(dataView);

            // Required fields have not yet been supplied.
            if (!data) {

                this.target.innerHTML = `
                    <div class="bandChartMessage">
                        Add at least one X Axis field,
                        one Grain field,
                        and one Measure.
                    </div>
                `;

                this.events.renderingFinished(options);
                return;
            }

            console.log("Band chart data", data);

            /*
             * Temporary output.
             *
             * This lets us verify that Power BI is returning the
             * expected X Axis, Grain, and Measure fields before
             * we build the actual band chart.
             */
            this.target.innerHTML = `
                <div class="bandChartDebug">

                    <div>
                        <strong>X Axis:</strong>
                        ${data.xColumns
                            .map(column => column.displayName)
                            .join(" > ")}
                    </div>

                    <div>
                        <strong>Grain:</strong>
                        ${data.grainColumn.displayName}
                    </div>

                    <div>
                        <strong>Measure:</strong>
                        ${data.measureColumn.displayName}
                    </div>

                    <div>
                        <strong>Observation count:</strong>
                        ${data.rows.length}
                    </div>

                </div>
            `;

            this.events.renderingFinished(options);
        }
        catch (error) {

            console.error("Error in update method", error);

            this.target.innerHTML = `
                <div class="bandChartMessage">
                    Unable to render visual.
                </div>
            `;

            this.events.renderingFailed(
                options,
                String(error)
            );
        }
    }

    /**
     * Returns properties pane formatting model content hierarchies,
     * properties and latest formatting values.
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {

        return this.formattingSettingsService.buildFormattingModel(
            this.formattingSettings
        );
    }
}