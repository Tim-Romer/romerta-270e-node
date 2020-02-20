// Author: Tim Romer
// Date: 1/6/2020
// Course: CSE 270E
// Professor: Dr. Scott Campbell
// Assignment: Module 7 , chapter 2 NodeJS Introduction
// Description: A hello world program using node.js. The server will run on port 3000 and it
//		will output the string Hello World in response to the url /

var express = require("express"); // Express module to run the web server

var app = express(); // Instantiating an Express object

// This is a get function that will respond to the url "/" and send the message "Hello World\n"
// back to the user. The server will also listen on port 3000.
app.get("/", function(req, res) {
	res.send("Hello World\n");
}).listen(3000);
