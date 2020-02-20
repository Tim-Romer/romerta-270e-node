/*
 * Author: Tim Romer
 * Date: 1-17-2020
 * Assignment: Assignment 12
 * Course: cse270e
 * Modified from Scott Campbell's script.
 */

// The axios library will help with api calls
const axios = require('axios');

// The host url
const host = "http://campbest.270e.csi.miamioh.edu:3000/api/v1";

// Function to get all rovers by id, name, and max_sol
function getRovers(cb) {
    var url = host + '/rovers'; // The url

    // The call to get the data from the api
    axios.get(url)
   	 .then(response => {
   		 cb(response.data);
   	 })
   	 .catch(error => {
   		 console.log(error);
   		 cb(err);
   	 });
}

// Function to get the photos from a specified rover for a specified date
function getMarsPhotos(rover,soldate,cb) {
    var url = host + '/photos/' + rover + "/" + soldate; // The url of the api call

    // The calll to get the data from the api
    axios.get(url)
   	 .then(response => {
   		 cb(response.data);
   	 })
   	 .catch(error => {
   		 console.log(error);
   		 cb(error);
   	 });
}

// The function for the api call of getting users
function getUsers(cb) {
    var url = host = '/users'; // The url for the call

    // The api call using axios
    axios.get(url)
   	 .then(response => {
   		 cb(response.data);
   	 })
   	 .catch(error => {
   		 console.log(error);
   		 cb(error);
   	 });

}

// Exporting the modules for use in the node app.
module.exports.getUsers = getUsers;
module.exports.getMarsPhotos = getMarsPhotos;
module.exports.getRovers = getRovers;
