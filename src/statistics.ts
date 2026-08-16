import { BandChartData } from "./dataModel";

import powerbi from "powerbi-visuals-api";

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
    selectionIds: powerbi.visuals.ISelectionId[];
}

export function calculateBandStatistics(
    data: BandChartData
): BandStatistics[] {

    const groups = new Map<string, {
        xValues: string[];
        values: number[];
        selectionIds:
            powerbi.visuals.ISelectionId[];
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
                ,values: []
                ,selectionIds: []
            };

            groups.set(key, group);
        }

        group.values.push(row.value);

        group.selectionIds.push(row.selectionId);
    }

    const results: BandStatistics[] = [];

    for (const group of groups.values()) {

        const values = group.values
            .filter(value => Number.isFinite(value))
            .sort((a, b) => a - b);

        if (values.length === 0) {
            continue;
        }

        const average =
            values.reduce((sum, value) => sum + value, 0)
            / values.length;

        results.push({
            xValues: group.xValues
            ,selectionIds: group.selectionIds
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