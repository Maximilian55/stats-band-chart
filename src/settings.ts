"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import { format } from "d3";


const shapeItems = [
    {displayName: "Circle" ,value: "circle"}
    ,{displayName: "Square" ,value: "square"}
    ,{displayName: "Diamond" ,value: "diamond"}
    ,{displayName: "Triangle" ,value: "triangle"}
    ,{displayName: "Chevron" ,value: "chevron"}
    ,{displayName: "Bar" ,value: "bar"}
];

class MarkerSettingsBase
    extends FormattingSettingsCard {
    public color: formattingSettings.ColorPicker;

    public fillTransparency: formattingSettings.NumUpDown;

    public borderColor: formattingSettings.ColorPicker;

    public borderTransparency: formattingSettings.NumUpDown;

    public borderWidth: formattingSettings.NumUpDown;
    
    public shape: formattingSettings.ItemDropdown;

    public slices: FormattingSettingsSlice[] = [];

    constructor(
            defaultShape: string
            ,defaultShapeName: string
    ) {
        super();

        this.color =
            new formattingSettings.ColorPicker({
                name: "color"
                ,displayName: "Fill color"
                ,value: {
                    value: "#000000"
                }
            });

        this.fillTransparency =
            new formattingSettings.NumUpDown({
                name: "fillTransparency"
                ,displayName: "Fill transparency"
                ,value: 0
            });

        this.borderColor =
            new formattingSettings.ColorPicker({
                name: "borderColor"
                ,displayName: "Border color"
                ,value: {
                    value: "#000000"
                }
            });

        this.borderTransparency =
            new formattingSettings.NumUpDown({
                name: "borderTransparency"
                ,displayName: "Border transparency"
                ,value: 0
            });

        this.borderWidth =
            new formattingSettings.NumUpDown({
                name: "borderWidth"
                ,displayName: "Border width"
                ,value: 0
            });

        this.shape =
            new formattingSettings.ItemDropdown({
                name: "shape"
                ,displayName: "Shape"
                ,items: shapeItems
                ,value: {
                    displayName: defaultShapeName
                    ,value: defaultShape
                }
            });

        this.slices = [
            this.color
            ,this.fillTransparency
            ,this.borderColor
            ,this.borderTransparency
            ,this.borderWidth
            ,this.shape
        ];
    }
}

export class LineSettings extends FormattingSettingsCard {

    public lineColor = new formattingSettings.ColorPicker({
        name: "lineColor"
        ,displayName: "Color"
        ,value: {
            value: "#000000"
        }
    });

    public lineThickness = new formattingSettings.NumUpDown({
        name: "lineThickness"
        ,displayName: "Thickness"
        ,value: 2
    });

    public name: string = "line";
    public displayName: string = "Min / Max Line";

    public slices: FormattingSettingsSlice[] = [
        this.lineColor
        ,this.lineThickness
    ];
}

export class PointSettings extends FormattingSettingsCard {

    public pointSize = new formattingSettings.NumUpDown({
        name: "pointSize"
        ,displayName: "Size"
        ,value: 4
    });

    public showStatistics = new formattingSettings.ToggleSwitch({
        name: "showStatistics"
        ,displayName: "Show Statistics"
        ,value: true
    });

    public name: string = "points";
    public displayName: string = "Points";

    public slices: FormattingSettingsSlice[] = [
        this.pointSize
        ,this.showStatistics
    ];
}

export class XAxisSettings extends FormattingSettingsCard {

    public labelRotation = new formattingSettings.NumUpDown({
        name: "labelRotation"
        ,displayName: "Label rotation"
        ,value: 0
    });

    public fontSize = new formattingSettings.NumUpDown({
        name: "fontSize"
        ,displayName: "Font size"
        ,value: 12
    });

    public name: string = "xAxis";
    public displayName: string = "X Axis";


    public gridlines = new formattingSettings.ToggleSwitch({
        name: "gridlines"
        ,displayName: "Category separators"
        ,value: false
    });

    public angledGridlines = new formattingSettings.ToggleSwitch({
        name: "angledGridlines"
        ,displayName: "Angled extension"
        ,value: false
    });

    public slices: FormattingSettingsSlice[] = [
        this.labelRotation
        ,this.fontSize
        ,this.gridlines
        ,this.angledGridlines
    ];
}

export class YAxisSettings extends FormattingSettingsCard {

    public show = new formattingSettings.ToggleSwitch({
        name: "show"
        ,displayName: "Show"
        ,value: true
    });

    public fontSize = new formattingSettings.NumUpDown({
        name: "fontSize"
        ,displayName: "Font size"
        ,value: 11
    });

    public gridlines = new formattingSettings.ToggleSwitch({
        name: "gridlines"
        ,displayName: "Gridlines"
        ,value: true
    });

    public name: string = "yAxis";
    public displayName: string = "Y Axis";

    public minorGridlines = new formattingSettings.ToggleSwitch({
    name: "minorGridlines"
    ,displayName: "Minor gridlines"
    ,value: false
    });

    public slices: FormattingSettingsSlice[] = [
        this.show
        ,this.fontSize
        ,this.gridlines
        ,this.minorGridlines
    ];

}

export class LegendSettings
    extends FormattingSettingsCard {

    public show =
        new formattingSettings.ToggleSwitch({
            name: "show"
            ,displayName: "Show"
            ,value: true
        });

    public fontSize =
        new formattingSettings.NumUpDown({
            name: "fontSize"
            ,displayName: "Font size"
            ,value: 11
        });

    public bold =
        new formattingSettings.ToggleSwitch({
            name: "bold"
            ,displayName: "Bold"
            ,value: false
        });

    public name:
        string = "legend";

    public displayName:
        string = "Legend";

    public slices:
        FormattingSettingsSlice[] = [
            this.show
            ,this.fontSize
            ,this.bold
        ];
}

export class MinMaxSettings extends MarkerSettingsBase {

    constructor() {
        super(
            "circle"
            ,"Circle"
        );
    }

    public name: string = "minMax";
    public displayName: string = "Min / Max";

}

export class P5P95Settings extends MarkerSettingsBase {

    constructor() {
        super(
            "triangle"
            ,"Triangle"
        );
    }

    public name: string = "p5p95";
    public displayName: string = "P5 / P95";

}

export class P33P67Settings extends MarkerSettingsBase {

    constructor() {
        super(
            "triangle"
            ,"Triangle"
        );
    }

    public name: string = "p33p67";
    public displayName: string = "P33 / P67";

}

export class MedianSettings extends MarkerSettingsBase {

    constructor() {
        super(
            "square"
            ,"Square"
        );
    }

    public name: string = "median";
    public displayName: string = "Median";

}

export class AverageSettings extends MarkerSettingsBase {

    constructor() {
        super(
            "diamond"
            ,"Diamond"
        );
    }

    public name: string = "average";
    public displayName: string = "Average";

}

export class VisualFormattingSettingsModel
    extends FormattingSettingsModel {

    public line = new LineSettings();
    public points = new PointSettings();

    public xAxis = new XAxisSettings();
    public yAxis = new YAxisSettings();

    public legend = new LegendSettings();

    public minMax = new MinMaxSettings();
    public p5p95 = new P5P95Settings();
    public p33p67 = new P33P67Settings();
    public median = new MedianSettings();
    public average = new AverageSettings();

    public cards: FormattingSettingsCard[] = [
        this.line
        ,this.points
        ,this.xAxis
        ,this.yAxis
        ,this.legend
        ,this.minMax
        ,this.p5p95
        ,this.p33p67
        ,this.median
        ,this.average
    ];
}