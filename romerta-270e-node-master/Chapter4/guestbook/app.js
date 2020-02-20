// The required modules are included here.
var http = require("http");
var path = require("path");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var fs = require('fs');

// Instantiate the express module.
var app = express();

// Variables to track the entries in the guestbook.
var entries = [];
app.locals.entries = entries;

// Have the express app use the dev logger.
app.use(logger("dev"));

// Logging to a file using the morgan logger.
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'));
app.use(logger('short', {stream: accessLogStream}));

// Set the views to be found in the views directory and have the .ejs extension.
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

// Route the url "/" to the index view.
app.get("/", function(req, res) {
  res.render("index");
});

// Route the url "new-entry" to the new-entry view.
app.get("/new-entry", function(req, res) {
  res.render("new-entry");
});

// Route the url "clear" then redirect to the url "/". This will also clear all of the entries out of the guestbook. By
// re-declaring the entries array.
app.get("/clear", function(req, res) {
  entries = [];
  app.locals.entries = entries;
  res.redirect("/");
});

//  Route the url "/about" to the about view.
app.get("/about", function(req, res) {
  res.render("about");
});

// When a post request comes in it will check that there are the appropriate values and will add those values to the entries
// array. Then it will be redirected to the url "/".
app.post("/new-entry", function(req, res) {
  if (!req.body.title || !req.body.body || !req.body.name) {
    res.status(400).send("Entries must have a title, a body, and a name.");
    return;
  }
  entries.push({
    title: req.body.title,
    body: req.body.body,
    name: req.body.name,
    published: new Date()
  });
  res.redirect("/");
});

// When a route isn't found. A 404 error will be thrown and the 404 view will be rendered. This is the default for unknown routes.
app.use(function(req, res) {
  console.log(req.url);
  res.status(404).render("404");
});

// This will create the server and have it listen on port 3009.
http.createServer(app).listen(3009, function() {
  console.log("Guestbook app started.");
});
