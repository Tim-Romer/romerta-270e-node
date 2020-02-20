/*
 * Author : Tim Romer
 * Date : 1-20-2020
 * Assignment : Chapter 8 - Assignment 13 - MongoDB
 * Course : CSE 270E
 */

var mongoose = require("mongoose");
var csv = require("csv-parse");
var fs = require("fs");

// Schema for the Student database.
var studentDataSchema = new mongoose.Schema({
  gender: String,
  race : String,
  parentEducation : String,
  lunch : String,
  testPrep : String,
  math : String,
  reading : String,
  writing : String
}, {
  versionKey: false
});

// Create the model for the Student.
var Student = mongoose.model('Student', studentDataSchema);

// Input file for initial data.
var inputFile = 'data/StudentsPerformance.csv';

// Array to store the data read in from the file.
var csvData = [];

// Function to assist in loading the initial data from the csv.
async function loadFromFile() {
    return new Promise(function(resolv, reject) {
      fs.createReadStream(inputFile)
        .pipe(csv({delimeter: ","}))
        // Normal reading of rows. Will push the row to the array.
        .on('data', function(csvrow) {
          csvData.push(csvrow);
        })
        // ERROR HANDLER FOR READING FILE
        .on('error', function(err) {
          reject(err);
        })
        // When the end of the file has been reached, resolve the promise.
        .on('end', function() {
          console.log('File has been read');
          resolv();
        });
     });
}

// Load the data into the mongodb
async function getCsvData() {
    let response = await loadFromFile();
    console.log('Response has been recorded. Sending to cb now.');
    return csvData;
}


// Export functions for the model and the initial data
module.exports.getCsvData = getCsvData;
module.exports.Student = Student;
