import {
    valueFormatter
} from "powerbi-visuals-utils-formattingutils";

export interface ValueFormatters {
    axis:
        valueFormatter.IValueFormatter;

    tooltip:
        valueFormatter.IValueFormatter;
}

export function createValueFormatters(
    formatString?: string
): ValueFormatters {

    const formatter =
        valueFormatter.create({
            format: formatString
        });

    return {
        axis: formatter
        ,tooltip: formatter
    };
}