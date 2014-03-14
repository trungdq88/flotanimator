/* jQuery Flot Animator version 1.0.

 Flot Animator is a free jQuery Plugin that will add fluid animations to Flot charts.

 Copyright (c) 2012-2013 Chtiwi Malek
 http://www.codicode.com/art/jquery_flot_animator.aspx

 Modified by Dinh Quang Trung (2014): support animate multiple series.

 Licensed under Creative Commons Attribution 3.0 Unported License.
 */

$.extend({
    plotAnimator: function (chart, data, g) {

        var plot;

        // Original data
        var oData = [];

        // Contains `data`  elements index, which are animated
        var series = [];

        // All series animation profile
        var seriesProfile = [];

        // Read series with animate profile
        for (var i = 0; i < data.length; i++) {
            if (data[i].animator) {
                series.push(i);
            }
        }

        // If no serie is selected, then animate all
        if (series.length == 0) {
            for (var i = 0; i < data.length; i++) {
                series.push(i);
            }
        }


        function pInit(arr, serie) {
            var x = [];
            x.push([arr[0][0], Math.max.apply(Math, arr.map(function (i) {
                return i[1];
            }))]);
            x.push([arr[0][0], null]);
            x.push([arr[0][0], Math.min.apply(Math, arr.map(function (i) {
                return i[1];
            }))]);
            for (var i = 0; i < arr.length; i++) {
                x.push([arr[i][0], null]);
            }
            data[serie].data = x;
        }



        // Prepare data for base drawing and save series profiles
        for (var i = 0; i < series.length; ++i) {
            var serie = series[i];

            var d0 = data[serie];
            oData[serie] = d0.data;

            pInit(oData[serie], serie);

            seriesProfile.push({
                index: serie,
                isLines: (data[serie].lines) ? true : false,
                steps: (data[serie].animator && data[serie].animator.steps) || 500,
                duration: (data[serie].animator && data[serie].animator.duration) || 2000,
                start: (data[serie].animator && data[serie].animator.start) || 0,
                dir: (data[serie].animator && data[serie].animator.direction) || "right"
            });
        }

        // Draw base
        plot = $.plot(chart, data, g);

        // Calc step data from profile
        for (var i = 0; i < seriesProfile.length; ++i) {
            var steps = seriesProfile[i].steps;
            seriesProfile[i].sData = stepData(oData[seriesProfile[i].index], steps);
        }


        /**
         * TODO: Make this function more abstract:
         * TODO: Get step data of a serial
         * @returns {Array}
         */
        function stepData(_oData, steps) {
            // Get config
            var Si = _oData[0][0];
            var Fi = _oData[_oData.length - 1][0];
            var Pas = (Fi - Si) / steps;

            // Define return variable
            var d2 = [];

            // Calculate data
            d2.push(_oData[0]);
            var nPointPos = 1;
            lPoint = _oData[0];
            nPoint = _oData[nPointPos];
            for (var i = Si + Pas; i < Fi + Pas; i += Pas) {
                if (i > Fi) {
                    i = Fi;
                }
                $("#m2").html(i);
                while (i > nPoint[0]) {
                    lPoint = nPoint;
                    nPoint = _oData[nPointPos++];
                }
                if (i == nPoint[0]) {
                    d2.push([i, nPoint[1]]);
                    lPoint = nPoint;
                    nPoint = _oData[nPointPos++];
                }
                else {
                    var a = ((nPoint[1] - lPoint[1]) / ((nPoint[0] - lPoint[0])));
                    curV = (a * i) + (lPoint[1] - (a * lPoint[0]));
                    d2.push([i, curV]);
                }
            }
            return d2;
        }

        // One step for all
        var step = 0;

        function plotData() {

            // Data holder (data to be drawn)
            step++;

            for (var i = 0; i < seriesProfile.length; ++i) {
                var d3 = [];
                switch (seriesProfile[i].dir) {
                    case 'right':
                        d3 = seriesProfile[i].sData.slice(0, step);
                        break;
                    case 'left':
                        d3 = seriesProfile[i].sData.slice(-1 * step);
                        break
                    case 'center':
                        d3 = seriesProfile[i].sData.slice((seriesProfile[i].sData.length / 2) - (step / 2), (seriesProfile[i].sData.length / 2) + (step / 2));
                        break;
                }

                // TODO: fix for non-line series
                if (!seriesProfile[i].isLines) {
                    inV = d3[0][0];
                    laV = d3[d3.length - 1][0];
                    d3 = [];

                    var d0 = data[seriesProfile[i].index];
                    var oData = d0.data;

                    for (var j = 0; j < oData.length; j++) {
                        if (oData[j][0] >= inV && oData[j][0] <= laV) {
                            d3.push(oData[j]);
                        }
                    }
                }
//                data[seriesProfile[i].index].data = (step < seriesProfile[i].steps) ? d3 : oData[seriesProfile[i].index];
                data[seriesProfile[i].index].data = d3;

            } // End for


            // TODO: currently the duration only will apply the first serial profile only. Let's make it more useful!
            plot.setData(data);
            plot.draw();

            // Do a loop, or stop
            if (step < seriesProfile[0].steps) {
                setTimeout(plotData, seriesProfile[0].duration / seriesProfile[0].steps);
            }
            else {
                // chart.trigger("animatorComplete");
            }
        }

        setTimeout(plotData, 500);
        return plot;
    }
});
