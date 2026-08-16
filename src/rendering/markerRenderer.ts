/**
 * Draw one statistical marker and attach
 * a native Power BI tooltip.
 */

import powerbi from "powerbi-visuals-api";

import {
    valueFormatter
} from "powerbi-visuals-utils-formattingutils";

import ITooltipService =
    powerbi.extensibility.ITooltipService;

import VisualTooltipDataItem =
    powerbi.extensibility.VisualTooltipDataItem;

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

    const svgNamespace =
        "http://www.w3.org/2000/svg";

    // draw marker 
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
                !tooltipService.enabled()
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

            tooltipService.show({
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
                !tooltipService.enabled()
            ) {
                return;
            }

            tooltipService.hide({
                isTouchEvent: false
                ,immediately: true
            });
        }
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

    const svgNamespace =
        "http://www.w3.org/2000/svg";

    let marker: SVGElement;

    if (style.shape === "square") {

        const square =
            document.createElementNS(
                svgNamespace
                ,"rect"
            );

        square.setAttribute(
            "x"
            ,(x - size).toString()
        );

        square.setAttribute(
            "y"
            ,(y - size).toString()
        );

        square.setAttribute(
            "width"
            ,(size * 2).toString()
        );

        square.setAttribute(
            "height"
            ,(size * 2).toString()
        );

        marker = square;
    }

    else if (
        style.shape === "diamond"
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

        marker = diamond;
    }

    else if (
        style.shape === "triangle"
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

        marker = triangle;
    }

    else if (
        style.shape === "chevron"
    ) {
        const chevron =
            document.createElementNS(
                svgNamespace
                ,"polygon"
            );
        
        const points = [
            `${x - size},${y + size * 0.45}`
            ,`${x},${y - size}`
            ,`${x + size},${y + size * 0.45}`
            ,`${x + size * 0.55},${y + size}`
            ,`${x},${y - size * 0.15}`
            ,`${x - size * 0.55},${y + size}`
        ].join(" ");

        chevron.setAttribute(
            "points"
            ,points
        );

        marker = chevron;
    }

    else if (
        style.shape === "bar"
    ) {
        const bar =
            document.createElementNS(
                svgNamespace
                ,"rect"
            );

        bar.setAttribute(
            "x"
            ,(x - size * 1.5).toString()
        );

        bar.setAttribute(
            "y"
            ,(y - size * 0.35).toString()
        );

        bar.setAttribute(
            "width"
            ,(size * 3).toString()
        );

        bar.setAttribute(
            "height"
            ,(size * 0.7).toString()
        );

        marker = bar;
    }

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

        marker = circle;
    }

    const fillOpacity =
        1 - style.fillTransparency / 100;

    const borderOpacity =
        1 - style.borderTransparency / 100;
    
    marker.setAttribute(
        "fill"
        ,style.fillColor
    );

    marker.setAttribute(
        "fill-opacity"
        ,fillOpacity.toString()
    );

    marker.setAttribute(
        "stroke"
        ,style.borderColor
    );

    marker.setAttribute(
        "stroke-opacity"
        ,borderOpacity.toString()
    );

    marker.setAttribute(
        "border-width"
        ,style.borderWidth.toString()
    );


    if (inverted) {

        marker.setAttribute(
            "transform"
            ,`rotate(180 ${x} ${y})`
        );
    }

    container.appendChild(
        marker
    );

    return marker;
}