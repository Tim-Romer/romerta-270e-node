/*
 * Author : Tim Romer
 * Date : 1-22-2020
 * Assignment : Assignment 15
 * Course : CSE 270E
 */

// Include required modules.
var path = require("path");
var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var expressSanitizer = require('express-sanitizer');

// Include data model.
var model = require("./model/tictactoe_model.js");

// Instantiate an express object and set the app up.
var app = express();

// Set up delivery of static files
app.use("/", express.static('public'));
app.use(express.static(path.resolve(__dirname, "public")));

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

// Other middleware
app.use(bodyParser.urlencoded());
app.use(morgan("short"));
app.use(bodyParser.json());
app.use(expressSanitizer());

// Route to get a specific game by id.
app.get("/api/v1/game/:gameid", function(req, res) {
  var gameid = req.sanitize(req.params.gameid); // Get and sanitize the game id.

  // Check that the game id is at 6 digits.
  if (gameid.length !== 6) {
    next();
    return;
  }

  // Call to the model to get the game with the user supplied gameid.
  model.getGame(gameid).then(function(result) {
    var ret = {status : "OK", msg : "Game has been found", game : result};
    res.send(ret);
  }).catch((error) => {
    var ret = {status : "FAIL", msg : "Invalid game id"};
    res.send(ret);
  });
});

// App for clearing out the database for games that are older than a certain date.
app.post("/clear/games", function(req, res, next) {
  var pass = req.sanitize(req.body.password); // Get and sanitize the password
  var date = req.sanitize(req.body.date); // Get and sanitize the date

  // Makes sure that the password is CLEAR 
  if (pass !== "CLEAR") {
    next();
    return;
  }
  var unixDate = new Date(date) / 1000; // Transforms the date into a unix formatted date.

  // Call the model to clear the games before a certain date.
  model.clear(unixDate).then(function(result) {
    var ret = {status : "OK", msg : "Games have been cleared before " + date};
    res.render("clearSuccessful", {ret});
  }).catch((error) => {
    res.send(error);
  });
});

// Route for managing the boards.
app.get("/manage", function(req, res) {
  res.render("boardManager");
});

// Route to get the statistics for the games.
app.get("/statistics", function(req, res) {
  model.getStats().then(function(records) {
//    var data = JSON.parse(records);
    console.log({records});
    res.render("statistics", {records});
  });
});

// Route to get a list of games and render the page.
app.get("/gamedetails", function(req, res) {
  // API call to get all games
  model.getGames().then(function(records) {
    var games = []; // Object to store the games and send to the view.
    var game;
    // Loop through the records to get all necessary details for the view
    records.forEach(function(record) {
      game = {
        board : record.board,
        player1Name : record.player1Name,
        player2Name : record.player2Name,
        moveCnt : record.moveCnt,
        lastMoveTime : record.lastMoveTime,
        state : record.state
      };
      games.push(game);
    });
    // Send all records to the view.
    res.render("gameDetails.ejs", {games});
  });
});

// Route to get a list of games that are in progress.
app.get("/progress", function(req, res) {
  model.getGames().then(function(records) {
    var games = [];
    var game;
    var invalid = ["player1Win", "player2Win", "stalemate"]; // List of invalid states for the for loop to not consider
    records.forEach(function(record) {
      if (!invalid.includes(record.state)) {
        game = {
          board : record.board,
          player1Name : record.player1Name,
          player2Name : record.player2Name,
          moveCnt : record.moveCnt,
          lastMoveTime : record.lastMoveTime,
          state : record.state
        };
        games.push(game);
      }
    });
    res.render("progress", {games});
  });
});

// Route to get Games that have been orphaned.
app.get("/orphaned", function(req, res) {
  model.getGames().then(function(records) {
    var games = [];
    var game;
    records.forEach(function(record) {
      // Games that have the state of waiting are orphaned
      if (record.state === "waiting") {
        game = {
          player1Name : record.player1Name,
          gameCreated : record.lastMoveTime
        };
        games.push(game);
      }
    });
    res.render("orphaned", {games});
  });
});

// Route to clear the data.
app.get("/clear", function(req, res) {
  res.render("clear");
});

// Route to get Games from the data model.
app.get("/api/v1/games", function(req, res) {
  model.getGames().then(function(records) {
    var games = [];
    var game;
    records.forEach(function(record) {
      game = {
        board : record.board,
        _id : record._id,
        gameId : "",
        player1Name : record.player1Name,
        player2Name : record.player2Name,
        moveCnt : record.moveCnt,
        lastMoveTime : record.lastMoveTime,
        state : record.state,
        _v : record._v
      };
      games.push(game);
    });
    res.send(games);
  });
});

// Route to start a game.
app.post("/api/v1/game", function(req, res, next) {
  var playerName = req.sanitize(req.body.playerName); // Gets playerName and scrubs
  var gameID = req.sanitize(req.body.gameID); // Gets gameid and scrubs
  
  // Ensures that the gameID is either 0 or of length 6.
  if (gameID !== "0" && gameID.length !== 6) {
    next();
    return;
  }

  // This is the case where it is a fresh game.
  if (gameID === "0") {
    model.play(playerName, gameID).then(function(result) {
      var ret = {status : "OK", msg : "Game has been initialized", game : result};
      res.send(ret);
    });
  }
  // This is the case where the game has started but a new player needs to be added.
  else {
    model.play(playerName, gameID).then(function(result) {
      var ret = {status : "OK", msg : "Player 2 has been added. Game ready", game : result};
      res.send(ret);
    }).catch((error) => {
      var ret = {status : "FAIL", msg : "Invalid game id"};
      res.send(ret);
    });
  }
});

// Route to make a move in the game.
app.get("/api/v1/move/:gameID/:playerName/:movePosition", function(req, res, next) {
  var gameID = req.sanitize(req.params.gameID); // Gets gameid and scrubs it
  var playerName = req.sanitize(req.params.playerName); // Gets playername and scrubs it
  var movePosition = req.sanitize(req.params.movePosition); // Gets the position and scrubs it

  // Ensures that the position is valid.
  var validMoves = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  if (!validMoves.includes(movePosition)) {
    next();
    return;
  }

  // Calls the model and makes a move.
  model.move(gameID, playerName, movePosition).then(function(result) {
    var ret = {status : "OK", msg : "Move has been made", game : result};
    res.send(ret);
  }).catch((error) => {
    var ret = {status : "FAIL", msg : "There was an error making the move", err : error};
    res.send(ret);
  });
});

// Default route for 404 errors.
app.use(function(req, res) {
  res.status(404);
});


//Set the webserver to listen on port 3015
const port = 3016;

var server = app.listen(port);
console.log("App is listening on: " + port);

// Export the server for testing purposes.
module.exports = server;
