/*
 * scott campbell
 * cse270e
 * winter 2019
 * Assignment 13 - Mongo
 * */

var path =require("path");
var express = require("express");
var morgan = require("morgan");
var bodyParser=require('body-parser');
var studentData = require("./data/StudentDataModel.js");
var session = require('express-session');


var app = express();
app.use(express.static('public'));
app.use(express.static(path.resolve(__dirname, "public")));
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded());
app.use(session({secret:"12312"}));




app.use(morgan("short"));
app.use(bodyParser.json());

app.get("/",function(req,res) {
	math = (req.session.math?req.session.math:0);
	reading = (req.session.reading?req.session.reading:0);
	writing = (req.session.writing?req.session.writing:0);
	console.log("math="+math);


	studentData.getStats(0,0,0).then(function(counts) {
		console.log(counts);
		var data = {math:math,reading:reading,writing:writing};
		data.count = counts;
		res.render("index",data);
	});

});

app.post("/",function(req,res) {
	console.log(req.body);

	studentData.getStats(parseInt(req.body.math),parseInt(req.body.writing),parseInt(req.body.reading)).then(function(counts) {
		console.log(counts);
		var data = {math:req.body.math,reading:req.body.reading,writing:req.body.writing};
		data.counts=counts;
		res.render("index",data);
		req.session.reading = req.body.reading;
		req.session.math= req.body.math;
		req.session.writing= req.body.writing;
		console.log(req.session);
	});
});


app.use(function(req, res) {
	res.status(404);
	res.json({error:"404"});
});
app.listen(3013);
console.log("3013");
