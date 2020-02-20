/*
 *Author: Tim Romer
 *Date: 1-15-2020
 *Class: CSE 270E
 *Assignment: Module 10 Assignment
*/

// Include all relevant modules to be used in the program.
var path = require("path");
var express = require("express");
var zipdb = require("zippity-do-dah");
var ForecastIo = require("forecastio");

// Instantiate an express object and a weather object.
var app = express();
var weather = new ForecastIo("88537b2c6052ed438c656ffc4c7cb956");

// Including static files in the public directory.
app.use(express.static(path.resolve(__dirname, "public")));

// Set the views in the views directory with the .ejs file type.
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// For url with just "/", render the index view.
app.get("/", function(req, res) {
  res.render("index");
});

// For url with "/summary", render the summary view.
app.get("/summary", function(req, res) {
  res.render("summary");
});

// For url with "/" and a 5 digit number (reperesenting a zipcode).
app.get(/^\/(\d{5})$/, function(req, res, next) {
  var zipcode = req.params[0];
  var location = zipdb.zipcode(zipcode); // Will get postal information using the zipcode.

  // If the location object is empty, then the zipcode does not exist. Will continue to the next middleware.
  if (!location.zipcode) {
    next();
    return;
  }

  // This will get the latitude and longitude information from the location object.
  var latitude = location.latitude;
  var longitude = location.longitude;

  // This is a call to the forecastIO module to get weather information with the latitude and longitude.
  weather.forecast(latitude, longitude, function(err, data) {
    // If there is an error with the function, it will continue to the next middleware.
    if (err) {
      console.log("Error on the weather.forecast() function");
      next();
      return;
    }

    // This will add the relevant information to the response. The response will be in the json format.
    res.json({
      zipcode: zipcode, // Zipcode information.
      temperature: data.currently.temperature, // Temperature information.
      summary: data.daily.summary // Daily sumamry information.
    });
  });
});

// Default route for 404 errors.
app.use(function(req, res) {
  res.status(404).render("404");
});

// The app will listen on prot 3010.
app.listen(3010);
