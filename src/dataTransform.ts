import powerbi from "powerbi-visuals-api";

import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

import {
    BandChartData,
    BandChartRow
} from "./dataModel";

import IVisualHost =
    powerbi.extensibility.visual.IVisualHost;

export function transformData(
    dataView: DataView
    ,host: IVisualHost
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

    for (
        let rowIndex = 0;
        rowIndex < table.rows.length;
        rowIndex++
    ) {
        const row = 
            table.rows[rowIndex];

        const rawValue = row[measureIndex];

        if (
            rawValue === null ||
            rawValue === undefined ||
            typeof rawValue !== "number"
        ) {
            continue;
        }

        const selectionId =
            host
                .createSelectionIdBuilder()
                .withTable(
                    table
                    ,rowIndex
                )
                .createSelectionId();
            
        const grain =
                row[grainIndex];

        rows.push({
            xValues: xIndexes.map(index => row[index])
            ,grain
            ,grainValue:
                grain === null
                || grain === undefined
                    ? ""
                    : String(
                        grain
                    )
            ,value: rawValue
            ,selectionId
        });
    }

    return {
        xColumns,
        grainColumn,
        measureColumn,
        rows
    };
}