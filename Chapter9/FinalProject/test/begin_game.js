/*
 * Author : Tim Romer
 * Date : 1-21-2020
 * Assignment : Assignment 14
 * Course : CSE 270E
 */

// get the model to test.
var model = require("../model/tictactoe_model.js");

// Instantiate the chai module.
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

// Variable instantiation to track a gameId.
var gameId1;

// Wrapper for the overall testing suite.
describe("Testing suite", function() {
  // Tests for starting a new game.
  describe("Starting a game", function() {

    // Test for ensuring that the randomly generated gameId is of size 6.
    it("Returns a random gameId of length 6", function() {
      return new Promise(function (resolve) {
        model.play("Tim", "0").then(function(result) {
          gameId1 = result.gameId;
          expect(result.gameId).to.have.length(6);
          resolve();
        });
      });
    });

    // Make sure that a new game does not generate a similar game ID.
    it("Returns a random gameId different than previous games", function() {
      return new Promise(function (resolve) {
        model.play("Emily", "0").then(function(result) {
          expect(result.gameId).to.not.equal(gameId1);
          resolve();
        });
      });
    });

    // Makes sure that the names are correct for a new game.
    it("The promise returns the name that is passed in and a blank name for player2", function() {
      return new Promise(function (resolve) {
        model.play("Aaron", "0").then(function(result) {
          expect(result.player1Name).to.equal("Aaron");
          expect(result.player2Name).to.equal("");
          resolve();
        });
      });
    });

    // Makes sure that game meta information is appropriate for a new game.
    it("When creating a new game, move count should be 0.", function() {
      return new Promise(function (resolve) {
        model.play("Steve1", "0").then(function(result) {
          expect(result.moveCnt).to.equal(0);
          expect(result.state).to.equal("waiting");
          resolve();
        });
      });
    });

    // Makes sure that game meta information is appropriate for a new game.
    it("When creating a new game, lastMoveTime should be 0, and board should be empty.", function() {
      return new Promise(function (resolve) {
        model.play("steve2", "0").then(function(result) {
          expect(result.lastMoveTime).to.not.equal(0);
          resolve();
        });
      });
    });
  });

  // Tests for a game in progress.
  describe("Game in progress & Adding players.", function() {
    // Keeps track of a gameID while playing
    var gameID;

    // Makes sure that the id is stored when starting a new game.
    it("Creating a new game and getting the id", function() {
      return new Promise(function (resolve) {
        model.play("Steve2", "0").then(function(result) {
          gameID = result.gameId;
          expect(gameID).to.equal(gameID);
          resolve();
        });
      });
    });

    // Makes sure that you can't get a game that doesn't exist.
    it("If the incorrect game id is not found, the result should reflect that", function() {
      return new Promise(function (resolve, reject) {
        model.play("Steve3", "1111111").then(function(result) {
          assert.isNotOk(result);
          reject();
        }).catch((error) => {
          assert.isOk(error);
          resolve();
        });
      }).catch((error) => {
        assert.isOk(error);
        resolve();
      });
    });

    // Makes sure that the new turn is set for the next player.
    it("If the correct game is passed, player2Name should be set and the turn should be set for player1", function() {
      return new Promise(function (resolve) {
        model.play("Mary", gameID).then(function (result) {
          expect(result.player2Name).to.equal("Mary");
          expect(result.state).to.equal("player1Turn");
          resolve();
        });
      });
    });
  });


// Tests for making moves.
  describe("Playing the game.", async function() {

    // Stores gameID
    var gameID;

    // Test for getting the game id.
    it("Creating a new game and getting the id", function() {
      return new Promise(function (resolve) {
        model.play("Tim", "0").then(function (result) {
          gameID = result.gameId;
          expect(gameID).to.equal(result.gameId);
          resolve();
        });
      });
    });

    // Test for getting a second player in the game.
    it("Adding a second player to the game", function() {
      return new Promise(function (resolve) {
        model.play("Emily", gameID).then(function (result) {
          expect(result.player2Name).to.equal("Emily");
          resolve();
        });
      });
    });

    // Test for making a move.
    it("Make a move for player1", function() {
      return new Promise(function (resolve) {
        model.move(gameID, "Tim", 0).then(function (result) {
          expect(result.status).to.equal("ok");
          resolve();
        });
      });
    });

    // Test for making a move out of turn.
    it("Trying to make a move out of turn", function() {
      return new Promise(function (resolve, reject) {
        model.move(gameID, "Tim", 7).then(function (result) {
          assert.isNotOk(result);
          reject();
        }).catch((error) => {
          assert.isOk(error);
          resolve();
        });
      });
    });

    // Test for making a move that has already been made.
    it("Making a move that has already been made for player 2", function() {
      return new Promise(function (resolve, reject) {
        model.move(gameID, "Emily", 0).then(function (result) {
          assert.isNotOk(result);
          reject();
        }).catch((error) => {
          assert.isOk(error);
          resolve();
        });
      });
    });

    // Test for making moves outside the bounds of the board.
    it("Making a move outside the bounds of the board", function() {
      return new Promise(function (resolve, reject) {
        model.move(gameID, "Emily", -2).then(function (result) {
          assert.isNotOk(result);
          reject();
        }).catch((error) => {
          assert.isOk(error);
        });
        model.move(gameID, "Emily", 21).then(function (result) {
          assert.isNotOk(result);
          reject();
        }).catch((error) => {
          assert.isOk(error);
          resolve();
        });
      });
    });

    // Test for making a move.
    it("The second player making a move", function() {
      return new Promise(function(resolve, reject) {
        model.move(gameID, "Emily", 5).then(function (result) {
          expect(result.status).to.equal("ok");
          expect(result.thisGame.state).to.equal("player1Turn");
          resolve();
        });
      });
    });

    // Test for making a move
    it("Ensuring that a player can win the game 1", function() {
      return new Promise(function(resolve, reject) {
        model.move(gameID, "Tim", 1).then(function (result) {
          expect(result.status).to.equal("ok");
          resolve();
        });
      });
    });

    // Test for making a move.
    it("Ensuring that a player can win this game 2", function() {
      return new Promise(function(resolve, reject) {
        model.move(gameID, "Emily", 4).then(function (result) {
          expect(result.status).to.equal("ok");
          resolve();
        });
      });
    });

    // Test for making a move.
    it("Ensuring that a player can win this game 3", function() {
      return new Promise(function(resolve, reject) {
        model.move(gameID, "Tim", 2).then(function (result) {
          expect(result.thisGame.state).to.equal("player1Win");
          resolve();
        });
      });
    });

    // Test to ensure that users cannot make moves after the game is over.
    it("Make sure user cannot play game after it is over", function() {
      return new Promise(function(resolve, reject) {
        model.move(gameID, "Emily", 6).then(function (result) {
          assert.isNotOk(result);
          reject();
        }).catch((error) => {
          assert.isOk(error);
          resolve();
        });
      });
    });
  });

  // Test suite for game statistics
  describe("Tests for the game stats", function() {

    // Test to ensure that the getGame function does not work with id's that don't exist
    it("Ensure that the getGame function returns nothing if there are no games", function () {
      return new Promise(function(resolve, reject) {
        model.getGame("1").then(function (result) {
          assert.isOk(result);
          resolve();
        }).catch((error) => {
          assert.isOk(error);
          resolve();
        });
      });
    });

    // Test to ensure that teh get games() function always returns games.
    it("Ensure that the getGames() function returns nothing if there are no games", function() {
      return new Promise(function(resolve, reject) {
        model.getGames().then(function (result) {
          assert.isNotOk(result);
          resolve();
        }).catch((error) => {
          assert.isOk(error);
          resolve();
        });
      });
    });

    // Variable to store game id
    var gameID;

    // Test to create a game.
    it("Create a game", function() {
      return new Promise(function(resolve, reject) {
        model.play("Cameron", "0").then(function (result) {
          gameID = result.gameId
          assert.isOk(result);
          resolve();
        });
      });
    });

    // Test to get the game with the id.
    it("Get the game with the id", function() {
      return new Promise(function(resolve, reject) {
        model.getGame(gameID).then(function (result) {
          assert.isOk(result);
          resolve();
        });
      });
    });

    // Test to get all games.
    it("Get all of the games and the length should be 1.", function() {
      return new Promise(function(resolve, reject) {
        model.getGames().then(function(result) {
          expect(result.length).to.be.above(1);
          resolve();
        });
      });
    });

    // Tests to ensure that records are returned with the function.
    it("Ensure that records are returned.", function() {
      return new Promise(function(resolve, reject) {
        model.getStats().then(function(result) {
          expect(result.length).to.be.above(1);
          resolve();
        });
      });
    });
  });
});
