<!-- https://observablehq.com/@d3/choropleth -->
<!-- https://gka.github.io/palettes/#/13|s|788ef5,e7e4ff,efd6fb|ffffe0,ff005e,93003a|1|1 -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/queue.v1.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/topojson.v1.min.js"></script>
</head>

<!-- CSS -->
<style>
    path {
        stroke: white;
        stroke-width: 1px;
    }

    body {
        font-family: 'Proxima Nova', sans-serif;
    }

    .county {
        font: 14px sans-serif;
        font-weight: bold;
    }

    .legend {
        font-size: 14px;
        font-family: 'Proxima Nova', sans-serif;
    }

    .legend_title {
        font-size: 14px;
        font-family: 'Proxima Nova', sans-serif;
        font-weight: bold;
    }

    div.tooltip {
        position: absolute;
        left: 75px;
        text-align: center;
        height: 16px;
        padding: 10px;
        font-size: 14px;
        background: #FFFFFF;
        border: 1px solid #989898;
        pointer-events: none;
    }

    p {
        font-family: 'Proxima Nova', sans-serif;
        font-size: 10px;
        margin: 20px 0 0 10px;
    }

    @media (max-width: 400px) {
        .d3map {
            display: none;
        }
    }
</style>

<body>
    <h1>County wise population in the USA</h1>
    <script type="text/javascript">
        var width = 960, height = 600;
        
        var color_domain = [500, 10000, 30000, 50000, 70000, 90000, 120000, 200000, 300000, 500000, 700000, 900000]
        var ext_color_domain = [0, 500, 10000, 30000, 50000, 70000, 90000, 120000, 200000, 300000, 500000, 700000, 900000]
        var legend_labels = ["< 500", "500+", "10000+", "30000+", "50000+", "70000+", "90000+", "120000+", "200000+", "300000+", "500000+", "700000+", "900000+"]
        var color = d3.scale.threshold()
            .domain(color_domain)
            .range(['#dad9f4', '#d3d2fa', '#cbcbfa', '#c4c5fa', '#bcbffa', '#b4b8fa', '#adb2f9', '#a4acf9', '#9ca6f8', '#94a0f7', '#8b9af7', '#8294f6', '#788ef5'])
            //.range(['#788ef5', '#8294f6', '#8b9af7', '#94a0f7', '#9ca6f8', '#a4acf9', '#adb2f9', '#b4b8fa', '#bcbffa', '#c4c5fa', '#cbcbfa', '#d3d2fa', '#dad9f4'])

        //var color =d3.scaleQuantize([1, 10], d3.schemeBlues[9])

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("margin", "-15px auto");
        var path = d3.geo.path()

        queue()
            .defer(d3.json, "states.json")
            .defer(d3.csv, "us_county.csv")
            .await(ready);

        function ready(error, us, data) {
            var pairRateWithId = {};
            var pairNameWithId = {};

            //Moves selction to front
            d3.selection.prototype.moveToFront = function () {
                return this.each(function () {
                    this.parentNode.appendChild(this);
                });
            };

            //Moves selction to back
            d3.selection.prototype.moveToBack = function () {
                return this.each(function () {
                    var firstChild = this.parentNode.firstChild;
                    if (firstChild) {
                        this.parentNode.insertBefore(this, firstChild);
                    }
                });
            };



            data.forEach(function (d) {
                d.population = +d.population;
                pairRateWithId[d.id] = +d.population;
                pairNameWithId[d.id] = d.county;
            });

            console.log(data)

            var min1 = d3.min(data, function (d) { return d.population; });
            var max1 = d3.max(data, function (d) { return d.population; });

            console.log(us)


            svg.append("g")
                .attr("class", "county")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.counties).features)
                .enter().append("path")
                .attr("d", path)
                .style("fill", function (d) {
                    return color(pairRateWithId[d.id]);
                })
                .style("opacity", 0.8)
                .on("mouseover", function (d) {
                    var sel = d3.select(this);
                    sel.moveToFront();
                    d3.select(this).transition().duration(300).style({ 'opacity': 1, 'stroke': 'black', 'stroke-width': 1.5 });
                    div.transition().duration(300)
                        .style("opacity", 1)
                    div.text(pairNameWithId[d.id] + ": " + pairRateWithId[d.id])
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 30) + "px");
                })
                .on("mouseout", function () {
                    var sel = d3.select(this);
                    sel.moveToBack();
                    d3.select(this)
                        .transition().duration(300)
                        .style({ 'opacity': 0.8, 'stroke': 'white', 'stroke-width': 1 });
                    div.transition().duration(300)
                        .style("opacity", 0);
                })

        };

        var legend = svg.selectAll("g.legend")
            .data(ext_color_domain)
            .enter().append("g")
            .attr("class", "legend");

        var ls_w = 73, ls_h = 20;

        legend.append("rect")
            .attr("x", function (d, i) { return width - (i * ls_w) - ls_w; })
            .attr("y", 550)
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function (d, i) { return color(d); })
            .style("opacity", 0.8);

        legend.append("text")
            .attr("x", function (d, i) { return width - (i * ls_w) - ls_w; })
            .attr("y", 590)
            .text(function (d, i) { return legend_labels[i]; });

        var legend_title = "Legand";

        svg.append("text")
            .attr("x", 10)
            .attr("y", 540)
            .attr("class", "legend_title")
            .text(function () { return legend_title });

    </script>
</body>

</html>