import powerbi from "powerbi-visuals-api";

import {
    valueFormatter
} from "powerbi-visuals-utils-formattingutils";


import {
    BandStatistics
} from "../statistics";


import ITooltipService =
    powerbi.extensibility.ITooltipService;


import VisualTooltipDataItem =
    powerbi.extensibility.VisualTooltipDataItem;


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
