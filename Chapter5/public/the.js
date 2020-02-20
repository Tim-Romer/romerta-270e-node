/*
 *Author: Tim Romer
 *Date: 1-15-2020
 *Class: CSE 270E
 *Assignment: Module 10 Assignment
*/

// Function call
$(function() {
  var $h1 = $("h1"); // Gets the element in the html for the h1 element.
  var $zip = $("input[name='zip']"); // Gets the zip code information from the input

  // Function call for the indexForm element when it get submitted.
  $("#indexForm").on("submit", function(event) {
    event.preventDefault(); // Prevents the default html form submit
    var zipCode = $.trim($zip.val()); // Gets the zipCode from the html
    console.log(zipCode);
    $h1.text("Loading..."); // Change the h1 html element to "Loading..."

    // Ajax request to the web server with the url /zipCode. It expexts json as the return type.
    var request = $.ajax({
      url: "/" + zipCode,
      dataType: "json"
    });

    // If the request is successful. Change the h1 html element text to the temperatur in the zipcode.
    request.done(function(data) {
      var temperature = data.temperature;
      $h1.text("It is " + temperature + "º in " + zipCode + ".");
    });

    // If the request fails. Change the h1 html element text to error.
    request.fail(function() {
      $h1.text("Error!");
    });
  });

  // Function call for the summaryForm element when it gets submitted.
  $("#summaryForm").on("submit", function(event) {
    event.preventDefault(); // Prevents the default html form submit.
    var zipCode = $.trim($zip.val()); // Gets the zipCode from the html.
    $h1.text("Loading..."); // Changes the html h1 element to "Loading...".

    // The ajax request to the web server with the url /zipCode. It expects json as the return type.
    var request = $.ajax({
      url: "/" + zipCode,
      dataType: "json"
    });

    // If the request is successful. Change the h1 html element text to the weather summary in the zipcode
    request.done(function(data) {
      console.log(data);
      var summary = data.summary;
      $h1.text("Today is " + summary + " in " + zipCode);
    });

    // If the request fails. Change the h1 html element text to error.
    request.fail(function() {
      $h1.text("Error!");
    });
  });
});
