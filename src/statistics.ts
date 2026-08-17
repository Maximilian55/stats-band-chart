import { BandChartData } from "./dataModel";

import powerbi from "powerbi-visuals-api";

export interface BandObservation {
    grainValue: string;
    value: number;
    selectionId:
        powerbi.visuals.ISelectionId;
}

export interface BandStatistics {
    xValues: string[];

    min: number;
    p05: number;
    p33: number;
    p50: number;
    average: number;
    p67: number;
    p95: number;
    max: number;

    observations: BandObservation[];
    selectionIds: powerbi.visuals.ISelectionId[];
}

export function calculateBandStatistics(
    data: BandChartData
): BandStatistics[] {

    const groups = new Map<string, {
        xValues: string[];
        observations: BandObservation[];
    }>();

    for (const row of data.rows) {

        const xValues = row.xValues.map(value =>
            value === null || value === undefined
                ? ""
                : String(value)
        );

        const key = JSON.stringify(xValues);

        let group = groups.get(key);

        if (!group) {
            group = {
                xValues
                ,observations: []
            };

            groups.set(key, group);
        }

        group.observations.push({
            grainValue: row.grainValue
            ,value: row.value
            ,selectionId: row.selectionId
        });
    }

    const results: BandStatistics[] = [];

    for (const group of groups.values()) {

        const observations =
            group.observations
                .filter(
                    observation =>
                        Number.isFinite(
                            observation.value
                        )
                );
        
        const values =
                observations
                    .map(
                        observation =>
                            observation.value
                    )
                    .sort(
                        (
                            a
                            ,b
                        ) =>
                            a - b
                    );

        if (values.length === 0) {
            continue;
        }

        const average =
            values.reduce((sum, value) => sum + value, 0)
            / values.length;

        results.push({
            xValues: group.xValues
            ,observations
            ,selectionIds:
                observations.map(
                    observation => observation.selectionId
                )
            ,min: values[0]
            ,p05: percentile(values, 0.05)
            ,p33: percentile(values, 0.33)
            ,p50: percentile(values, 0.50)
            ,average
            ,p67: percentile(values, 0.67)
            ,p95: percentile(values, 0.95)
            ,max: values[values.length - 1]
        });
    }

    return results;
}

function percentile(
    sortedValues: number[]
    ,percentileValue: number
): number {

    if (sortedValues.length === 1) {
        return sortedValues[0];
    }

    const index =
        (sortedValues.length - 1) * percentileValue;

    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
        return sortedValues[lower];
    }

    const weight = index - lower;

    return (
        sortedValues[lower] * (1 - weight) +
        sortedValues[upper] * weight
    );
}