import powerbi from "powerbi-visuals-api";

import {
    valueFormatter
} from "powerbi-visuals-utils-formattingutils";


import {
    BandObservation
    ,BandStatistics
} from "../statistics";


import ITooltipService =
    powerbi.extensibility.ITooltipService;


import VisualTooltipDataItem =
    powerbi.extensibility.VisualTooltipDataItem;

export function attachObservationTooltip(
    element: SVGElement
    ,tooltipService: ITooltipService
    ,categoryName: string
    ,observation: BandObservation
    ,formatter:
        valueFormatter.IValueFormatter
): void {

    element.addEventListener(
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
                        displayName: "Category"
                        ,value: categoryName
                    }
                    ,{
                        displayName: "Grain"
                        ,value: observation.grainValue
                    }
                    ,{
                        displayName: "Value"
                        ,value: formatter.format(observation.value)
                    }
                ];

            tooltipService.show({
                coordinates: [
                    event.clientX
                    ,event.clientY
                ]
                ,isTouchEvent: false
                ,dataItems: tooltipData
                ,identities: [
                    observation.selectionId
                ]
            });
        }
    );

    element.addEventListener(
        "mouseout"
        ,() => {

            if (
                !tooltipService.enabled()
            ) {
                return;
            }

            tooltipService.hide({
                immediately: true
                ,isTouchEvent: false
            });
        }
    );
}

const OBSERVATION_TOOLTIP_LIMIT =
    10;

export function attachObservationBandTooltip(
    element: SVGElement
    ,tooltipService: ITooltipService
    ,categoryName: string
    ,observations: BandObservation[]
    ,formatter: valueFormatter.IValueFormatter
    ,limit: number = OBSERVATION_TOOLTIP_LIMIT
): void {

    element.addEventListener(
        "mousemove"
        ,(
            event: MouseEvent
        ) => {

            if (
                !tooltipService.enabled()
            ) {
                return;
            }

            const displayedObservations =
                [...observations]
                    .sort(
                        (
                            a
                            ,b
                        ) =>
                            b.value
                            - a.value
                    )
                    .slice(
                        0
                        ,limit
                    );

            const tooltipData:
                VisualTooltipDataItem[] = [
                    {
                        displayName:
                            "Category"
                        ,value:
                            categoryName
                    }
                    ,...displayedObservations.map(
                        observation => ({
                            displayName:
                                observation.grainValue
                            ,value:
                                formatter.format(
                                    observation.value
                                )
                        })
                    )
            ];

            if (
                observations.length
                > limit
            ) {
                tooltipData.push({
                    displayName:
                        "Additional values"
                    ,value:
                        String(
                            observations.length
                            - limit
                        )
                });
            }

            tooltipService.show({
                coordinates: [
                    event.clientX
                    ,event.clientY
                ]
                ,isTouchEvent: false
                ,dataItems:
                    tooltipData
                ,identities:
                    observations.map(
                        observation =>
                            observation.selectionId
                    )
            });
        }
    );

    element.addEventListener(
        "mouseout"
        ,() => {

            if (
                !tooltipService.enabled()
            ) {
                return;
            }

            tooltipService.hide({
                immediately: true
                ,isTouchEvent: false
            });
        }
    );
}


export function attachBandTooltip(
    lineHitTarget: SVGLineElement
    ,tooltipService: ITooltipService
    ,categoryName: string
    ,stat: BandStatistics
    ,formatter: valueFormatter.IValueFormatter
): void {
    
    lineHitTarget.addEventListener(
        "mousemove"
        ,(event: MouseEvent) => {
            if (
                !tooltipService.enabled()
            ) {
                return;
            }

            const tooltipData:
                VisualTooltipDataItem[] = [
                    {
                        displayName: "Category"
                        ,value: categoryName
                    }
                    ,{
                        displayName: "Min"
                        ,value: formatter.format(
                            stat.min
                        )
                    }
                    ,{
                        displayName: "P05"
                        ,value: formatter.format(
                            stat.p05
                        )
                    }
                    ,{
                        displayName: "P33"
                        ,value: formatter.format(
                            stat.p33
                        )
                    }
                    ,{
                        displayName: "P50"
                        ,value: formatter.format(
                            stat.p50
                        )
                    }
                    ,{
                        displayName: "Average"
                        ,value: formatter.format(
                            stat.average
                        )
                    }
                    ,{
                        displayName: "P67"
                        ,value: formatter.format(
                            stat.p67
                        )
                    }
                    ,{
                        displayName: "P95"
                        ,value: formatter.format(
                            stat.p95
                        )
                    }
                    ,{
                        displayName: "Max"
                        ,value: formatter.format(
                            stat.max
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

    lineHitTarget.addEventListener(
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

}
