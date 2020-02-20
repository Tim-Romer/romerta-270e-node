/*
 *Author: Tim Romer
 *Date: 1-15-2020
 *Course: CSE 270E
 *Assignment: Assignment 11
*/

// Include required modules
var express = require("express");
var bodyParser = require('body-parser');

// Instantiates an express object.
var app = express();

// Max range.
var game_maximum_number;
var maximum_guess;

// Middleware to use the body parser.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Middleware for delivering static files.
app.use("/", express.static("public"));

// Get request to generate a random number between the supplied min and max.
app.get("/api/v1/random/:min/:max", function(req, res) {
  var min = parseInt(req.params.min); // Get min
  var max = parseInt(req.params.max); // Get max

  // Verifies that the input is a number and the max is more than the min.
  // If any of that fails, send a 400 error and a json with bad request.
  if (isNaN(min) || isNaN(max) || max <= min) {
    res.status(404);
    res.json({result: "Min and Max needs to be a number and max needs to be greater than min"});
    return;
  }

  // Calculates the random value.
  var result = Math.round((Math.random() * (max - min)) + min);

  // Sends the result in the json.
  res.json({result:result});
});

// Get request to generate a random number between 0 and Max.
app.get("/api/v1/random/:max", function(req, res) {
  var max = parseInt(req.params.max); // Get max

  // Verifies that the input for the max. If fails, send a 404 with message.
  if (isNaN(max) || max < 0) {
    res.status(404);
    res.json({result:"Max needs to be a number and greater than 0"});
  }

  // Calculate the random value.
  var result = Math.round((Math.random() * (max - 0)));

  // Sends the result in the json.
  res.json({result:result});
});

// Post request to set the game max in the server. The server will let the user play high low and this call sets the maximum range for the game.
app.post("/api/v1/game", function(req, res) {
  var max = parseInt(req.body.max); // Get the max

  // Verifies that the input is a number and greater than 0. If fails, send a 404 with message.
  if (isNaN(max) || max < 0) {
    res.status(404);
    res.json({result:"Error"});
  }

  // Sets the maximum number for the game.
  game_maximum_number = Math.round((Math.random() * (max - 0)));
  maximum_guess = max;
  // Sends the OK back in JSON.
  res.json({result:"OK"});
});

// Get request to test a number against the server.
app.get("/api/v1/game/:number", function(req, res) {
  var num = parseInt(req.params.number); // Get the number

  // Verifies the input  is a number and that it is greater than 0.
  if (isNaN(num) || num < 0) {
    res.status(404);
    res.json({result:"ERROR"});
  }

 // Will check the number against the maximum and return the appropriate response.
  if (num > game_maximum_number) {
    res.json({result:"HIGH"});
  } else if (num < game_maximum_number) {
    res.json({result:"LOW"});
  } else {
    game_maximum_number = Math.round((Math.random() * (maximum_guess - 0)));
    res.json({result:"MATCH"});
  }
});


// Set up the web server to listen on port 3011
app.listen(3011, function() {
  console.log("App started on port 3011");
});

