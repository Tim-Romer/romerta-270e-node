/*
 * Author: Tim Romer
 * Date: 1-17-2020
 * Assignment: Module 12 - Chapter 7 - Assignment 12
 * Course: CSE 270E
*/

// Include needed modules
var express = require("express");
var rest = require("./api.js");
var path = require("path");

// Instantiate the express object
var app = express();

// Link the views folder
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

// Route to the index.ejs
app.get("/", function(req, res) {
  rest.getRovers(function(data) {
    res.render("index", data);
  });
});

// Route to a specified rover with the latest photos
app.get("/mars/:rover", function(req, res) {
  var rover = req.params.rover; // Get the parameter from the url NEEDS SCRUBBING

  // Api call to get a list of rovers in order to find the maximum available sol.
  rest.getRovers(function(data) {
    // Loop through the rovers
    for (var r in data.rovers) {
      if (data.rovers.hasOwnProperty(r)) {
        if (data.rovers[r].name.toLowerCase() === rover) {
          // Get photos for the rover for the maximum sol.
          rest.getMarsPhotos(rover, data.rovers[r].max_sol, function(pData) {
            res.render("mars", pData);
          });
        }
      }
    }
  });
});


// Route to the photos.ejs
app.get("/mars/:rover/:date", function(req, res) {
  var sol = parseInt(req.params.date); // Requires scrubbing
  var rover = req.params.rover; // Requires scrubbing

  // Make the rest call to get the photos with the rover and the sol
  rest.getMarsPhotos(rover, sol, function(pData) {
    res.render("mars", pData);
  });
});


// The webserver will listen on port 3012
app.listen(3012);

console.log("The webserver is listening on port 3012");
