import powerbi from "powerbi-visuals-api";

export interface BandChartRow {
    xValues: powerbi.PrimitiveValue[];
    grain: powerbi.PrimitiveValue;
    value: number;
    selectionId: powerbi.visuals.ISelectionId;
}

export interface BandChartData {
    xColumns: powerbi.DataViewMetadataColumn[];
    grainColumn: powerbi.DataViewMetadataColumn;
    measureColumn: powerbi.DataViewMetadataColumn;
    rows: BandChartRow[];
}