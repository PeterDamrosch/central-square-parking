//////////////// MAP ////////////////

// Base layers

var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 21
});

var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var Hydda_Full = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
    attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});


// Initialize map

var map = new L.Map("map", {center: [42.36531, -71.10314], zoom: 17})
    .addLayer(CartoDB_Positron);

// Baselayer control for map
var baseLayers = {
    "Streets": CartoDB_Positron,
    "Satellite": Esri_WorldImagery,
    "Hydda": Hydda_Full
};

L.control.layers(baseLayers, null, {position: 'topleft'}).addTo(map);

// Global Zoomlevel for Map

var zoomLevel = 17;

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");


// Style globals
var good = "#00853F";
var medium = "#FDEF42";
var bad = "#E31B23";


function createMap(data) {

    // Mike Bostock transformation

    var transform = d3.geo.transform({point: projectPoint}),
        path = d3.geo.path().projection(transform);

    // Create paths

    var feature = g.selectAll("path")
        .data(data.features);

    // Enter paths - styling coming at the end with the buttons
    feature.enter().append("path")
        .attr("class", "block");

    // Style paths - default TotalAvg, later JQuery clicks will activate other time-based styles

    function setStyle(time) {
        feature.style("fill", function (d) {
            if (d.properties[time] <= 0.75) {
                return good;
            } else if (d.properties[time] > 0.75 && d.properties[time] <= 0.90) {
                return medium;
            } else if (d.properties[time] > 0.90) {
                return bad;
            }
        })
    }

    /* Commenting this out for a second
    setStyle("TotalAvg");
    */


    // Mike Bostock - reset leaflet view

    map.on("viewreset", reset);
    reset();

    // Reposition the SVG to cover the features.
    function reset() {
        var bounds = path.bounds(data),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        feature.attr("d", path);
    }

    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    //Create a Legend - from Mike Foster's Tutorial on DUSPviz
    // Create Leaflet Control Object for Legend
    var legend = L.control({position: 'topright'});

    // Function that runs when legend is added to map
    legend.onAdd = function (map) {

        // Create Div Element and Populate it with HTML
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML += '<b>Parking Availability</b><br />';
        div.innerHTML += '<b>In Central Square</b><br />';
        div.innerHTML += 'Avg. occupancy/area<br />';
        div.innerHTML += '<i style="background: #00853F"></i><p>< 75%</p>';
        div.innerHTML += '<i style="background: #FDEF42"></i><p>75-90%</p>';
        div.innerHTML += '<i style="background: #E31B23"></i><p>> 90%</p>';
        div.innerHTML += '<input type="checkbox" id="check4" name="radio"><label for="check4" class="buttons">4PM</label>';
        div.innerHTML += '<input type="checkbox" id="check5" name="radio"><label for="check5" class="buttons">5PM</label></b><br/>';
        div.innerHTML += '<input type="checkbox" id="check6" name="radio"><label for="check6" class="buttons">6PM</label>';
        div.innerHTML += '<input type="checkbox" id="check7" name="radio"><label for="check7" class="buttons">7PM</label></b><br/>';

        // Return the Legend div containing the HTML content
        return div;
    };

    // Add Legend to Map
    legend.addTo(map);

    // Set Styling

    function setStyle2(timeList, dateList) {
        // Get total number of passes from the days and times, for use in computing the average
        if (timeList.length == 0)
            return;
        
        var numberOfPasses = timeList.length * dateList.length;

        feature.style("fill", function (d) {
            var countableObservations = d.properties.Observations.filter(
                function(e) {return timeList.indexOf(e.Time) > -1 && dateList.indexOf(e.Date) > -1}
            );

            var totalCountableCars = 0;
            for (i=0; i < countableObservations.length; i++){
                totalCountableCars += countableObservations[i].Cars
            }

            var average = totalCountableCars / (numberOfPasses * d.properties.Meters);

            if (average <= 0.75) {
                return good;
            } else if (average > 0.75 && average <= 0.90) {
                return medium;
            } else if (average > 0.90) {
                return bad;
            }
        })
    }
    setStyle2([4,5,6,7],["Thursday", "Friday", "Saturday"])

    // JQuery Buttons
    $(document).ready(function(){
        // Check button values
        function checkButtons() {
            timeList = [];
            var checked4 = $('#check4').is(":checked");
            var checked5 = $('#check5').is(":checked");
            var checked6 = $('#check6').is(":checked");
            var checked7 = $('#check7').is(":checked");

            if (checked4) {timeList.push(4)}
            if (checked5) {timeList.push(5)}
            if (checked6) {timeList.push(6)}
            if (checked7) {timeList.push(7)}
            console.log(timeList);
            setStyle2(timeList, ["Thursday", "Friday", "Saturday"])
        }

        $("#check4").click(function() {
            console.log("click4works");
            checkButtons();
        });
        $("#check5").click(function() {
            console.log("click5works");
            checkButtons();
        });
        $("#check6").click(function() {
            console.log("click6works");
            checkButtons();
        });
        $("#check7").click(function() {
            console.log("click7works");
            checkButtons();
        })
        $("#checkTotal").click(function() {
            console.log("clickTotalworks");
            checkButtons();
            setStyle("TotalAvg")
        })
    });
}

// Load CSV
d3.json("data/Results4_JSON.json", function(error, meterCount) {
    if (error) throw error;
    for (i=0; i < meterCount.length; i++) {
        meterCount[i].Cars = +meterCount[i].Cars;
        meterCount[i].Meters = +meterCount[i].Meters;
        meterCount[i].Time = +meterCount[i].Time
    }
    console.log(meterCount);

    // Load Map

    d3.json("data/MeteredBlocks4_GEOJSON.geojson", function(error, dataset) {
        if (error) throw error;

        // A quickly hacked together geojson with data from the csv
        for (i=0; i < dataset.features.length; i++) {
            dataset.features[i].properties.Name = +dataset.features[i].properties.Name;
            dataset.features[i].properties.Total = 0;
            dataset.features[i].properties.Meters = 0;
            dataset.features[i].properties.Pre6 = 0;
            dataset.features[i].properties.Post6 = 0;
            dataset.features[i].properties.Hour4 = 0;
            dataset.features[i].properties.Hour5 = 0;
            dataset.features[i].properties.Hour6 = 0;
            dataset.features[i].properties.Hour7 = 0;
            dataset.features[i].properties.Observations = []

            for (k=0; k < meterCount.length; k++){
                if (meterCount[k].BlockID == dataset.features[i].properties.Name) {
                    dataset.features[i].properties.Observations.push(meterCount[k])
                    dataset.features[i].properties.Total += meterCount[k].Cars;
                    dataset.features[i].properties.Meters = meterCount[k].Meters;
                    if (meterCount[k].Time == 4){
                        dataset.features[i].properties.Pre6 += meterCount[k].Cars;
                        dataset.features[i].properties.Hour4 += meterCount[k].Cars;
                    } else if(meterCount[k].Time == 5) {
                        dataset.features[i].properties.Pre6 += meterCount[k].Cars;
                        dataset.features[i].properties.Hour5 += meterCount[k].Cars;
                    } else if(meterCount[k].Time == 6) {
                    dataset.features[i].properties.Post6 += meterCount[k].Cars;
                    dataset.features[i].properties.Hour6 += meterCount[k].Cars;
                    } else if(meterCount[k].Time == 7) {
                        dataset.features[i].properties.Post6 += meterCount[k].Cars;
                        dataset.features[i].properties.Hour7 += meterCount[k].Cars;
                    }
                }
            }

            // Calculate the averages from the total

            dataset.features[i].properties.TotalAvg = dataset.features[i].properties.Total / (12 * dataset.features[i].properties.Meters);
            dataset.features[i].properties.Pre6Avg = dataset.features[i].properties.Pre6 / (6 * dataset.features[i].properties.Meters);
            dataset.features[i].properties.Post6Avg = dataset.features[i].properties.Post6 / (6 * dataset.features[i].properties.Meters);
            dataset.features[i].properties.Hour4Avg = dataset.features[i].properties.Hour4 / (3 * dataset.features[i].properties.Meters);
            dataset.features[i].properties.Hour5Avg = dataset.features[i].properties.Hour5 / (3 * dataset.features[i].properties.Meters);
            dataset.features[i].properties.Hour6Avg = dataset.features[i].properties.Hour6 / (3 * dataset.features[i].properties.Meters);
            dataset.features[i].properties.Hour7Avg = dataset.features[i].properties.Hour7 / (3 * dataset.features[i].properties.Meters);
        }

        console.log(dataset);

        // Finally call createMap
        createMap(dataset)
    });
});
