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
var session = require("express-session");

// Include data model.
var model = require("./model/gameModel.js");

// Instantiate an express object and set the app up.
var app = express();
app.use(express.static('public'));
app.use(express.static(path.resolve(__dirname, "public")));
app.set("views", path.resolve(__dirname, "views"));
app.use(bodyParser.urlencoded());
app.use(session({secret: "12312"}));
app.use(morgan("short"));
app.use(bodyParser.json());

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
    console.log(game);
    res.send(games);
  });
});

// Route to start a game.
app.post("/api/v1/game", function(req, res) {
  var playerName = req.body.playerName; // Scrub
  var gameID = req.body.gameID; // Scrub
  var ret;

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
app.get("/api/v1/move/:gameID/:playerName/:movePosition", function(req, res) {
  var gameID = req.params.gameID; // Scrub
  var playerName = req.params.playerName; // Scrub
  var movePosition = req.params.movePosition; //Scrub

  model.move(gameID, playerName, movePosition).then(function(result) {
    var ret = {status : "OK", msg : "Move has been made", game : result};
    res.send(ret);
  }).catch((error) => {
    var ret = {status : "FAIL", msg : "There was an error making the move", err : error};
    res.send(ret);
  });
});


//Set the webserver to listen on port 3015
const port = 3015;

app.listen(port);
console.log("App is listening on: " + port);
