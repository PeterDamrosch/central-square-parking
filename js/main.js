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
    .addLayer(Hydda_Full);


var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

// Baselayer control for map
var baseLayers = {
    "Streets": CartoDB_Positron,
    "Satellite": Esri_WorldImagery,
    "Hydda": Hydda_Full
};

// Toggle baselayers - Good tutorial that explains this on leafletjs.com
L.control.layers(baseLayers, null, {position: 'topleft'}).addTo(map);

// Style globals - could do this with classes in CSS

var good = "#00853F";
var medium = "#FDEF42";
var bad = "#E31B23";

// Define colors

var colors1 = {
    "good": "#00853F",
    "medium": "#FDEF42",
    "bad": "#E31B23"
}

var colors2 = {
    "good": "#8c96c6",
    "medium": "#88419d",
    "bad": "#4d004b"
}

var colors3 = {
    "good": "#02B24B",
    "medium": "9400FF",
    "bad": "FFAA19"
}

var colors4 = {
    "good": "#1abc9c",
    "medium": "#9b59b6",
    "bad": "#e74c3c"
}

var mainColor = colors1;


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

    //Create a Legend - from Mike Foster's tutorial on DUSPviz

    // Create static part of the legend
    var legendStatic = L.control({position: 'topright'});

    // Create Leaflet Control Object for Legend
    var legend = L.control({position: 'topright'});
    legendStatic.onAdd =function(map) {

        return div;
    };

    // Add Legend to Map
    legend.addTo(map);

    // Function that runs when legend is added to map
    legend.onAdd = function (map) {

        // Create Div Element and Populate it with HTML
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML += '<div id="title"><b>Central Square Parking Survey<br/><small>4/14-4/16</div>';
        div.innerHTML += '<input type="radio" id="occupied" name="radio" checked="checked"><label for="avg" class="buttons"> Avg. occupancy</label>';
        div.innerHTML += '<input type="radio" id="regulations" name="radio"><label for="regulations" class="buttons"> Regulations</label></b><br/>';
        div.innerHTML += 'Avg. occupancy<br/>';
        div.innerHTML += '<i style="background: #00853F"></i><p>< 75%</p>';
        div.innerHTML += '<i style="background: #FDEF42"></i><p>75-90%</p>';
        div.innerHTML += '<i style="background: #E31B23"></i><p>> 90%</p>';
        div.innerHTML += '<div class="subtitle">Day</div>';
        div.innerHTML += '<input type="checkbox" id="checkThu" name="radio" checked="checked"><label for="checkThu" class="buttons">Thu</label>';
        div.innerHTML += '<input type="checkbox" id="checkFri" name="radio" checked="checked"><label for="checkFri" class="buttons">Fri</label>';
        div.innerHTML += '<input type="checkbox" id="checkSat" name="radio" checked="checked"><label for="checkSat" class="buttons">Sat</label></b><br/>';
        div.innerHTML += 'Time<br/>';
        div.innerHTML += '<input type="checkbox" id="check4" name="radio" checked="checked"><label for="check4" class="buttons">4PM</label>';
        div.innerHTML += '<input type="checkbox" id="check5" name="radio" checked="checked"><label for="check5" class="buttons">5PM</label>';
        div.innerHTML += '<input type="checkbox" id="check6" name="radio" checked="checked"><label for="check6" class="buttons">6PM</label>';
        div.innerHTML += '<input type="checkbox" id="check7" name="radio" checked="checked"><label for="check7" class="buttons">7PM</label>';

        // Return the Legend div containing the HTML content
        return div;
    };

    // Add Legend to Map
    legend.addTo(map);

    // Set Styling

    function setStyle(timeList, dateList) {
        // Get total number of passes from the days and times, for use in computing the average
        if (timeList.length == 0 || dateList.length == 0)
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
                return mainColor.good;
            } else if (average > 0.75 && average <= 0.90) {
                return mainColor.medium;
            } else if (average > 0.90) {
                return mainColor.bad;
            }
        })
    }
    setStyle([4,5,6,7],["Thursday", "Friday", "Saturday"]);

    // JQuery Buttons

    $(document).ready(function(){
        // Check button values
        function checkButtons() {

            // Add checked days to dateList
            dateList = [];
            var checkedThu = $('#checkThu').is(":checked");
            var checkedFri = $('#checkFri').is(":checked");
            var checkedSat = $('#checkSat').is(":checked");

            if (checkedThu) {dateList.push("Thursday")}
            if (checkedFri) {dateList.push("Friday")}
            if (checkedSat) {dateList.push("Saturday")}
            console.log(dateList)

            // Add checked boxes to timeList

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

            // Call setStyle with the checked timeList
            setStyle(timeList, dateList)
        }

        // Call checkButtons each time a box is checked
        $("#checkThu").click(function() {
            checkButtons();
        });
        $("#checkFri").click(function() {
            checkButtons();
        });
        $("#checkSat").click(function() {
            checkButtons();
        });
        $("#check4").click(function() {
            checkButtons();
        });
        $("#check5").click(function() {
            checkButtons();
        });
        $("#check6").click(function() {
            checkButtons();
        });
        $("#check7").click(function() {
            checkButtons();
        })
    });
}

// Load CSV

d3.csv("data/Results5_CSV.csv", function(error, meterCount) {
    if (error) throw error;
    for (i=0; i < meterCount.length; i++) {
        meterCount[i].Cars = +meterCount[i].Cars;
        meterCount[i].Meters = +meterCount[i].Meters;
        meterCount[i].Time = +meterCount[i].Time
    }
    console.log(meterCount);

    // Load block shapes GeoJSON

    d3.json("data/MeterBlocks14_GEOJSON.geojson", function(error, dataset) {
        if (error) throw error;

        // Add count data to the GeoJSON
        for (i=0; i < dataset.features.length; i++) {
            dataset.features[i].properties.Name = +dataset.features[i].properties.Name;
            dataset.features[i].properties.Observations = [];

            for (k=0; k < meterCount.length; k++){
                if (meterCount[k].BlockID == dataset.features[i].properties.Name) {
                    dataset.features[i].properties.Observations.push(meterCount[k]);
                    dataset.features[i].properties.Meters = meterCount[k].Meters;
                }
            }
        }

        console.log(dataset);

        // Finally call createMap
        createMap(dataset)
    });
});
