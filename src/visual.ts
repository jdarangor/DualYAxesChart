/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {

    interface DualYAxisChartViewModel {
        dataPoints: series[];
        minX: any;
        maxX: any;
        minY1: number;
        maxY1: number;
        minY2: number;
        maxY2: number;
        data: LineData;
        backgroundColor: string;
        marker: MarkerStyle;
        xAxis: AxisData;
        yAxis: AxisData;
        y2Axis: AxisData;
        showGridLines: boolean;
        isDateRange: boolean;
        xAxisFormat: any;
        legendPos: string;
        legendRowHeight: number;
        colorPalette: number;
    };

    interface LineData {
        //DataColor?: string;
        LineColor?: string;
        LineStyle: string;
    }

    interface AxisData {
        AxisTitle: string;
        TitleSize: number;
        TitleFont: string;
        TitleColor: string;
        AxisLabelSize: number;
        AxisLabelFont: string;
        AxisLabelColor: string;
        AxisLabelFormat: any;
        Rotation?: number;
    }
    /**
        * Interface for Chart data points.
        *
        * @interface
        * @property {any} xvalue                - Data value for point. - date or number
        * @property {number} yValue             - y axis value.
        */
    interface ChartDataPoint {
        xValue: any;
        yValue: number;
    };

    interface series {
        AxisData: ChartDataPoint[];
        color: string;
        selectionId: ISelectionId;
        seriesName: string;
        axis: string;
    }

    interface colorPalette {
        name: string;
        colors: string[];
    }

    interface MarkerStyle{
        MarkerSize: number;       
    }


    /**
             * Function that converts queried data into a view model that will be used by the visual.
             *
             * @function
             * @param {VisualUpdateOptions} options - Contains references to the size of the container
             *                                        and the dataView which contains all the data
             *                                        the visual had queried.
             * @param {IVisualHost} host            - Contains references to the host which contains services
             */
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, cp: colorPalette[]): DualYAxisChartViewModel {
        let dataViews = options.dataViews;
        let viewModel: DualYAxisChartViewModel = {
            dataPoints: [],
            minX: null,
            maxX: null,
            minY1: 0,
            maxY1: 0,
            minY2: 0,
            maxY2: 0,
            xAxisFormat: null,
            backgroundColor: null,
            marker: null,
            data: null,
            xAxis: null,
            yAxis: null,
            y2Axis: null,
            showGridLines: true,
            isDateRange: true,
            legendPos: '',
            legendRowHeight: 14,
            colorPalette: 0
        };

        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values)
            return viewModel;


        let defGridlineColor: string = '#c2c6c6';
        let defAxisLabelColor: string = '#000000';
        let defMeanLineColor: string = '#35BF4D';
        let defSubgroupLineColor: string = '#00C3FF';
        let defLimitLineColor: string = '#FFA500';

        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];
        let seriesDataPoints: ChartDataPoint[] = [];
        let dvmobjs = dataViews[0].metadata.objects;
        var minY1: number;
        var maxY1: number;
        var minY2: number;
        var maxY2: number;
        var xAxisType: string = "NotUsable";

        try{
            if (category.source.type.dateTime.valueOf() == true)
                xAxisType = "date";
            else
                if(category.source.type.numeric.valueOf() == true)
                    xAxisType = "numeric";
                    
            let dvobjs = dataViews[0].metadata.objects;

            if (xAxisType != "NotUsable") {
               
                var xAxisLabelFormat: any;
                if (xAxisType == "date")
                    xAxisLabelFormat = getValue<string>(dvobjs, 'xAxis', 'xAxisDateFormat', '%d-%b-%y');
                else
                    xAxisLabelFormat = getValue<string>(dvobjs, 'xAxis', 'xAxisLabelFormat', '.3s')

                let chartData: LineData = {                   
                    LineStyle: getValue<string>(dvmobjs, 'chart', 'lineStyle', '')
                };
                let xAxisData: AxisData = {
                    AxisTitle: getValue<string>(dvobjs, 'xAxis', 'xAxisTitle', 'Default Value'),
                    TitleColor: getFill(dataViews[0], 'xAxis', 'xAxisTitleColor', defAxisLabelColor),
                    TitleSize: getValue<number>(dvobjs, 'xAxis', 'xAxisTitleSize', 12),
                    TitleFont: getValue<string>(dvobjs, 'xAxis', 'xAxisTitlefontFamily', 'Arial'),
                    AxisLabelSize: getValue<number>(dvobjs, 'xAxis', 'xAxisLabelSize', 12),
                    AxisLabelColor: getFill(dataViews[0], 'xAxis', 'xAxisLabelColor', defAxisLabelColor),
                    AxisLabelFont: getValue<string>(dvobjs, 'xAxis', 'xAxisLabelfontFamily', 'Arial'),
                    Rotation: getValue<number>(dvobjs, 'xAxis', 'xAxisLabelRotation', 0),
                    AxisLabelFormat: xAxisLabelFormat
                };
                let yAxisData: AxisData = {
                    AxisTitle: getValue<string>(dvobjs, 'yAxis', 'yAxisTitle', 'Default Value'),
                    TitleColor: getFill(dataViews[0], 'yAxis', 'yAxisTitleColor', defAxisLabelColor),
                    TitleSize: getValue<number>(dvobjs, 'yAxis', 'yAxisTitleSize', 12),
                    TitleFont: getValue<string>(dvobjs, 'yAxis', 'yAxisTitlefontFamily', 'Arial'),
                    AxisLabelSize: getValue<number>(dvobjs, 'yAxis', 'yAxisLabelSize', 12),
                    AxisLabelFont: getValue<string>(dvobjs, 'yAxis', 'yAxisLabelfontFamily', 'Arial'),
                    AxisLabelColor: getFill(dataViews[0], 'yAxis', 'yAxisLabelColor', defAxisLabelColor),
                    AxisLabelFormat: getValue<string>(dvobjs, 'yAxis', 'yAxisLabelFormat', '.3s')
                };
                let Marker: MarkerStyle = {
                    MarkerSize: getValue<number>(dvobjs, 'chart', 'markerSize', 2),
                }
                let y2AxisData: AxisData = {
                    AxisTitle: getValue<string>(dvobjs, 'y2Axis', 'y2AxisTitle', 'Default Value'),
                    TitleColor: getFill(dataViews[0], 'y2Axis', 'y2AxisTitleColor', defAxisLabelColor),
                    TitleSize: getValue<number>(dvobjs, 'y2Axis', 'y2AxisTitleSize', 12),
                    TitleFont: getValue<string>(dvobjs, 'y2Axis', 'y2AxisTitlefontFamily', 'Arial'),
                    AxisLabelSize: getValue<number>(dvobjs, 'y2Axis', 'y2AxisLabelSize', 12),
                    AxisLabelFont: getValue<string>(dvobjs, 'y2Axis', 'y2AxisLabelfontFamily', 'Arial'),
                    AxisLabelColor: getFill(dataViews[0], 'y2Axis', 'y2AxisLabelColor', defAxisLabelColor),
                    AxisLabelFormat: getValue<string>(dvobjs, 'y2Axis', 'y2AxisLabelFormat', '.3s')
                };
                let legendPos: string = getValue<string>(dvmobjs, 'chart', 'legendPosition', 'none');
                var paletteId = getValue<number>(dvmobjs, 'yColorSelector', 'lineColor', 0);
                var c = cp[paletteId].colors;

                for (let k = 0; k < categorical.values.length; k++) {  //1,2..
                    seriesDataPoints = [];
                    for (let i = 0; i < categorical.values[k].values.length; i++) {
                        seriesDataPoints.push({ xValue: categorical.categories[0].values[i], yValue: <number>categorical.values[k].values[i] });
                    }

                    var selectionId = host.createSelectionIdBuilder()
                        .withCategory(category, k)
                        .createSelectionId();

                    if (categorical.values[k].source.roles['y2Value'] == true) {
                        viewModel.dataPoints.push({
                            AxisData: seriesDataPoints,
                            color: c[k % c.length],// getSelectorFill(category, k, 'yColorSelector', 'fill', 'purple'),
                            seriesName: categorical.values[k].source.displayName,
                            selectionId: selectionId,
                            axis: 'y2'
                        });
                        if (isNaN(minY2))
                            minY2 = <number>categorical.values[k].minLocal;
                        if (isNaN(maxY2))
                            maxY2 = <number>categorical.values[k].maxLocal;
                        maxY2 = Math.max(<number>categorical.values[k].maxLocal, maxY2);
                        minY2 = Math.min(<number>categorical.values[k].minLocal, minY2);
                    }
                    else
                        if (categorical.values[k].source.roles['y1Value'] = true) {
                            viewModel.dataPoints.push({
                                AxisData: seriesDataPoints,
                                color: c[k % c.length],//getSelectorFill(category, k, 'yColorSelector', 'fill', 'purple'),
                                seriesName: categorical.values[k].source.displayName,
                                selectionId: selectionId,
                                axis: 'y1'
                            });
                            if (isNaN(maxY1))
                                maxY1 = <number>categorical.values[k].maxLocal;
                            if (isNaN(minY1))
                                minY1 = <number>categorical.values[k].minLocal;
                            maxY1 = Math.max(<number>categorical.values[k].maxLocal, maxY1);
                            minY1 = Math.min(<number>categorical.values[k].minLocal, minY1);
                        }
                }

                //alert('here');
                return {
                    dataPoints: viewModel.dataPoints,
                    minX: null,
                    maxX: null,
                    minY1: minY1,
                    maxY1: maxY1,
                    minY2: minY2,
                    maxY2: maxY2,
                    data: chartData,
                    backgroundColor: getFill(dataViews[0], 'chart', 'backgroundColor', '#FFFFFF'),
                    marker: Marker,
                    xAxis: xAxisData,
                    yAxis: yAxisData,
                    y2Axis: y2AxisData,
                    showGridLines: getValue<boolean>(dataViews[0].metadata.objects, 'chart', 'showGridLines', true),
                    isDateRange: (xAxisType == "date"),
                    xAxisFormat: xAxisLabelFormat,
                    legendPos: legendPos,
                    legendRowHeight: 14,
                    colorPalette: paletteId
                };
            }
            else {
                return viewModel;
            }
        }
        catch(e){
            return viewModel;
        }

    }

    export class Visual implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private Container: d3.Selection<SVGElement>;
        private dataView: DataView;
        private viewPort;
        private DualYAxisChartViewModel: DualYAxisChartViewModel;
        private svgRoot: d3.Selection<SVGElementInstance>;
        private svgGroupMain: d3.Selection<SVGElementInstance>;
        private padding: number = 12;
        private plot;
        private xScale;
        private y1Scale;
        private y2Scale;
        private selectionManager: ISelectionManager;
        private colorPalettes: colorPalette[];
        private tooltipServiceWrapper: ITooltipServiceWrapper;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.svgRoot = d3.select(options.element).append('svg').classed('controlChart', true);
            this.svgGroupMain = this.svgRoot.append("g").classed('Container', true);
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.CreateColorPalettes();

        }

        public update(options: VisualUpdateOptions) {
            // remove all existing SVG elements 
            this.svgGroupMain.selectAll("*").remove();
            this.svgRoot.empty();
            if (!options.dataViews[0]
                || !options.dataViews[0].categorical
                || !options.dataViews[0].categorical.categories
                || !options.dataViews[0].categorical.values)
                return;

            // get categorical data from visual data view
            this.dataView = options.dataViews[0];

            // convert categorical data into specialized data structure for data binding
            this.DualYAxisChartViewModel = visualTransform(options, this.host, this.colorPalettes);
            this.svgRoot
                .attr("width", options.viewport.width)
                .attr("height", options.viewport.height);

            this.viewPort = options.viewport;

            if (this.DualYAxisChartViewModel && this.DualYAxisChartViewModel.dataPoints[0]) {
                this.CreateAxes(options.viewport.width, options.viewport.height);
                this.CreateBorder();
                this.PlotData2(this.DualYAxisChartViewModel.dataPoints);                
                this.CreateLegend();
            }
        }

        private CreateAxes(viewPortWidth: number, viewPortHeight: number) {
            var y1AxisIndent = 84;
            var y2AxisIndent = 84;
            var topAxisIndent = 10;
            var bottomAxisIndent = 64;
            let viewModel = this.DualYAxisChartViewModel;
            var numLines = viewModel.dataPoints.length;
            var numLegendRows = Math.ceil(numLines / 5);
            var rowHeight = viewModel.legendRowHeight;

            switch (viewModel.legendPos) {
                case 'top':
                    topAxisIndent = topAxisIndent + rowHeight * numLegendRows;
                    break;
                case 'bottom':
                    bottomAxisIndent = bottomAxisIndent + rowHeight * numLegendRows;
                    break;
                case 'left':
                    y1AxisIndent = 150;
                    break;
                case 'right':
                    y2AxisIndent = 150;
                    break;
                case 'split':
                    y1AxisIndent = 150;
                    y2AxisIndent = 150;
                    break;
            }
            var plot = {
                y1AxisIndent: y1AxisIndent,
                y2AxisIndent: y2AxisIndent,
                topAxisIndent: topAxisIndent,
                bottomAxisIndent: bottomAxisIndent,
                width: viewPortWidth - (y1AxisIndent + y2AxisIndent),
                height: viewPortHeight - (bottomAxisIndent + topAxisIndent),
            };
            this.plot = plot;
            this.CreateXAxis();
            this.CreateY1Axis();
            this.CreateY2Axis();
        }

        private RotationTranslate(angle: number, label:any){
            var radAngle: number = angle * Math.PI/180;
            var sinAngle = Math.sin(radAngle);
            var lenText: number = label.toString().length;
            var textSize: number = this.DualYAxisChartViewModel.xAxis.AxisLabelSize;
            var xOffset: number = textSize * sinAngle;
            var yOffset: number = Math.abs(sinAngle) * lenText;
            return xOffset + "," + yOffset;
        }


        private CreateXAxis() {
            var plot = this.plot;
            this.svgGroupMain.attr({
                height: plot.height,
                width: plot.width,
                transform: 'translate(' + plot.y1AxisIndent + ',' + plot.topAxisIndent + ')'
            });

            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            let vmXaxis = viewModel.xAxis;
            this.GetMinMaxX();
            this.GetMinMaxX();
            var xScale;
            var xFormat;            
            if (viewModel.isDateRange) {
                xFormat = d3.time.format(viewModel.xAxisFormat);
                xScale = d3.time.scale()
                    .range([0, plot.width])
                    .domain([viewModel.minX, viewModel.maxX])
                    .nice();
            }
            else {
                xScale = d3.scale.linear()
                    .range([0, plot.width])
                    .domain([viewModel.minX, viewModel.maxX])
                    .nice();
                xFormat = d3.format(viewModel.xAxisFormat);                
            }       

            this.xScale = xScale;
           // this.svgRoot.selectAll('.axis').remove();
            // draw x axis
            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .tickPadding(8)
                .tickFormat(xFormat);

                var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                //.tickFormat(xFormat);
                .tickFormat(function (d) { return xFormat(d) });

            this.svgGroupMain
                .append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + plot.height + ')')
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "translate(" + this.RotationTranslate(vmXaxis.Rotation, function(d){return d.toString()}) + ")rotate(" + vmXaxis.Rotation + ")")// (180/ Math.PI) * Math.cos( Math.PI/180 * vmXaxis.Rotation)/2,0)})
                .style("text-anchor", "middle")
                .style('fill', vmXaxis.AxisLabelColor)
                .style("font-size", vmXaxis.AxisLabelSize + 'px')
                .style("font-family", vmXaxis.AxisLabelFont);
         
            this.svgGroupMain.append("text")
                .attr("y", plot.height + plot.bottomAxisIndent / 2 + this.padding)
                .attr("x", (plot.width / 2))
                .style("text-anchor", "middle")
                .style("font-size", vmXaxis.TitleSize + 'px')
                .style("fill", vmXaxis.TitleColor) 
                .style("font-family", vmXaxis.TitleFont)
                .text(vmXaxis.AxisTitle);
        }

        private CreateBorder() {
            var plot = this.plot;
            var borderPath = this.svgGroupMain.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", plot.height)
                .attr("width", plot.width)
                .style("stroke", "grey")
                .style("fill", this.DualYAxisChartViewModel.backgroundColor)
                .style("stroke-width", 1);
        }

        private CreateLegend() {
            var viewModel = this.DualYAxisChartViewModel;
            var plot = this.plot;
            var rowHeight = viewModel.legendRowHeight;
            var leftPos = 4;
            var topPos;
            this.svgRoot.selectAll(".legend").remove();
            switch (viewModel.legendPos) {
                case 'top':
                    leftPos = plot.y1AxisIndent;
                    topPos = this.padding / 2;
                    break;
                case 'bottom':
                    leftPos = plot.y1AxisIndent;
                    var numLines = viewModel.dataPoints.length;
                    var numLegendRows = Math.ceil(numLines / 5);
                    topPos = this.viewPort.height - viewModel.legendRowHeight * numLegendRows;
                    break;
                case 'left':
                    leftPos = 4;
                    topPos = plot.topAxisIndent;
                    break;
                case 'right':
                    leftPos = plot.width + plot.y1AxisIndent + plot.y2AxisIndent / 2 - this.padding;
                    topPos = plot.topAxisIndent;
                    break;
                case 'split':
                    topPos = plot.topAxisIndent;
                    break;
                case 'none':
                    break;
            }

            if (viewModel.legendPos == 'left' || viewModel.legendPos == 'right') {
                for (let i = 0; i < viewModel.dataPoints.length; i++) {
                    this.svgRoot.append("g")
                        .attr("class", "legend")
                        .append("rect")
                        .attr("x", leftPos)
                        .attr("y", topPos + i * rowHeight)
                        .attr("width", 10)
                        .attr("height", 10)
                        .style("fill", viewModel.dataPoints[i].color);
                    this.svgRoot.append("g")
                        .attr("class", "legend")
                        .append("text")
                        .attr("x", leftPos + 12)
                        .attr("y", topPos + 9 + i * rowHeight)
                        .text(viewModel.dataPoints[i].seriesName)
                        .style("fill", viewModel.dataPoints[i].color)
                        .on("click", function () {
                            // Determine if current line is visible 
                            var el = d3.select("#tag" + i.toString());
                            var op = el.style("opacity");
                            var newOpacity = op == '1' ? 0 : 1;
                            // Hide or show the elements based on the ID
                            d3.select("#tag" + i.toString())
                                .transition().duration(100)
                                .style("opacity", newOpacity);
                        });
                }
            }
            else {
                if (viewModel.legendPos == 'top' || viewModel.legendPos == 'bottom') {
                    var legendItemWidth = plot.width / 5;
                    var rowId = 0;
                    for (let i = 0; i < viewModel.dataPoints.length; i++) {
                        if (i > 0 && i % 5 == 0)
                            rowId++;
                        this.svgRoot.append("g")
                            .attr("class", "legend")
                            .append("rect")
                            .attr("x", leftPos + legendItemWidth * (i % 5))
                            .attr("y", topPos + rowId * rowHeight)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", viewModel.dataPoints[i].color);
                        this.svgRoot.append("g")
                            .attr("class", "legend")
                            .append("text")
                            .attr("x", leftPos + legendItemWidth * (i % 5) + 12)
                            .attr("y", topPos + 9 + rowId * rowHeight)
                            .text(viewModel.dataPoints[i].seriesName)
                            .style("fill", viewModel.dataPoints[i].color)
                            .on("click", function () {
                                // Determine if current line is visible 
                                var el = d3.select("#tag" + i.toString());
                                var op = el.style("opacity");
                                var newOpacity = op == '1' ? 0 : 1;
                                // Hide or show the elements based on the ID
                                d3.select("#tag" + i.toString())
                                    .transition().duration(100)
                                    .style("opacity", newOpacity);
                            })
                    }
                }
                else {
                    if (viewModel.legendPos == 'split') {
                        var rowY1Id = 0;
                        var rowY2Id = 0;
                        var leftStart = 0;
                        var rowId = 0;
                        for (let i = 0; i < viewModel.dataPoints.length; i++) {
                            if (viewModel.dataPoints[i].axis == 'y1') {
                                leftStart = leftPos;
                                rowId = rowY1Id;
                            }
                            else {
                                leftStart = plot.width + plot.y1AxisIndent + plot.y2AxisIndent / 2 - this.padding;
                                rowId = rowY2Id;
                            }

                            this.svgRoot.append("g")
                                .attr("class", "legend")
                                .append("rect")
                                .attr("x", leftStart)
                                .attr("y", topPos + rowId * rowHeight)
                                .attr("width", 10)
                                .attr("height", 10)
                                .style("fill", viewModel.dataPoints[i].color);
                            this.svgRoot.append("g")
                                .attr("class", "legend")
                                .append("text")
                                .attr("x", leftStart + 12)
                                .attr("y", topPos + 9 + rowId * rowHeight)
                                .text(viewModel.dataPoints[i].seriesName)
                                .style("fill", viewModel.dataPoints[i].color)
                                .on("click", function () {
                                    // Determine if current line is visible 
                                    var el = d3.select("#tag" + i.toString());
                                    var op = el.style("opacity");
                                    var newOpacity = op == '1' ? 0 : 1;
                                    // Hide or show the elements based on the ID
                                    d3.select("#tag" + i.toString())
                                        .transition().duration(100)
                                        .style("opacity", newOpacity);
                                });

                            if (viewModel.dataPoints[i].axis == 'y1')
                                rowY1Id = rowY1Id + 1;
                            else
                                rowY2Id = rowY2Id + 1;
                        }
                    }
                }
            }
        }

        private CreateY1Axis() {
            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            let vmYaxis = viewModel.yAxis;
            var y1Max: number = viewModel.maxY1;
            var y1Min: number = viewModel.minY1;
            var plot = this.plot;
            //get min and max for each categorical value set
            //find overall min and max
            if (y1Min < 0)
                y1Min = y1Min * 1.05;
            else
                y1Min = y1Min * 0.95;

            if (y1Max > 0)
                y1Max = y1Max * 1.05;
            else
                y1Max = y1Max * 0.95;
            //y1 axis
            var y1Scale = d3.scale.linear()
                .range([plot.height, 0])
                .domain([y1Min, y1Max])
                .nice();
            this.y1Scale = y1Scale;
            this.DualYAxisChartViewModel.minY1 = y1Min;
            this.DualYAxisChartViewModel.maxY1 = y1Max;
            var y1formatValue = d3.format(vmYaxis.AxisLabelFormat);
            var y1Axis = d3.svg.axis()
                .scale(y1Scale)
                .orient('left')
                .innerTickSize(8)
                .ticks(8)
                .tickFormat(function (d) { return y1formatValue(d) });

            this.svgGroupMain
                .append('g')
                .attr('class', 'y1 axis')
                .style('fill', vmYaxis.AxisLabelColor)
                .style("font-size", vmYaxis.AxisLabelSize + 'px')
                .style("font-family", vmYaxis.AxisLabelFont)
                .call(y1Axis);
            this.svgGroupMain.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - this.padding * 5)
                .attr("x", 0 - (plot.height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", vmYaxis.TitleSize + 'px')
                .style("fill", vmYaxis.TitleColor)
                .style("font-family", vmYaxis.TitleFont)
                .text(vmYaxis.AxisTitle);
                
        }

        private CreateY2Axis() {
            //y2 axis
            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            let vmXaxis = viewModel.xAxis;
            let vmY2axis = viewModel.y2Axis;
            var y2Max: number = viewModel.maxY2;
            var y2Min: number = viewModel.minY2;
            var plot = this.plot;
            //get y2Min and y2Max
            var y2Max: number = viewModel.maxY2;
            var y2Min: number = viewModel.minY2;
            if (y2Min < 0)
                y2Min = y2Min * 1.05;
            else
                y2Min = y2Min * 0.95;

            if (y2Max > 0)
                y2Max = y2Max * 1.05;
            else
                y2Max = y2Max * 0.95;
            var y2Scale = d3.scale.linear()
                .range([plot.height, 0])
                .domain([y2Min, y2Max])
                .nice();
            this.y2Scale = y2Scale;
            this.DualYAxisChartViewModel.minY2 = y2Min;
            this.DualYAxisChartViewModel.maxY2 = y2Max;
            var y2formatValue = d3.format(vmY2axis.AxisLabelFormat);
            var y2Axis = d3.svg.axis()
                .scale(y2Scale)
                .orient('right')
                .ticks(8)
                .tickFormat(function (d) { return y2formatValue(d) });
            this.svgGroupMain
                .append('g')
                .attr('class', 'y2 axis')
                .attr('transform', 'translate(' + plot.width + ',0)')
                .style('fill', vmY2axis.AxisLabelColor)
                .style("font-size", vmY2axis.AxisLabelSize + 'px')
                .style("font-family", vmY2axis.AxisLabelFont)
                .call(y2Axis);
            this.svgGroupMain.append("text")
                .attr("x", (plot.height / 2))
                .attr('transform', 'translate(' + (plot.width + this.padding * 5) + ',0) rotate(90)')
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", vmY2axis.TitleSize + 'px')
                .style("fill", vmY2axis.TitleColor)
                .style("font-family", vmY2axis.TitleFont)
                .text(vmY2axis.AxisTitle);
        }

        private GetMinMaxX() {
            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            let data = viewModel.dataPoints[0].AxisData
            var maxValue: any;
            var minValue: any;

            if (viewModel.isDateRange) {
                maxValue = new Date();
                minValue = new Date();
            }
            else {
                maxValue = new Number();
                minValue = new Number();
            }

            minValue = d3.min(data, function (d) { return d.xValue });
            maxValue = d3.max(data, function (d) { return d.xValue });

            this.DualYAxisChartViewModel.minX = minValue;
            this.DualYAxisChartViewModel.maxX = maxValue;
        }

        private PlotData2(series: series[]) {
            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            var xScale = this.xScale;
            var yScale;// = scale;
            for (let k = 0; k < series.length; k++) {
                // Line      
                if (series[k].axis == 'y1')
                    yScale = this.y1Scale;
                else
                    yScale = this.y2Scale;
                var d3line3 = d3.svg.line()
                    .x(function (d) { return xScale(d['xValue']) })
                    .y(function (d) { return yScale(d['yValue']) });
                let dp: any[] = series[k].AxisData;

                this.svgGroupMain.append("svg:path").classed('trend_Line', true)
                    .attr("d", d3line3(dp))
                    .attr("id", "tag" + k.toString())
                    .style("stroke-width", '1.5px')
                    .style({"stroke-dasharray": (viewModel.data.LineStyle) })
                    .style("stroke", series[k].color)
                    .style("fill", 'none');

                var dots = this.svgGroupMain.attr("id", "groupOfCircles").selectAll("dot")
                    .data(dp)
                    .enter().append("circle")
                    .style("fill", series[k].color)
                    //.attr("r", 4)
                    .attr("r", viewModel.marker.MarkerSize)
                    .attr("cx", function (d) { return xScale(d['xValue']); })
                    .attr("cy", function (d) { return yScale(d['yValue']); });
    
                this.CreateToolTip(dots, series[k].seriesName, series[k].color);
               
            }
        }

        private CreateToolTip(series: any, seriesName: string, color: string) {
            let viewModel = this.DualYAxisChartViewModel;
            var dateFormat;

            if (viewModel.isDateRange)
                dateFormat = d3.time.format(viewModel.xAxis.AxisLabelFormat);
            else
                dateFormat = d3.format(viewModel.xAxis.AxisLabelFormat);

            this.tooltipServiceWrapper.addTooltip(series,
                (tooltipEvent: TooltipEventArgs<number>) => Visual.getTooltipData(tooltipEvent.data, color, seriesName, dateFormat),
                (tooltipEvent: TooltipEventArgs<number>) => null);
        }

        private static getTooltipData(value: any, datacolor: string, seriesName: string, xFormat: any): VisualTooltipDataItem[] {
           return [{
                header: xFormat(value['xValue']).toString(),
                displayName: seriesName,
                value: value['yValue'].toString(),
                color: datacolor
            }];
        }

        /*['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0','#f0027f']
        ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02']
        ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c']
        ['#fbb4ae','#b3cde3','#ccebc5','#decbe4','#fed9a6','#ffffcc']
        ['#b3e2cd','#fdcdac','#cbd5e8','#f4cae4','#e6f5c9','#fff2ae']
        ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33']
        ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f']
        ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462']*/

        private CreateColorPalettes() {
            var palettes = [];
            let p: colorPalette = { name: '', colors: [''] };
            p = { name: "distinct", colors: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6'] };
            palettes.push(p);
            p = { name: "pastel1", colors: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'] };
            palettes.push(p);
            p = { name: "contrast", colors: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'] };
            palettes.push(p);
            p = { name: "pastel2", colors: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'] };
            palettes.push(p);
            this.colorPalettes = palettes;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var instances: VisualObjectInstance[] = [];
            var viewModel = this.DualYAxisChartViewModel;
            var objectName = options.objectName;        

            switch (objectName) {
                case 'chart':
                    var config: VisualObjectInstance = {
                        objectName: objectName,
                        selector: null,
                        properties: {
                            backgroundColor: viewModel.backgroundColor,
                            markerSize: viewModel.marker.MarkerSize,
                            lineStyle: viewModel.data.LineStyle,                          
                            legendPosition: viewModel.legendPos
                        },
                        validValues: {
                            markerSize: {
                                numberRange: {
                                    min: 1,
                                    max: 20
                                }
                            }
                        }
                    };
                    instances.push(config);
                    break;
                case 'xAxis':
                    var dateformat: string = "%d-%b-%y";
                    var numericformat: string = ".3s";
                    if(viewModel.isDateRange){
                        dateformat = viewModel.xAxisFormat;                        
                    }
                    else{
                        numericformat = viewModel.xAxisFormat;                        
                    }

                    var config: VisualObjectInstance = {
                        objectName: objectName,
                        selector: null,
                        properties: {
                            xAxisTitle: viewModel.xAxis.AxisTitle,
                            xAxisTitleColor: viewModel.xAxis.TitleColor,
                            xAxisTitleSize: viewModel.xAxis.TitleSize,
                            xAxisTitlefontFamily: viewModel.xAxis.TitleFont,
                            xAxisLabelColor: viewModel.xAxis.AxisLabelColor,
                            xAxisLabelSize: viewModel.xAxis.AxisLabelSize,
                            xAxisLabelfontFamily: viewModel.xAxis.AxisLabelFont,                                
                            xAxisLabelFormat: numericformat,
                            xAxisDateFormat: dateformat,
                            xAxisLabelRotation: viewModel.xAxis.Rotation
                        },
                        validValues: {
                            xAxisTitleSize: {
                                numberRange: {
                                    min: 4,
                                    max: 30
                                }
                            },
                            xAxisLabelSize: {
                                numberRange: {
                                    min: 4,
                                    max: 30
                                }
                            },
                            xAxisLabelRotation: {
                                numberRange:  {
                                    min: 0,
                                    max: 360
                                }
                            }
                        }
                    };
                    instances.push(config);
                    break;
                case 'yAxis':

                    var config: VisualObjectInstance = {
                        objectName: objectName,
                        selector: null,
                        properties: {
                            yAxisTitle: viewModel.yAxis.AxisTitle,
                            yAxisTitleColor: viewModel.yAxis.TitleColor,
                            yAxisTitleSize: viewModel.yAxis.TitleSize,
                            yAxisTitlefontFamily: viewModel.yAxis.TitleFont,
                            yAxisLabelColor: viewModel.yAxis.AxisLabelColor,
                            yAxisLabelSize: viewModel.yAxis.AxisLabelSize,                           
                            yAxisLabelfontFamily: viewModel.yAxis.AxisLabelFont,
                            yAxisLabelFormat: viewModel.yAxis.AxisLabelFormat
                        },
                        validValues: {
                            yAxisTitleSize: {
                                numberRange: {
                                    min: 4,
                                    max: 30
                                }
                            },
                            yAxisLabelSize: {
                                numberRange: {
                                    min: 4,
                                    max: 30
                                }
                            }
                        }
                    }
                    instances.push(config);
                    break;
                case 'y2Axis':
                var config: VisualObjectInstance = {
                    objectName: objectName,
                    selector: null,
                    properties: {
                        y2AxisTitle: viewModel.y2Axis.AxisTitle,
                        y2AxisTitleColor: viewModel.y2Axis.TitleColor,
                        y2AxisTitleSize: viewModel.y2Axis.TitleSize,
                        y2AxisTitlefontFamily: viewModel.y2Axis.TitleFont,
                        y2AxisLabelColor: viewModel.y2Axis.AxisLabelColor,
                        y2AxisLabelSize: viewModel.y2Axis.AxisLabelSize,                           
                        y2AxisLabelfontFamily: viewModel.y2Axis.AxisLabelFont,
                        y2AxisLabelFormat: viewModel.y2Axis.AxisLabelFormat
                    },
                    validValues: {
                        y2AxisTitleSize: {
                            numberRange: {
                                min: 4,
                                max: 30
                            }
                        },
                        y2AxisLabelSize: {
                            numberRange: {
                                min: 4,
                                max: 30
                            }
                        }
                    }
                }
                instances.push(config);
                break;
            }
            return instances;
        }
    }
}