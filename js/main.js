//////////////// MAP ////////////////

// Base layers

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
    "Streets": Hydda_Full,
    "Satellite": Esri_WorldImagery
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
};

// blue purple red
var colors5 = {
    "good": "#3498db",
    "medium": "#8e44ad",
    "bad": "#e74c3c"
};

var mainColor = colors5;

var colorsD = {
    "1": '#3498db',
    "2": '#f1c40f',
    "3": '#9b59b6',
    "4": '#d35400',
    "5": '#1abc9c',
    "6": '#e74c3c',
    "7": '#34495e',
    "8": '#27ae60'
}

var regColors = colorsD;

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

    // Global Variables for jQuery to check to see if the legend is on the map
    var legendOccupancyPresent = true;
    var legendRegulationPresent = false;

    // Create static part of the legend
    var legendStatic = L.control({position: 'topright'});

    // Create Leaflet Control Object for the Static Legend
    var legend = L.control({position: 'topright'});
    legendStatic.onAdd =function(map) {

        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML += '<div id="title"><b>Central Square Parking Study<br/><small>4/14-4/16</div>';
        div.innerHTML += '<input type="radio" id="occupancy" name="radio" checked="checked"><label for="occupancy" class="buttons">Occupancy</label>';
        div.innerHTML += '<input type="radio" id="regulations" name="radio"><label for="regulations" class="buttons">Regulations</label></b><br/>';

        return div;
    };

    // Add Static Legend to Map
    legendStatic.addTo(map);

    // Create Occupancy Legend
    var legendOccupancy = L.control({position: 'topright'});

    // Function that runs when Occupancy Legend is added to map
    legendOccupancy.onAdd = function (map) {

        // Create Div Element and Populate it with HTML
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML += 'Avg. occupancy<br/>';
        div.innerHTML += '<i style="background: '+mainColor.good +'"></i><p>< 75%</p>';
        div.innerHTML += '<i style="background: '+mainColor.medium +'"></i><p>75-90%</p>';
        div.innerHTML += '<i style="background: '+mainColor.bad +'"></i><p>> 90%</p>';
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

    // Add Occupancy Legend to Map
    legendOccupancy.addTo(map);

    // Create Regulations Legend
    var legendRegulations = L.control({position: 'topright'});

    // Function that runs when Occupancy Legend is added to map
    legendRegulations.onAdd = function (map) {

        // Create Div Element and Populate it with HTML
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML += 'Parking Regulations<br/>';
        div.innerHTML += '<i style="background: '+regColors["1"] +'"></i><p>1hr 8am-6pm</p>';
        div.innerHTML += '<i style="background: '+regColors["3"] +'"></i><p>2hr 8am-6pm</p>';
        div.innerHTML += '<i style="background: '+regColors["4"] +'"></i><p>30min 8am-6pm</p>';
        div.innerHTML += '<i style="background: '+regColors["6"] +'"></i><p>2hr 9am-5pm</p>';
        div.innerHTML += '<i style="background: '+regColors["2"] +'"></i><p>2hr 8am-6pm, Mon: 9am to 5pm</p>';
        div.innerHTML += '<i style="background: '+regColors["5"] +'"></i><p>$1 2hr 8am-6pm, $2 4hr 6-10pm</p>';
        div.innerHTML += '<i style="background: '+regColors["7"] +'"></i><p>$1 8am-6pm 4hr, $2 6-10pm 4hr</p>';
        div.innerHTML += '<i style="background: '+regColors["8"] +'"></i><p>$1.50, no time restrictions</p>';

        // Return the Legend div containing the HTML content
        return div;
    };


    // Set Styling

    function setOccupancyStyle(timeList, dateList) {
        // Get total number of passes from the days and times, for use in computing the average
        if (timeList.length == 0 || dateList.length == 0)
            return;

        var numberOfPasses = timeList.length * dateList.length;

        // Take the previously defined (but un-unstyled d3 selection, "feature") and style it
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

    // Set initial style
    setOccupancyStyle([4,5,6,7],["Thursday", "Friday", "Saturday"]);

    // Regulation legend and style
    function setRegulationStyle() {
        feature.style("fill", function (d) {
            return regColors[d.properties.Regulation]
        })
    }

    // Function for jQuery to call to create the regulation legend
    function createRegLegend() {
        if (legendOccupancyPresent) {
            // Remove occupancy legend
            legendOccupancy.removeFrom(map);
            legendOccupancyPresent = false;

            // Add regulation legend to Map
            legendRegulations.addTo(map);
            legendRegulationsPresent = true;

            // Restyle map based on regulations
            setRegulationStyle()
        }
    }

    // Function for jQuery to call to recreate the occupancy legend
    function createOccLegend() {
        if (legendRegulationsPresent) {
            // Remove occupancy legend
            legendRegulations.removeFrom(map);
            legendRegulationsPresent = false;

            // Add regulation legend to Map
            legendOccupancy.addTo(map);
            legendOccupancyPresent = true;

            // Restyle map based on regulations
            setOccupancyStyle([4,5,6,7],["Thursday", "Friday", "Saturday"])
        }
    }


    // JQuery Buttons

    $(document).ready(function(){
        //
        $("#regulations").click(function() {
            createRegLegend();
        });

        // The jQuery click listeners for the days/hours seem to go quiet when occupancy is switched back to
        // So I wrapped them in a function called addOccupanyListeners and that reactivates them
        $("#occupancy").click(function() {
            createOccLegend();
            addOccupancyListeners();
        });

        // Check button values for occupancy
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
            setOccupancyStyle(timeList, dateList)
        }

        // Function to add the hr/day button listeners
        function addOccupancyListeners() {
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
        }
        // Call it by default, and then again each time occupancy is switched back to
        addOccupancyListeners()

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
