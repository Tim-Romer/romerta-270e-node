/*
 * Author : Tim Romer
 * Date : 1-21-2020
 * Assignment : Assignment 13
 * Course : CSE 270E
 * */

// Include required modules.
var mongoose = require("mongoose");
var loadData = require("./loadData.js");

// Connect to the database.
mongoose.connect("mongodb://localhost:27017/studentPerformance");

// Initial load of csv data into database.
async function main() {
  var data = await loadData.getCsvData(); // call the getData function() from the load data module.
  for (let i = 1; i < data.length; i++) { // loop to store the records in the database
    await addInitialStudent(data[i]);
   }
  console.log(data);
}

// Function for adding a student to the database.
async function addStudent(record) {
  return new Promise((resolv, reject) => {
    // Create a new student for the database
    var newStudent = new loadData.Student({
      gender : record[0],
      race : record[1],
      parentEducation : record[2],
      lunch : record[3],
      testPrep : record[4],
      math : record[5],
      reading : record[6],
      writing : record[7]
    });
    // Save the student in the database
    newStudent.save(function(err, v) {
      if (err) { reject(err); } // ERROR HANDLING
      else { resolv(v); }
    });
  });
}

// Helper function to add the initial data from the csv.
async function addInitialStudent(record) {
  return new Promise((resolv, reject) => {
    // Creation a new student
    var newStudent = new loadData.Student({
      gender : record[0],
      race : record[1],
      parentEducation : record[2],
      lunch : record[3],
      testprep : record[4],
      math : record[5],
      reading : record[6],
      writing : record[7]
    });
    // Add the student to the database.
    newStudent.save(function(err, v) {
      if (err) { reject(err); } // ERROR HANDLING
      else { resolv(); }
    });
  });
}

// Function will close the MongoDB connection.
async function close() {
  return new Promise((resolv, reject) => {
    mongoose.connection.close()
    resolv();
  });
}

// Function will clear the database of all existing records
async function clear() {
  return new Promise((resolv, reject) => {
    mongoose.connection.db.dropCollection('studentPerformance', function(err, result) {
      if (err) {
        console.log(err);
        reject(err);
      } else if (result) {
        console.log(result);
        resolv(result);
      }
    });
  });
}

// Function will return students with stats greater than the parameters
async function getStats(math, reading, writing) {
    counts = [];
    index = 0;
    console.log('Executing query');
    // Queries for getting the counts for the parents education based on the supplied parameters.
    await loadData.Student.countDocuments({parentEducation : 'master\'s degree', math : { $gt : math }, reading : { $gt : reading}, writing : { $gt : writing }}, async function(err, count) {
      counts.push({'parentEducation' : {'masters' : count}});
      index++;
    });
    await loadData.Student.countDocuments({parentEducation : 'bachelor\'s degree', math : { $gt : math }, reading : {$gt : reading}, writing : {$gt : writing}}, async function(err, count) {
      counts.push({'parentEducation' : {'bachelors' : count}});
      index++;
    });
    await loadData.Student.countDocuments({parentEducation : 'associate\'s degree', math : { $gt : math}, reading : {$gt : reading}, writing : {$gt : writing}}, async function(err, count) {
      counts.push({'parentEducation' : {'associates' : count }});
      index++;
    });
    await loadData.Student.countDocuments({parentEducation : 'some college', math : { $gt : math}, reading : { $gt : reading}, writing : {$gt : writing}}, async function(err, count) {
      counts.push({'parentEducation' : {'someCollege' : count }});
      index++;
    });
    await loadData.Student.countDocuments({parentEducation : 'high school', math : { $gt : math}, reading : { $gt : reading }, writing : { $gt : writing}}, async function(err, count) {
      counts.push({'parentEducation' : {'highSchool' : count}});
      index++;
    });
    await loadData.Student.countDocuments({parentEducation : 'some high school', math : { $gt : math}, reading : { $gt : reading}, writing : { $gt : writing }}, async function(err, count) {
      counts.push({'parentEducation' : {'someHighSchool' : count}});
      index++;
    });
    // Queries to get the counts for the lunch.
    await loadData.Student.countDocuments({lunch : 'standard', math : { $gt : math}, reading : { $gt : reading}, writing : {$gt : writing}}, async function(err, count) {
      counts.push({'lunch' : {'standard' : count}});
      index++;
    });
    await loadData.Student.countDocuments({lunch : 'free/reduced', math : { $gt : math }, reading : { $gt : reading }, writing : { $gt : writing }}, async function(err, count) {
      counts.push({'lunch' : {'free' : count}});
      index++;
    });
    // Queries to get the counts for the testPrep.
    await loadData.Student.countDocuments({testPrep : 'none', math : { $gt : math }, reading : { $gt : reading }, writing : { $gt : writing}}, async function(err, count) {
      counts.push({'testPrep' : {'none' : count}});
      index++;
    });
    await loadData.Student.countDocuments({testPrep : 'completed', math : { $gt : math }, reading : { $gt : reading }, writing : {$gt : writing }}, async function(err, count) {
      counts.push({'testPrep' : {'completed' : count}});
      index++;
    });
//    while (counts.length <= 9) {}
//    index = 0; 
    return counts;
}

// Execute the main() to load the initial data.
main();

// Export functions to the app.js.
exports.addStudent = addStudent;
exports.close = close;
exports.clear = clear;
exports.getStats = getStats;

