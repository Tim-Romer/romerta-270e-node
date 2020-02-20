/*
 * Author : Tim Romer
 * Date : 1-23-2020
 * Assignment : Assignment 15
 * Course : CSE 270E
 */

/*
 * This test suite will test the api through http requests to the api that supports the data model.
 */

// Instantiate the required modules
var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
var assert = chai.assert;
var app = require("../app.js");

// Use the http plugin
chai.use(chaiHttp);

// Variable to track the gameID.

var gameID;
var fakeGameID;
var player1;
var player2;

// Wrapper for the http testing suite.
describe("Testing suite for http requests.", function() {
  // Tests for gathering records.
  describe("Gathering records", function() {
    // Test for getting records.
    it("Ensure that the http request returns a 200 status and that there are no errors", function() {
      return new Promise(function (resolve, reject) {
        chai.request(app).get('/api/v1/games').end(function(err, res) {
//          console.log(res);
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          resolve();
        });
      });
    });
  });
  // Test for adding players and beginning a game.
  describe("Beginning a game and adding players", function() {
    // Add player1 to the game.
    it("Adding 1 player to the game", function() {
      return new Promise(function (resolve, reject) {
        chai.request(app).post('/api/v1/game').send({ playerName : "Tim", gameID : "0" }).end(function (err, res) {
          gameID = res.body.game.gameId;
//          console.log(global.gameID); console.log(res.body.game.gameId); console.log(res); console.log();
          player1 = res.body.game.player1Name;
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal("OK");
          expect(res.body.game.gameId.length).to.equal(6);
          expect(res.body.game.player1Name).to.equal("Tim");
          expect(res.body.game.player2Name).to.equal("");
          resolve();
        });
      });
    });
    console.log(global.gameID);
    it("Adding a second player to the game", function() {
      return new Promise(function (resolve, reject) {
        chai.request(app).post('/api/v1/game').send({ playerName : "Emily", "gameID" : gameID }).end(function (err, res) {
//          console.log(res);
          player2 = res.body.game.player2Name;
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal("OK");
          expect(res.body.game.player2Name).to.equal("Emily");
          expect(res.body.game.state).to.equal("player1Turn");
          resolve();
        });
      });
    });

    // TODO: ADD TEST TO TEST THE SCRUBBING OF THE PLAYERNAME AND GAMEID. THESE INCLUDE SANITIZING AND ESCAPING.
  });

  // Testing whether users can play the game
  describe("Testing whether the players can make moves.", function() {
    // Test for player1 to make a move
    it("PLayer1 making a move", function() {
      return new Promise(function (resolve, reject) {
        chai.request(app).get('/api/v1/move/' + gameID +'/' + player1 + '/0').end(function (err, res) {
//          console.log(res.body);
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.game.thisGame.state).to.equal("player2Turn");
          resolve();
        });
      });
    });

    // Test for player2 making a move
    it("Player2 making a move", function() {
      return new Promise(function (resolve, reject) {
        chai.request(app).get('/api/v1/move/' + gameID + '/' + player2 + '/3').end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.game.thisGame.state).to.equal("player1Turn");
          resolve();
        });
      });
    });

    // Test for player1 making a move.
    it("Player1 making a move", function() {
      return new Promise(function (resolve, reject) {
        chai.request(app).get('/api/v1/move/' + gameID + '/' + player1 + '/1').end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          resolve();
        });
      });
    });

    // Test for player2 making a move.
    it("Player 2 making a move", function() {
      return new Promise(function (resolve, reject) {
        chai.request(app).get('/api/v1/move/' + gameID + '/' + player2 + '/6').end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          resolve();
        });
      });
    });

    // Test for player 1 winning the game.
    it("Player winning the game test.", function() {
      return new Promise(function (resolve, reject) {
        chai.request(app).get('/api/v1/move/' + gameID + '/' + player1  + '/2').end(function (err, res) {
          console.log(res.body);
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.game.thisGame.state).to.equal("player1Win");
          resolve();
        });
      });
    });
  });
});

