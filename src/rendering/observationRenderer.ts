import powerbi from "powerbi-visuals-api";

import {
    BandObservation
} from "../statistics";

import {
    attachObservationTooltip
} from "./tooltipRenderer";

import {
    createSvgElement
    ,setSvgAttributes
} from "../utils/svgUtils";

import {
    valueFormatter
} from "powerbi-visuals-utils-formattingutils";

import ISelectionManager =
    powerbi.extensibility.ISelectionManager;

import ITooltipService =
    powerbi.extensibility.ITooltipService;

import VisualTooltipDataItem =
    powerbi.extensibility.VisualTooltipDataItem;

export interface ObservationRenderOptions {
    svg: SVGSVGElement;

    x: number;

    categoryName: string;

    observations:
        BandObservation[];

    yScale:
        (
            value: number
        ) => number;

    size: number;

    color: string;

    formatter: valueFormatter.IValueFormatter;

    tooltipService: ITooltipService;

    selectionManager:
        ISelectionManager;
}

export function drawObservations(
    options:
        ObservationRenderOptions
): void {

    const {
        svg
        ,x
        ,categoryName
        ,observations
        ,yScale
        ,size
        ,color
        ,formatter
        ,tooltipService
        ,selectionManager
    } = options;

    for (
        const observation
        of observations
    ) {

        const dot =
            createSvgElement(
                "circle"
            );

        setSvgAttributes(
            dot
            ,{
                "cx": x
                ,"cy": yScale(
                    observation.value
                )
                ,"r": size
                ,"fill": color
                ,"cursor": "pointer"
            }
        );

        attachObservationTooltip(
            dot
            ,tooltipService
            ,categoryName
            ,observation
            ,formatter
        );

        dot.addEventListener(
            "click"
            ,(
                event: MouseEvent
            ) => {

                event.stopPropagation();

                selectionManager.select(
                    observation.selectionId
                    ,event.ctrlKey
                );
            }
        );

        svg.appendChild(
            dot
        );
    }
}