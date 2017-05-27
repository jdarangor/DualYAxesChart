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
        y1DataPoints: series[];
        y2DataPoints: series[];
        minX: any;
        maxX: any;
        minY1: number;
        maxY1: number;
        minY2: number;
        maxY2: number;
        data: LineData;
        crossHairLine: CrossHairData;
        xAxis: AxisData;
        yAxis: AxisData;
        y2Axis: AxisData;
        showGridLines: boolean;
        isDateRange: boolean;
    };

    interface LineData {
        DataColor: string;
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
        * @property {Object} xvalue    - Data value for point. - date or number
        * @property {number} yValue            - y axis value.
        */
    interface ChartDataPoint {
        xValue: any;
        yValue: number;
    };


    interface series {
        AxisData: ChartDataPoint[];
        color: string;
    }

    interface CrossHairData {
        text?: string;
        textSize: number;
        textFont?: any;
        textColor: string;
        lineColor: string;
        lineStyle: string;
        show: boolean;
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
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): DualYAxisChartViewModel {
        let dataViews = options.dataViews;
        let viewModel: DualYAxisChartViewModel = {
            y1DataPoints: [],
            y2DataPoints: [],
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
            crossHairLine: null,
            showGridLines: true,
            isDateRange: true
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
        var minY1: number;
        var maxY1: number;
        var minY2: number;
        var maxY2: number;

        let colorPalette: IColorPalette = host.colorPalette;

        for (let k = 0; k < categorical.values.length; k++) {  //1,2..
            seriesDataPoints = [];
            var dpColor = colorPalette.getColor(  k.toString()).value;

            for (let i = 0; i < categorical.values[k].values.length; i++) {
                seriesDataPoints.push({ xValue: <number>categorical.categories[0].values[i], yValue: <number>categorical.values[k].values[i] });
            }

            if (categorical.values[k].source.roles['y2Value'] == true) {
                viewModel.y2DataPoints.push({ AxisData: seriesDataPoints, color: dpColor });
                if (isNaN(minY2)) 
                    minY2 = <number>categorical.values[k].minLocal;                
                if (isNaN(maxY2)) 
                    maxY2 = <number>categorical.values[k].maxLocal;                
                maxY2 = Math.max(<number>categorical.values[k].maxLocal, maxY2);
                minY2 = Math.min(<number>categorical.values[k].minLocal, minY2);
            }
            else
                if (categorical.values[k].source.roles['y1Value'] = true) {
                    viewModel.y1DataPoints.push({ AxisData: seriesDataPoints, color: dpColor });
                    if (isNaN(maxY1)) 
                        maxY1 = <number>categorical.values[k].maxLocal;                    
                    if (isNaN(minY1)) 
                        minY1 = <number>categorical.values[k].minLocal;                    
                    maxY1 = Math.max(<number>categorical.values[k].maxLocal, maxY1);
                    minY1 = Math.min(<number>categorical.values[k].minLocal, minY1);
                }
        }

        var isDateRange: boolean = (Object.prototype.toString.call(viewModel.y1DataPoints[0].AxisData[0].xValue) === '[object Date]');
        var xAxisFormat: any;
        if (isDateRange)
            xAxisFormat = getValue<string>(dataViews[0].metadata.objects, 'xAxis', 'xAxisFormat', '%d-%b-%y');
        else
            xAxisFormat = getValue<string>(dataViews[0].metadata.objects, 'xAxis', 'xAxisFormat', '.3s')

        let chartData: LineData = {
            DataColor: getFill(dataViews[0], 'chart', 'dataColor', '#FF0000'),
            LineColor: getFill(dataViews[0], 'chart', 'lineColor', '#0000FF'),
            LineStyle: getValue<string>(dataViews[0].metadata.objects, 'chart', 'lineStyle', '')
        };

        let xAxisData: AxisData = {
            AxisTitle: getValue<string>(dataViews[0].metadata.objects, 'xAxis', 'xAxisTitle', 'Default Value'),
            TitleColor: getFill(dataViews[0], 'xAxis', 'xAxisTitleColor', '#A9A9A9'),
            TitleSize: getValue<number>(dataViews[0].metadata.objects, 'xAxis', 'xAxisTitleSize', 12),
            AxisLabelSize: getValue<number>(dataViews[0].metadata.objects, 'xAxis', 'xAxisLabelSize', 12),
            AxisLabelColor: getFill(dataViews[0], 'xAxis', 'xAxisLabelColor', '#2F4F4F'),
            AxisFormat: xAxisFormat
        };
        let yAxisData: AxisData = {
            AxisTitle: getValue<string>(dataViews[0].metadata.objects, 'yAxis', 'yAxisTitle', 'Default Value'),
            TitleColor: getFill(dataViews[0], 'yAxis', 'yAxisTitleColor', '#A9A9A9'),
            TitleSize: getValue<number>(dataViews[0].metadata.objects, 'yAxis', 'yAxisTitleSize', 12),
            AxisLabelSize: getValue<number>(dataViews[0].metadata.objects, 'yAxis', 'yAxisLabelSize', 12),
            AxisLabelColor: getFill(dataViews[0], 'yAxis', 'yAxisLabelColor', '#2F4F4F'),
            AxisFormat: getValue<string>(dataViews[0].metadata.objects, 'yAxis', 'yAxisFormat', '.3s')
        };
        let y2AxisData: AxisData = {
            AxisTitle: getValue<string>(dataViews[0].metadata.objects, 'y2Axis', 'y2AxisTitle', 'Default Value'),
            TitleColor: getFill(dataViews[0], 'y2Axis', 'y2AxisTitleColor', '#A9A9A9'),
            TitleSize: getValue<number>(dataViews[0].metadata.objects, 'y2Axis', 'y2AxisTitleSize', 12),
            AxisLabelSize: getValue<number>(dataViews[0].metadata.objects, 'y2Axis', 'y2AxisLabelSize', 12),
            AxisLabelColor: getFill(dataViews[0], 'y2Axis', 'y2AxisLabelColor', '#2F4F4F'),
            AxisFormat: getValue<string>(dataViews[0].metadata.objects, 'y2Axis', 'y2AxisFormat', '.3s')
        };
        let crossHairData: CrossHairData = {
            lineColor: getFill(dataViews[0], 'crossHairs', 'crossHairLineColor', '#40E0D0'),
            textSize: getValue<number>(dataViews[0].metadata.objects, 'crossHairs', 'crossHairLabelSize', 10),
            show: getValue<boolean>(dataViews[0].metadata.objects, 'crossHairs', 'showCrossHairs', true),
            textColor: getFill(dataViews[0], 'crossHairs', 'crossHairLineColor', '#ADFF2F'),
            lineStyle: '4,4'
        };

        return {
            y1DataPoints: viewModel.y1DataPoints,
            y2DataPoints: viewModel.y2DataPoints,
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
            crossHairLine: crossHairData,
            showGridLines: getValue<boolean>(dataViews[0].metadata.objects, 'chart', 'showGridLines', true),
            isDateRange: isDateRange
        };
    }

    export class Visual implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private Container: d3.Selection<SVGElement>;
        private dataView: DataView;
        private DualYAxisChartViewModel: DualYAxisChartViewModel;
        private svgRoot: d3.Selection<SVGElementInstance>;
        private svgGroupMain: d3.Selection<SVGElementInstance>;
        private padding: number = 12;
        private plot;
        private xScale;
        private y1Scale;
        private y2Scale;
        private dots;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.svgRoot = d3.select(options.element).append('svg').classed('controlChart', true);
            this.svgGroupMain = this.svgRoot.append("g").classed('Container', true);
        }

        public update(options: VisualUpdateOptions) {
            var categorical = options.dataViews[0].categorical;
            if (typeof categorical.categories === "undefined" || typeof categorical.values === "undefined") {
                // remove all existing SVG elements 
                this.svgGroupMain.empty();
                return;
            }
            // get categorical data from visual data view
            this.dataView = options.dataViews[0];
            // convert categorical data into specialized data structure for data binding
            this.DualYAxisChartViewModel = visualTransform(options, this.host);
            this.svgRoot
                .attr("width", options.viewport.width)
                .attr("height", options.viewport.height);
            this.svgGroupMain.selectAll("*").remove();

            /// if (this.DualYAxisChartViewModel && this.DualYAxisChartViewModel.y1DataPoints[0]) {

            this.CreateAxes(options.viewport.width, options.viewport.height);
            this.PlotData(this.DualYAxisChartViewModel.y1DataPoints, this.y1Scale);
            this.PlotData(this.DualYAxisChartViewModel.y2DataPoints, this.y2Scale);

            // }
        }

        private CreateAxes(viewPortWidth: number, viewPortHeight: number) {
            var xAxisOffset = 54;
            var yAxisOffset = 54
            var plot = {
                xOffset: this.padding + xAxisOffset,
                yOffset: this.padding,
                width: viewPortWidth - (this.padding * 2) - (2 * xAxisOffset) - this.padding,
                height: viewPortHeight - (this.padding * 2) - yAxisOffset,
            };
            this.plot = plot;

            this.svgGroupMain.attr({
                height: plot.height,
                width: plot.width,
                transform: 'translate(' + plot.xOffset + ',' + plot.yOffset + ')'
            });

            var borderPath = this.svgGroupMain.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", plot.height)
                .attr("width", plot.width)
                .style("stroke", "grey")
                .style("fill", "none")
                .style("stroke-width", 1);

            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            let vmXaxis = viewModel.xAxis;
            let vmYaxis = viewModel.yAxis;
            let vmY2axis = viewModel.y2Axis;
            this.GetMinMaxX();
            var xScale;
            var dateFormat;
            dateFormat = d3.time.format(vmXaxis.AxisFormat);

            if (viewModel.isDateRange) {
                xScale = d3.time.scale()
                    .range([0, plot.width])
                    .domain([viewModel.minX, viewModel.maxX]);
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
              //      .innerTickSize(-plot.height)
                .tickPadding(14)
                
                .tickFormat(dateFormat);
         /*   if (!viewModel.showGridLines) {
                xAxis.innerTickSize(0);
            }
*/
            this.svgGroupMain
                .append('g')
                .attr('class', 'x axis')
                .style('fill', vmXaxis.AxisLabelColor)
                .attr('transform', 'translate(0,' + plot.height + ')')
                .call(xAxis)
                .style("font-size", vmXaxis.AxisLabelSize + 'px');
              var xGridlineAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient('bottom')
                  .innerTickSize(8)
                  .tickPadding(10)
                  .outerTickSize(6);
              this.svgGroupMain
                  .append('g')
                  .attr('class', 'gridLine')
                  .attr('transform', 'translate(0,' + plot.height + ')')
                  .call(xGridlineAxis)
                 .style("font-size", '0px');

            //get y2Min and y2Max
            var y1Max: number = viewModel.maxY1;
            var y1Min: number = viewModel.minY1;
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
                .innerTickSize(8)// plot.width)
                .ticks(8)
                // .tickPadding(10)
                .tickFormat(function (d) { return y1formatValue(d) });
            /* if (!viewModel.showGridLines) {
                 y1Axis
                     .innerTickSize(0)
                     .tickPadding(10);
             }*/
            this.svgGroupMain
                .append('g')
                .attr('class', 'y1 axis')
                .style('fill', vmYaxis.AxisLabelColor)
                .style("font-size", vmYaxis.AxisLabelSize + 'px')
                .call(y1Axis);

            /* var y1GridlineAxis = d3.svg.axis()
                 .scale(y1Scale)
                 .orient('left')
                 .innerTickSize(8)
                 .tickPadding(10)
                 .outerTickSize(6);
 
             this.svgGroupMain
                 .append('g')
                 .attr('class', 'gridLine')
                 .call(y1GridlineAxis)
                 .style("font-size", '0px');*/

            //y2 axis
            //get y2Min and y2Max
            //  alert(viewModel.maxY2.toString());
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
                // .innerTickSize(plot.width)
                .ticks(8)
                // .tickPadding(10)
                .tickFormat(function (d) { return y2formatValue(d) });

            this.svgGroupMain
                .append('g')
                .attr('class', 'y2 axis')
                .attr('transform', 'translate(' + plot.width + ',0)')
                .style('fill', vmY2axis.AxisLabelColor)
                .style("font-size", vmY2axis.AxisLabelSize + 'px')
                .call(y2Axis);

            /* var y2GridlineAxis = d3.svg.axis()
                 .scale(y2Scale)
                 .orient('left')
                 .innerTickSize(8)
                 .tickPadding(10)
                 .outerTickSize(6);
 
             this.svgGroupMain
                 .append('g')
                 .attr('class', 'gridLine')
                  .attr('transform', 'translate(' + plot.width + ',0)')
                 .call(y2GridlineAxis)
                 .style("font-size", '0px');*/

            this.svgGroupMain.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - xAxisOffset)
                .attr("x", 0 - (plot.height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", vmYaxis.TitleSize + 'px')
                .style("fill", vmYaxis.TitleColor)
                .text(vmYaxis.AxisTitle);
            this.svgGroupMain.append("text")
                .attr("x", (plot.height / 2))
                .attr('transform', 'translate(' + (plot.width + xAxisOffset) + ',0) rotate(90)')
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", vmY2axis.TitleSize + 'px')
                .style("fill", vmY2axis.TitleColor)
                .text(vmY2axis.AxisTitle);
            this.svgGroupMain.append("text")
                .attr("y", plot.height + yAxisOffset)
                .attr("x", (plot.width / 2))
                .style("text-anchor", "middle")
                .style("font-size", vmXaxis.TitleSize + 'px')
                .style("fill", vmXaxis.TitleColor)
                .text(vmXaxis.AxisTitle);
        }

        private GetMinMaxX() {
            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            let data = viewModel.y1DataPoints[0].AxisData
            var maxValue: any;
            var minValue: any;

            if (viewModel.isDateRange) {
                maxValue = new Date(data[0].xValue);
                minValue = new Date(data[0].xValue);
            }
            else {
                maxValue = new Number(data[0].xValue);
                minValue = new Number(data[0].xValue);
            }
            for (var i in data) {
                var dt = data[i].xValue;
                if (maxValue < dt) {
                    maxValue = dt;
                }
                if (minValue > dt) {
                    minValue = dt;
                }
            }
            this.DualYAxisChartViewModel.minX = minValue;
            this.DualYAxisChartViewModel.maxX = maxValue;
        }

        private PlotData(series: series[], scale: any) {
            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            for (let k = 0; k < series.length; k++) {
                // Line      
                var xScale = this.xScale;
                var yScale = scale;
                var d3line3 = d3.svg.line()
                    .x(function (d) { return xScale(d['xValue']) })
                    .y(function (d) { return yScale(d['yValue']) });
                let dp: any[] = series[k].AxisData;

                this.svgGroupMain.append("svg:path").classed('trend_Line', true)
                    .attr("d", d3line3(dp))
                    .style("stroke-width", '1.5px')
                    .style({ "stroke": series[k].color })
                    .style("fill", 'none');
            }
        }

        private DrawCrossHairs() {
            let viewModel: DualYAxisChartViewModel = this.DualYAxisChartViewModel;
            let crossHairLine = viewModel.crossHairLine;
            var xScale = this.xScale;
            var yScale = this.y1Scale;
            var y2Scale = this.y2Scale;

            //add focus lines and circle
            var plot = this.plot;
            var point = [];
            /*for (let i = 0; i < viewModel.dataPoints.length; i++) {
                var ob = viewModel.dataPoints[i];
                var dtDate: any = new Date(ob.xValue);
                var x = ob.xValue;
                var y = ob.yValue;
                //creating line points                         
                point.push([x, y]);
            }*/
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
            focus.append('line')
                .attr('id', 'focusLineY')
                .attr('class', 'focusLine');
            focus.append("text")
                .attr('id', 'labelText')
                .attr("x", 9)
                .attr("dy", ".35em");
            focus.append("text")
                .attr('id', 'yAxisText')
                .attr("dy", ".35em");
            focus.append("text")
                .attr('id', 'xAxisText')
                .attr("dx", ".15em");
            // append the rectangle to capture mouse
            this.svgGroupMain.append("rect")
                .attr("width", plot.width)
                .attr("height", plot.height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseover", function () { focus.style("display", null); })
                .on("mouseout", function () { focus.style("display", "none"); })
                .on("mousemove", mousemove);
            var bisectDate = d3.bisector(function (d) { return d[0]; }).left;

            function mousemove() {
                var x0 = xScale.invert(d3.mouse(this)[0]);
                var i = bisectDate(point, x0)
                var d0 = point[i - 1];
                var d1 = point[i];
                var d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;
                var x = xScale(d[0]);
                var y = yScale(d[1]);

                focus.select('#focuscircle')
                    .attr('cx', x)
                    .attr('cy', y);

                var xDomain;// = [viewModel.minX, viewModel.maxX];
                var yDomain;// = ([viewModel.minY, viewModel.maxY]);
                var yScale2 = d3.scale.linear().range([plot.height, 0]).domain(yDomain);

                focus.select('#focusLineX')
                    .attr('x1', x).attr('y1', yScale2(yDomain[0]))
                    .attr('x2', x).attr('y2', yScale2(yDomain[1]))
                    .style("stroke", crossHairLine.lineColor);
                focus.select('#focusLineY')
                    .attr('x1', xScale(xDomain[0])).attr('y1', y)
                    .attr('x2', xScale(xDomain[1])).attr('y2', y)
                    .style("stroke", crossHairLine.lineColor);

                var dateFormat;
                if (viewModel.isDateRange)
                    dateFormat = d3.time.format(viewModel.xAxis.AxisFormat);
                else
                    dateFormat = d3.format(viewModel.xAxis.AxisFormat);

                focus.select('#yAxisText')
                    .text(d[1].toString())
                    .attr("y", y)
                    .style("text-anchor", "end")
                    .attr("dx", "-.15em")
                    .style("font-size", crossHairLine.textSize + 'px')
                    .style("fill", crossHairLine.textColor);

                focus.select('#xAxisText')
                    .text(dateFormat(d[0]).toString())
                    .attr("y", plot.height)
                    .attr("x", x)
                    .style("text-anchor", "middle")
                    .attr("dy", ".95em")
                    .style("font-size", crossHairLine.textSize + 'px')
                    .style("fill", crossHairLine.textColor);
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
                            dataColor: viewModel.data.DataColor,
                            lineColor: viewModel.data.LineColor,
                            lineStyle: viewModel.data.LineStyle,
                            showGridLines: viewModel.showGridLines
                        }
                    };
                    instances.push(config);
                    break;
                case 'xAxis':
                    var config: VisualObjectInstance = {
                        objectName: objectName,
                        selector: null,
                        properties: {
                            xAxisTitle: viewModel.xAxis.AxisTitle,
                            xAxisTitleColor: viewModel.xAxis.TitleColor,
                            xAxisTitleSize: viewModel.xAxis.TitleSize,
                            xAxisLabelColor: viewModel.xAxis.AxisLabelColor,
                            xAxisLabelSize: viewModel.xAxis.AxisLabelSize,
                            xAxisFormat: viewModel.xAxis.AxisFormat
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
                case 'crossHairs':
                    var config: VisualObjectInstance = {
                        objectName: objectName,
                        selector: null,
                        properties: {
                            crossHairLineColor: viewModel.crossHairLine.lineColor,
                            crossHairLabelSize: viewModel.crossHairLine.textSize,
                            showCrossHairs: viewModel.crossHairLine.show
                        }
                    };
                    instances.push(config);
                    break;
            }
            return instances;
        }
    }
}