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

export function attachTooltip(
    element: SVGElement
    ,tooltipService: ITooltipService
    ,getTooltipData:
        () => VisualTooltipDataItem[]
    ,selectionIds:
        powerbi.visuals.ISelectionId[] = []
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

            tooltipService.show({
                coordinates: [
                    event.clientX
                    ,event.clientY
                ]
                ,isTouchEvent: false
                ,dataItems:
                    getTooltipData()
                ,identities:
                    selectionIds
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
                "isTouchEvent": false
                ,"immediately": true
            });
        }
    );
}

export function attachObservationTooltip(
    element: SVGElement
    ,tooltipService: ITooltipService
    ,categoryName: string
    ,observation: BandObservation
    ,formatter:
        valueFormatter.IValueFormatter
): void {

    attachTooltip(
        element
        ,tooltipService
        ,() => [
            {
                displayName:
                    "Category"
                ,value:
                    categoryName
            }
            ,{
                displayName:
                    "Grain"
                ,value:
                    observation.grainValue
            }
            ,{
                displayName:
                    "Value"
                ,value:
                    formatter.format(
                        observation.value
                    )
            }
        ]
        ,[observation.selectionId]
    );
}

const OBSERVATION_TOOLTIP_LIMIT =
    10;

export function attachObservationBandTooltip(
    element: SVGElement
    ,tooltipService: ITooltipService
    ,categoryName: string
    ,observations: BandObservation[]
    ,formatter:
        valueFormatter.IValueFormatter
    ,limit: number =
        OBSERVATION_TOOLTIP_LIMIT
): void {

    attachTooltip(
        element
        ,tooltipService
        ,() => {

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

            return tooltipData;
        }
        ,observations.map(
            observation =>
                observation.selectionId
        )
    );
}

export function attachStatisticTooltip(
    element: SVGElement
    ,tooltipService: ITooltipService
    ,categoryName: string
    ,statisticName: string
    ,value: number
    ,formatter:
        valueFormatter.IValueFormatter
): void {

    attachTooltip(
        element
        ,tooltipService
        ,() => [
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
        ]
    );
}

//TODO: rename to attachStatisticBandTooltip
export function attachStatisticBandTooltip(
    element: SVGElement
    ,tooltipService: ITooltipService
    ,categoryName: string
    ,stat: BandStatistics
    ,formatter:
        valueFormatter.IValueFormatter
): void {

    attachTooltip(
        element
        ,tooltipService
        ,() => [
            {
                displayName:
                    "Category"
                ,value:
                    categoryName
            }
            ,{
                displayName:
                    "Min"
                ,value:
                    formatter.format(
                        stat.min
                    )
            }
            ,{
                displayName:
                    "P05"
                ,value:
                    formatter.format(
                        stat.p05
                    )
            }
            ,{
                displayName:
                    "P33"
                ,value:
                    formatter.format(
                        stat.p33
                    )
            }
            ,{
                displayName:
                    "P50"
                ,value:
                    formatter.format(
                        stat.p50
                    )
            }
            ,{
                displayName:
                    "Average"
                ,value:
                    formatter.format(
                        stat.average
                    )
            }
            ,{
                displayName:
                    "P67"
                ,value:
                    formatter.format(
                        stat.p67
                    )
            }
            ,{
                displayName:
                    "P95"
                ,value:
                    formatter.format(
                        stat.p95
                    )
            }
            ,{
                displayName:
                    "Max"
                ,value:
                    formatter.format(
                        stat.max
                    )
            }
        ]
        ,stat.selectionIds
    );
}