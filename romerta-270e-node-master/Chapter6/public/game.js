/*
 *Author: Tim Romer
 *Date: 1-16-2020
 *Assignment: Assignment 11
 *Class: CSE 270E
*/

$(function() {
  // Fucntion to handle the ajax call for setting the max
  $("#setMax").on("submit", function(event) {
    event.preventDefault(); // prevent default html form handling.
    var max = $.trim($("#max").val()); // Get the max
    console.log("Set max to: " + max);

    // Ajax call. Post request with the max in the body.
    var request = $.ajax({
      type: "POST",
      url: "/api/v1/game",
      data: {"max": max},
    });

    // When the call is finished and successful, change the html with id result.
    request.done(function(msg) {
      console.log("The results of the request: " + msg);
      $("#result").text("The max has been set");
    });

    // If the request fails, change the html with the id result.
    request.fail(function(msg) {
      console.log("The results of the request: " + msg);
      $("#result").text("Error setting the max");
    });
  });

  // Function to handle the ajax call for playing the game and submitting guesses against the max
  $("#game").on("submit", function(event) {
    event.preventDefault(); // Prevent the default html form handling
    var guess = $.trim($("#guess").val()); // Get the guess from the html
    console.log("Guess is: " + guess);

    // Ajax call. Get request with the guess in the url.
    var request = $.ajax({
      type: "GET",
      url: "/api/v1/game/" + guess,
      dataType: "json"
    });

    // When the request is done and successful. Change the html do display whether the guess was high, low, or a match.
    request.done(function(msg) {
      console.log("The results of the request: " + msg);
      $("#result").text(guess + " is " + msg.result);
    });

    // If the request fails. Change the html to let the user know that their guess was invalid.
    request.fail(function(msg) {
      console.log("Error with the guess");
      $("#result").text("Error with the guess");
    });
  });



});

