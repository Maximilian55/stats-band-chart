/**
 * Draw one statistical marker and attach
 * a native Power BI tooltip.
 */

import powerbi from "powerbi-visuals-api";

import {
    valueFormatter
} from "powerbi-visuals-utils-formattingutils";

import {
    createSvgElement
    ,setSvgAttributes
    ,createHitTarget
} from "../utils/svgUtils";

import {
    attachStatisticTooltip
} from "./tooltipRenderer";

import ITooltipService =
    powerbi.extensibility.ITooltipService;

export interface MarkerStyle {
    fillColor: string;
    fillTransparency: number;

    borderColor: string;
    borderTransparency: number;
    borderWidth: number;

    shape: string;
}

export function createMarkerStyle(
    settings: {
        color: {
            value: {
                value: string;
            };
        };

        fillTransparency: {
            value: number;
        };

        borderColor: {
            value: {
                value: string;
            };
        };

        borderTransparency: {
            value: number;
        };

        borderWidth: {
            value: number;
        };

        shape: {
            value: {
                value: string | number;
            };
        };
    }
): MarkerStyle {

    return {
        fillColor: settings.color.value.value
        ,fillTransparency: settings.fillTransparency.value
        ,borderColor: settings.borderColor.value.value
        ,borderTransparency: settings.borderTransparency.value
        ,borderWidth: settings.borderWidth.value
        ,shape: String(settings.shape.value.value)
    };
}

export function drawMarker(
    svg: SVGSVGElement
    ,x: number
    ,y: number
    ,size: number
    ,style: MarkerStyle
    ,categoryName: string
    ,statisticName: string
    ,value: number
    ,formatter: valueFormatter.IValueFormatter
    ,tooltipService:
        ITooltipService
    ,inverted: boolean = false
): void {

    // draw marker 
    const marker =
        drawMarkerShape(
            svg
            ,x
            ,y
            ,size
            ,style
            ,inverted
        );

    // draw invisible hit target for easy tooltip interaction
    const hitTarget =
        createHitTarget(
            marker
            ,x
            ,y
            ,Math.max(
                size * 2
                ,20
            )
        );

    attachStatisticTooltip(
        hitTarget
        ,tooltipService
        ,categoryName
        ,statisticName
        ,value
        ,formatter
    );

    svg.appendChild(
        hitTarget
    );
}

export function drawMarkerShape(
    container: SVGElement
    ,x: number
    ,y: number
    ,size: number
    ,style: MarkerStyle
    ,inverted: boolean = false
): SVGElement {

    let marker: SVGElement;

    if (style.shape === "square") {

        const square =
            createSvgElement(
                "rect"
            );
        
        setSvgAttributes(
            square
            ,{
                x: x - size
                ,y: y - size
                ,width: size * 2
                ,height: size * 2
            }
        );

        marker = square;
    }

    else if (
        style.shape === "diamond"
    ) {

        const diamond =
            createSvgElement(
                "polygon"
            );

        const points = [
            `${x},${y - size}`
            ,`${x + size},${y}`
            ,`${x},${y + size}`
            ,`${x - size},${y}`
        ].join(
            " "
        );

        setSvgAttributes(
            diamond
            ,{
                "points": points
            }
        );

        marker = diamond;
    }

    else if (
        style.shape === "triangle"
    ) {

        const triangle =
            createSvgElement(
                "polygon"
            );

        const points = [
            `${x},${y - size}`
            ,`${x + size},${y + size}`
            ,`${x - size},${y + size}`
        ].join(
            " "
        );

        setSvgAttributes(
            triangle
            ,{
                "points": points
            }
        );

        marker = triangle;
    }

    else if (
        style.shape === "chevron"
    ) {
        const chevron =
            createSvgElement(
                "polygon"
            );

        const points = [
            `${x - size},${y + size * 0.45}`
            ,`${x},${y - size}`
            ,`${x + size},${y + size * 0.45}`
            ,`${x + size * 0.55},${y + size}`
            ,`${x},${y - size * 0.15}`
            ,`${x - size * 0.55},${y + size}`
        ].join(
            " "
        );

        setSvgAttributes(
            chevron
            ,{
                "points": points
            }
        );

        marker = chevron;
    }

    else if (
        style.shape === "bar"
    ) {
        const bar =
            createSvgElement(
                "rect"
            );

        setSvgAttributes(
            bar
            ,{
                "x":
                    x - size * 1.5
                ,"y":
                    y - size * 0.35
                ,"width":
                    size * 3
                ,"height":
                    size * 0.7
            }
        );

        marker = bar;
    }

    else {

        const circle =
            createSvgElement(
                "circle"
            );

        setSvgAttributes(
            circle
            ,{
                "cx": x
                ,"cy": y
                ,"r": size
            }
        );

        marker = circle;
    }

    const fillOpacity =
        1 - style.fillTransparency / 100;

    const borderOpacity =
        1 - style.borderTransparency / 100;
    
    setSvgAttributes(
        marker
        ,{
            "fill":
                style.fillColor
            ,"fill-opacity":
                fillOpacity
            ,"stroke":
                style.borderColor
            ,"stroke-opacity":
                borderOpacity
            ,"stroke-width":
                style.borderWidth
        }
    );

    if (
        inverted
    ) {

        setSvgAttributes(
            marker
            ,{
                "transform":
                    `rotate(180 ${x} ${y})`
            }
        );
    }

    container.appendChild(
        marker
    );

    return marker;
}