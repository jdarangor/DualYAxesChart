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
        xAxis: AxisData;
        yAxis: AxisData;
        y2Axis: AxisData;
        showGridLines: boolean;
        isDateRange: boolean;
        legendPos: string;
        legendRowHeight: number;
        colorPalette: number;
    };

    interface LineData {
        DataColor?: string;
        LineColor: string;
        LineStyle: string;
    }

    interface AxisData {
        AxisTitle: string;
        TitleSize: number;
        TitleFont?: string;
        TitleColor: string;
        AxisLabelSize: number;
        AxisLabelFont?: string;
        AxisLabelColor: string;
        AxisFormat: any;
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
        
            if (category.source.type.dateTime.valueOf() == true || category.source.type.numeric.valueOf() == true) {
                if (category.source.type.dateTime.valueOf() == true)
                    xAxisType = "date";
                else
                    if(category.source.type.numeric.valueOf() == true)
                        xAxisType = "numeric";
            }

            if (xAxisType != "NotUsable") {
                var xAxisFormat: any;
                if (xAxisType == "date")
                    xAxisFormat = getValue<string>(dvmobjs, 'xAxis', 'xAxisDateFormat', '%d-%b-%y');
                else
                    xAxisFormat = getValue<string>(dvmobjs, 'xAxis', 'xAxisFormat', '.3s')

                let chartData: LineData = {
                    LineColor: getFill(dataViews[0], 'chart', 'lineColor', '#0000FF'),
                    LineStyle: getValue<string>(dvmobjs, 'chart', 'lineStyle', '')
                };
                let xAxisData: AxisData = {
                    AxisTitle: getValue<string>(dvmobjs, 'xAxis', 'xAxisTitle', 'Default Value'),
                    TitleColor: getFill(dataViews[0], 'xAxis', 'xAxisTitleColor', '#A9A9A9'),
                    TitleSize: getValue<number>(dvmobjs, 'xAxis', 'xAxisTitleSize', 12),
                    AxisLabelSize: getValue<number>(dvmobjs, 'xAxis', 'xAxisLabelSize', 12),
                    AxisLabelColor: getFill(dataViews[0], 'xAxis', 'xAxisLabelColor', '#2F4F4F'),
                    AxisFormat: xAxisFormat
                };
                let yAxisData: AxisData = {
                    AxisTitle: getValue<string>(dvmobjs, 'yAxis', 'yAxisTitle', 'Default Value'),
                    TitleColor: getFill(dataViews[0], 'yAxis', 'yAxisTitleColor', '#A9A9A9'),
                    TitleSize: getValue<number>(dvmobjs, 'yAxis', 'yAxisTitleSize', 12),
                    AxisLabelSize: getValue<number>(dvmobjs, 'yAxis', 'yAxisLabelSize', 12),
                    AxisLabelColor: getFill(dataViews[0], 'yAxis', 'yAxisLabelColor', '#2F4F4F'),
                    AxisFormat: getValue<string>(dvmobjs, 'yAxis', 'yAxisFormat', '.3s')
                };
                let y2AxisData: AxisData = {
                    AxisTitle: getValue<string>(dvmobjs, 'y2Axis', 'y2AxisTitle', 'Default Value'),
                    TitleColor: getFill(dataViews[0], 'y2Axis', 'y2AxisTitleColor', '#A9A9A9'),
                    TitleSize: getValue<number>(dvmobjs, 'y2Axis', 'y2AxisTitleSize', 12),
                    AxisLabelSize: getValue<number>(dvmobjs, 'y2Axis', 'y2AxisLabelSize', 12),
                    AxisLabelColor: getFill(dataViews[0], 'y2Axis', 'y2AxisLabelColor', '#2F4F4F'),
                    AxisFormat: getValue<string>(dvmobjs, 'y2Axis', 'y2AxisFormat', '.3s')
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
                    xAxis: xAxisData,
                    yAxis: yAxisData,
                    y2Axis: y2AxisData,
                    showGridLines: getValue<boolean>(dataViews[0].metadata.objects, 'chart', 'showGridLines', true),
                    isDateRange: (xAxisType == "date"),
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
                this.PlotData2(this.DualYAxisChartViewModel.dataPoints);
                this.CreateBorder();
                this.CreateLegend();
                this.DrawToolTip();
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
            var xScale;
            var dateFormat;

            if (viewModel.isDateRange) {
                xScale = d3.time.scale()
                    .range([0, plot.width])
                    .domain([viewModel.minX, viewModel.maxX]);
                dateFormat = d3.time.format(vmXaxis.AxisFormat);
            }
            else {
                xScale = d3.scale.linear()
                    .range([0, plot.width])
                    .domain([viewModel.minX, viewModel.maxX]);
                dateFormat = d3.format(vmXaxis.AxisFormat);
            }

            this.xScale = xScale;
            this.svgRoot.selectAll('.axis').remove();
            // draw x axis
            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .tickPadding(8)
                .tickFormat(dateFormat);

            this.svgGroupMain
                .append('g')
                .attr('class', 'x axis')
                .style('fill', vmXaxis.AxisLabelColor)
                .attr('transform', 'translate(0,' + plot.height + ')')
                .call(xAxis)
                .style("font-size", vmXaxis.AxisLabelSize + 'px');
            this.svgGroupMain.append("text")
                .attr("y", plot.height + plot.bottomAxisIndent / 2 + this.padding)
                .attr("x", (plot.width / 2))
                .style("text-anchor", "middle")
                .style("font-size", vmXaxis.TitleSize + 'px')
                .style("fill", vmXaxis.TitleColor)
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
                .style("fill", "none")
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
            let vmXaxis = viewModel.xAxis;
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
            var y1formatValue = d3.format(vmYaxis.AxisFormat);
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
                .call(y1Axis);
            this.svgGroupMain.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - this.padding * 5)
                .attr("x", 0 - (plot.height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", vmYaxis.TitleSize + 'px')
                .style("fill", vmYaxis.TitleColor)
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
            var y2formatValue = d3.format(vmY2axis.AxisFormat);
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
                .call(y2Axis);
            this.svgGroupMain.append("text")
                .attr("x", (plot.height / 2))
                .attr('transform', 'translate(' + (plot.width + this.padding * 5) + ',0) rotate(90)')
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", vmY2axis.TitleSize + 'px')
                .style("fill", vmY2axis.TitleColor)
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
                    .style("stroke", series[k].color)
                    .style("fill", 'none');

                var dots = this.svgGroupMain.attr("id", "groupOfCircles").selectAll("dot")
                    .data(dp)
                    .enter().append("circle")
                    .style("fill", 'transparent')
                    .attr("r", 4)
                    .attr("cx", function (d) { return xScale(d['xValue']); })
                    .attr("cy", function (d) { return yScale(d['yValue']); });

                this.CreateToolTip(dots, series[k].seriesName, series[k].color);
            }

        }

        private CreateToolTip(series: any, seriesName: string, color: string) {
            let viewModel = this.DualYAxisChartViewModel;
            var dateFormat;
            if (viewModel.isDateRange)
                dateFormat = d3.time.format(viewModel.xAxis.AxisFormat);
            else
                dateFormat = d3.format(viewModel.xAxis.AxisFormat);

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

        private DrawToolTip() {
            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            //     let crossHairLine = viewModel.crossHairLine;
            var xScale = this.xScale;

            //add focus lines and circle
            var plot = this.plot;
            var point = [];
            for (let i = 0; i < viewModel.dataPoints.length; i++) {
                var ob = viewModel.dataPoints[i];
                //  var dtDate: any = new Date(ob.xValue);
                var x = ob.AxisData[0].xValue[i];
                //var y = ob.AxisData[0].yValue[i];
                //creating line points                         
                point.push([x]);
            }


            var focus = this.svgGroupMain.append("g")
                .style("display", "none");
            focus.append("circle")
                .attr("class", "y")
                .style("fill", "none")
                .style("stroke", "red")
                .attr("id", "focuscircle")
                .attr("r", 4);
            focus.append('line')
                .attr('id', 'focusLineX')
                .attr('class', 'focusLine');
           /* focus.append('line')
                .attr('id', 'focusLineY')
                .attr('class', 'focusLine');
            focus.append("text")
                .attr('id', 'labelText')
                .attr("x", 9)
                .attr("dy", ".35em");
            focus.append("text")
                .attr('id', 'yAxisText')
                .attr("dy", ".35em");*/
            focus.append("text")
                .attr('id', 'xAxisText')
                .attr("dx", ".15em");
            // append the rectangle to capture mouse
            this.svgGroupMain.append("rect")
                .attr("width", plot.width)
                .attr("height", plot.height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseover", function () { focus.style("display", "null"); })
                .on("mouseout", function () { focus.style("display", "none"); })
                .on("mousemove", mousemove);
            var bisectDate = d3.bisector(function (d) { return d[0]; }).left;

            function mousemove() {
                //alert(d3.mouse(this)[1].toString());      
                var x0 = xScale.invert(d3.mouse(this)[0]);
            /*    var i = bisectDate(point, x0)
                var d0 = point[i - 1];
                var d1 = point[i];
                var d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;*/
                var x = 10;// xScale(40);
                var y = 200;//y1Scale(d[1]);
                /*focus.select('#focuscircle')
                    .attr('cx', 0) 
                    .attr('cy', 1000);*/
            
                var yDomain = ([viewModel.minY1, viewModel.maxY1]);
                var yScale2 = d3.scale.linear().range([plot.height, 0]).domain(yDomain);

               focus.select('#focusLineX')
                            .attr('x1', x).attr('y1', yScale2(yDomain[0]))
                            .attr('x2', x).attr('y2', yScale2(yDomain[1]))
                            .style("stroke", 'red');
               
            }
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
                            lineColor: viewModel.data.LineColor,
                            lineStyle: viewModel.data.LineStyle,
                            showGridLines: viewModel.showGridLines,
                            legendPosition: viewModel.legendPos
                        }
                    };
                    instances.push(config);
                    break;
                case 'xAxis':
                    if (!viewModel.isDateRange) {

                        var config: VisualObjectInstance = {
                            objectName: objectName,
                            selector: null,
                            properties: {
                                xAxisTitle: viewModel.xAxis.AxisTitle,
                                xAxisTitleColor: viewModel.xAxis.TitleColor,
                                xAxisTitleSize: viewModel.xAxis.TitleSize,
                                xAxisLabelColor: viewModel.xAxis.AxisLabelColor,
                                xAxisLabelSize: viewModel.xAxis.AxisLabelSize,
                                xAxisFormat: viewModel.xAxis.AxisFormat,
                            }
                        };
                    }
                    else {
                        var config: VisualObjectInstance = {
                            objectName: objectName,
                            selector: null,
                            properties: {
                                xAxisTitle: viewModel.xAxis.AxisTitle,
                                xAxisTitleColor: viewModel.xAxis.TitleColor,
                                xAxisTitleSize: viewModel.xAxis.TitleSize,
                                xAxisLabelColor: viewModel.xAxis.AxisLabelColor,
                                xAxisLabelSize: viewModel.xAxis.AxisLabelSize,
                                xAxisDateFormat: viewModel.xAxis.AxisFormat,
                            }
                        };
                    }
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
                            yAxisLabelColor: viewModel.yAxis.AxisLabelColor,
                            yAxisLabelSize: viewModel.yAxis.AxisLabelSize,
                            yAxisFormat: viewModel.yAxis.AxisFormat
                        }
                    };
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
                            y2AxisLabelColor: viewModel.y2Axis.AxisLabelColor,
                            y2AxisLabelSize: viewModel.y2Axis.AxisLabelSize,
                            y2AxisFormat: viewModel.y2Axis.AxisFormat
                        }
                    };
                    instances.push(config);
                    break;
                case 'yColorSelector':
                    var config: VisualObjectInstance = {
                        objectName: objectName,
                        selector: null,
                        properties: {
                            lineColor: viewModel.colorPalette,
                        },
                        validValues: {
                            lineColor: {
                                numberRange: {
                                    min: 0,
                                    max: this.colorPalettes.length - 1
                                }
                            }
                        }
                    };
                    instances.push(config);
                    break;
            }
            return instances;
        }
    }
}