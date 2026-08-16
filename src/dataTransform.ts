import powerbi from "powerbi-visuals-api";

import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

import {
    BandChartData,
    BandChartRow
} from "./dataModel";

export function transformData(
    dataView: DataView
): BandChartData | null {

    const table = dataView.table;

    if (!table) {
        return null;
    }

    const xColumns: DataViewMetadataColumn[] = [];
    const xIndexes: number[] = [];

    let grainColumn: DataViewMetadataColumn | undefined;
    let grainIndex = -1;

    let measureColumn: DataViewMetadataColumn | undefined;
    let measureIndex = -1;

    table.columns.forEach((column, index) => {

        if (column.roles?.xAxis) {
            xColumns.push(column);
            xIndexes.push(index);
        }

        if (column.roles?.grain) {
            grainColumn = column;
            grainIndex = index;
        }

        if (column.roles?.measure) {
            measureColumn = column;
            measureIndex = index;
        }
    });

    if (
        xColumns.length === 0 ||
        !grainColumn ||
        !measureColumn ||
        grainIndex === -1 ||
        measureIndex === -1
    ) {
        return null;
    }

    const rows: BandChartRow[] = [];

    for (const row of table.rows) {

        const rawValue = row[measureIndex];

        if (
            rawValue === null ||
            rawValue === undefined ||
            typeof rawValue !== "number"
        ) {
            continue;
        }

        rows.push({
            xValues: xIndexes.map(index => row[index]),
            grain: row[grainIndex],
            value: rawValue
        });
    }

    return {
        xColumns,
        grainColumn,
        measureColumn,
        rows
    };
}