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

export function drawMarker(
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
    ,tooltipService:
        ITooltipService
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
        marker
    );

    svg.appendChild(
        hitTarget
    );
}