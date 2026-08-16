import powerbi from "powerbi-visuals-api";

import {
    BandObservation
} from "../statistics";

import {
    createSvgElement
    ,setSvgAttributes
} from "../utils/svgUtils";

import ISelectionManager =
    powerbi.extensibility.ISelectionManager;

export interface ObservationRenderOptions {
    svg: SVGSVGElement;

    x: number;

    observations:
        BandObservation[];

    yScale:
        (
            value: number
        ) => number;

    size: number;

    color: string;

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
        ,observations
        ,yScale
        ,size
        ,color
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