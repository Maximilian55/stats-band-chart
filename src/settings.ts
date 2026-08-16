"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

const shapeItems = [
    {
        displayName: "Circle",
        value: "circle"
    },
    {
        displayName: "Square",
        value: "square"
    },
    {
        displayName: "Diamond",
        value: "diamond"
    },
    {
        displayName: "Triangle",
        value: "triangle"
    }
];

export class LineSettings extends FormattingSettingsCard {

    public lineColor = new formattingSettings.ColorPicker({
        name: "lineColor",
        displayName: "Color",
        value: {
            value: "#000000"
        }
    });

    public lineThickness = new formattingSettings.NumUpDown({
        name: "lineThickness",
        displayName: "Thickness",
        value: 2
    });

    public name: string = "line";
    public displayName: string = "Min / Max Line";

    public slices: FormattingSettingsSlice[] = [
        this.lineColor,
        this.lineThickness
    ];
}

export class PointSettings extends FormattingSettingsCard {

    public pointSize = new formattingSettings.NumUpDown({
        name: "pointSize",
        displayName: "Size",
        value: 4
    });

    public name: string = "points";
    public displayName: string = "Point Size";

    public slices: FormattingSettingsSlice[] = [
        this.pointSize
    ];
}

export class MinMaxSettings extends FormattingSettingsCard {

    public color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Color",
        value: {
            value: "#000000"
        }
    });

    public shape = new formattingSettings.ItemDropdown({
        name: "shape",
        displayName: "Shape",
        items: shapeItems,
        value: {
            displayName: "Circle",
            value: "circle"
        }
    });

    public name: string = "minMax";
    public displayName: string = "Min / Max";

    public slices: FormattingSettingsSlice[] = [
        this.color,
        this.shape
    ];
}

export class P5P95Settings extends FormattingSettingsCard {

    public color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Color",
        value: {
            value: "#000000"
        }
    });

    public shape = new formattingSettings.ItemDropdown({
        name: "shape",
        displayName: "Shape",
        items: shapeItems,
        value: {
            displayName: "Triangle",
            value: "triangle"
        }
    });

    public name: string = "p5p95";
    public displayName: string = "P5 / P95";

    public slices: FormattingSettingsSlice[] = [
        this.color,
        this.shape
    ];
}

export class P33P67Settings extends FormattingSettingsCard {

    public color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Color",
        value: {
            value: "#000000"
        }
    });

    public shape = new formattingSettings.ItemDropdown({
        name: "shape",
        displayName: "Shape",
        items: shapeItems,
        value: {
            displayName: "Triangle",
            value: "triangle"
        }
    });

    public name: string = "p33p67";
    public displayName: string = "P33 / P67";

    public slices: FormattingSettingsSlice[] = [
        this.color,
        this.shape
    ];
}

export class MedianSettings extends FormattingSettingsCard {

    public color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Color",
        value: {
            value: "#000000"
        }
    });

    public shape = new formattingSettings.ItemDropdown({
        name: "shape",
        displayName: "Shape",
        items: shapeItems,
        value: {
            displayName: "Square",
            value: "square"
        }
    });

    public name: string = "median";
    public displayName: string = "Median";

    public slices: FormattingSettingsSlice[] = [
        this.color,
        this.shape
    ];
}

export class AverageSettings extends FormattingSettingsCard {

    public color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Color",
        value: {
            value: "#000000"
        }
    });

    public shape = new formattingSettings.ItemDropdown({
        name: "shape",
        displayName: "Shape",
        items: shapeItems,
        value: {
            displayName: "Diamond",
            value: "diamond"
        }
    });

    public name: string = "average";
    public displayName: string = "Average";

    public slices: FormattingSettingsSlice[] = [
        this.color,
        this.shape
    ];
}

export class VisualFormattingSettingsModel
    extends FormattingSettingsModel {

    public line = new LineSettings();
    public points = new PointSettings();

    public minMax = new MinMaxSettings();
    public p5p95 = new P5P95Settings();
    public p33p67 = new P33P67Settings();
    public median = new MedianSettings();
    public average = new AverageSettings();

    public cards: FormattingSettingsCard[] = [
        this.line,
        this.points,
        this.minMax,
        this.p5p95,
        this.p33p67,
        this.median,
        this.average
    ];
}