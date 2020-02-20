/*
 * Author : Tim Romer
 * Date : 1-23-2020
 * Assignment : Final Assignment
 * Course : CSE 270E
 *
 * Inspired by the gameModel.js supplied by Dr. Scott Campbell.
 */

// Instantiate and connect the mongoose database.
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/game");

// Create the schema for the game
var gameSchema = new mongoose.Schema({
	gameId : String,		// gameId : Must be a six digit combination of letters
	player1Name : String,   // player1Name : The player that starts the game
	player2Name : String,	// player2Name : The player that connects with the established gameID
	moveCnt : Number,		// moveCnt : Will track how many moves have been made in a game
	lastMoveTime : Number,	// lastMoveTime : Tracks the time that the last move was made
	board : [Number],		// board : A 1D array to track the moves that have already been made
	state : String			// state : Tracks the state that the board is in. Possible values include:
});							// waiting, player1Turn, player2Turn, player1Win, player2Win, stalemate

// Instantiates the schema into a model called game
var game = mongoose.model("game",gameSchema);

// All possible win patterns for the board in the model
var winPattern = [[0,1,2],[0,3,6],[0,4,8],[2,5,8],[2,4,6],[6,7,8],[3,4,5],[1,4,7]];

// Either enables or disables the program from logging comments
var debug = false;

// Functions for logging things to the console
function debugLog(m) {
	if (debug)
		console.log(m);
}
function debugLog(m,n) {
	if (debug) {
		console.log(m,n);
	}
}

// A function that will create a random id string for the games
function createIdString() {
	var id=""; // ID to return to the invoker
	// Loop to create the id
	for (var i=0;i<6;i++) {
		var ltr = Math.floor(Math.random() * 26)+65; // Randomly choose an ascii value
		var ltr1 = String.fromCharCode(ltr);
		id += ltr1;
	}
	debugLog("Id=" + id);
	return id;
}

// This function will drive the id creation and ensure that it is trully unique.
async function createId() {
	var ok = false;
	while (!ok) {	// Keep looping until its unique
		var id = createIdString(); // Invokes the id creation
		try {
			var rec = await getGame(id); // If this returns with a game, then the id is not unique.
			debugLog("check if exists ",rec);
		} catch (error) {
			debugLog("create id reject ", error);
			console.log("Emergency - error on getGame inside createId");
		}
		// If the game is returned, the rec value will not be null
		if (rec==null)
			ok=true;
	}
	//console.log("id="+id);
	return id;
}

// This funciton will get a game given an id
function getGame(gameId) {
	// This will return a promise on wether a game is found or not
	return new Promise(function(resolv,reject) {
		game.findOne({gameId: gameId},function(error, record) {
			// If the game is not found, an error will be produced
			if (error) {
				debugLog("on play, existing id error",error);
				reject(error)
			} 
			// If a game is found, the promise will be resolved.
			else {
				debugLog("getGame=",record);
				resolv(record);
			}
		});
	});
}

// This function will be responsible for creating a game and allowing other players to join games in waiting.
// playerName : String of the player to create or join the game
// gameId : 6 digit string that will either be 0 or random. If 0, it indicates that the game is brand new.
function play(playerName,gameId) {
	// This will return a promise on whether or not a game can be created or joined.
	return new Promise(function(resolv,reject) {
		// If the gameId is 0, then the game is to be created and a random id should be generated.
		if (gameId==="0") {
			// This will create the id then the game will be saved to the database.
			createId().then((id) => {
				// Get the current date and time.
				var date = new Date();
				// Get the time from the date variable
                var time = date.getTime(); 
                // This will create the new game using the schema.
				var rec = new game({
					gameId: id,
					player1Name: playerName,
					player2Name:"",
					nextMove:1,
					moveCnt:0,
					lastMoveTime: time,
					board:[0,0,0,0,0,0,0,0,0],
					state:"waiting"
				});
				// Save the new game to the model.
                rec.save().then(() => {
					resolv(rec);
				});
			});
		} 
		// Given that the gameID provided was not 0, it indicates that a game has already been created.
		else {
			// This function will get the game from the gameId.
			getGame(gameId).then((gamePlay)=> {
				// If the game is not found, then throw an error.
				if (gamePlay===null) {
					reject("game id not found");
				}
				// If the game is found, add a player to the game.
				else {
					gamePlay.set({player2Name:playerName});
					gamePlay.set({state:"player1Turn"});
					// Save the game to the model
					gamePlay.save().then(() => {
						resolv(gamePlay);
					});
				}
			}).catch((err) =>{
				reject(err);
			});
		}
	});
}

// This function will check if a particular board has won.
// thisGame : The game in question will contain a board which will be checked for a win.
function checkWin(thisGame) {
	debugLog("in check win");
	// This will loop through the win pattern that was instantiated earlier and see if this games board matches any of them
	for (var i=0,len=winPattern.length;i<len;i++){
		debugLog("in for " + i + " " + len);
		if (thisGame.board[winPattern[i][0]] != 0 && thisGame.board[winPattern[i][0]] == thisGame.board[winPattern[i][1]] && thisGame.board[winPattern[i][1]] === thisGame.board[winPattern[i][2]]) {
			debugLog("won");
			// If a winner, then check which player has won. If the values are 1, then player1 would win.
			if (thisGame.board[winPattern[i][0]]==1) {
				thisGame.set({state:"player1Win"});
			}
			// If the values are 2, then player2 is the winner.
			else {
				thisGame.set({state:"player2Win"});
			}
			return thisGame;
		}
	}
	return checkStalemate(thisGame);
}

// After checking if there was a winner, the board will be checked for a stalemate.
// thisGame : The game in question will contain a board that will be checked for a stalemate.
function checkStalemate(thisGame) {
	var cnt=0; // Will track how many times the board has been played.
	for (i=0;i<9;i++) 
		if (thisGame.board[i] != 0)
			cnt++;
	// If the board has been played 9 times then the game is a tie
	if (cnt==9) 
		thisGame.set({state:"stalemate"});
	return thisGame;
}

// The move funciton will be responsible for making a move for a given player
// gameId : The id for the game inwhich a move will be made.
// playerName : The name for the player that is making a move.
// move : The move that is being made by the player.
function move(gameId,playerName,move) {
	// Return a promise that will show whether a move can or can't be made.
	return new Promise(function(resolv,reject) {
		// this will get the game with the gameid.
		var thisGame = getGame(gameId).then((thisGame) => {
				// If the game is null, then a  game couldn't be found with the supplied id.
				if (thisGame == null) {
					var ret = {status:"fail",msg:"Invalid thisGame"}; // Send JSON explaining the failure
					reject(ret);
					return;
				}
				debugLog("checking for waiting");
				// If the state of the game is waiting, which indicates a second player has not joined
				// therefore, a move cannot be made.
				if (thisGame.state == "waiting") {
					debugLog("error on move - in waiting");
					var ret = {status: "gameNotStarted",thisGame:thisGame};
					reject(ret);
					return;
				}
				debugLog("checking for move when game is won");
				// If a player has won, either player1 or player2
				if (thisGame.state == "player1Win" || thisGame.state == "player2Win") {
					debugLog("error on move - in waiting");
					var ret = {status: "gameOver",thisGame:thisGame};
					reject(ret);
					return;
				}
				debugLog("check turn " + playerName + " " +  thisGame.state);
				// This will ensure that the right player is making the move.
				if (!(thisGame.state == "player1Turn" && playerName === thisGame.player1Name) && !(thisGame.state == "player2Turn" && playerName === thisGame.player2Name)) {
					//console.log("failed check turn");
					var ret = {status:"fail",msg:"not your turn",thisGame:thisGame};
					reject(ret);
					return;
				}

				// This ensures that the move is valid. The move must be between 0 and 8 and a player musnt've
				// played in the move's place.
				if (move <0 || move >8 ||  thisGame.board[move] != 0) {
					var ret = {status:"fail",msg:"invalid move",thisGame:thisGame};
					reject(ret);
					return;
				}

				// Instantiates the board of the game provided as a parameter.
				board = thisGame.board;
				// For player1's turn.
				if (thisGame.state == "player1Turn") {
					board[move] = 1;
					thisGame.set({state: "player2Turn"});
					thisGame.set({board:board});
					//console.log("set ",thisGame);
				}
				// For player2's turn.
				else {
					board[move] = 2;
					thisGame.set({state: "player1Turn"});
					thisGame.set({board:board});
				}

				// This bit of code will check for whether a user has won or a stalemate after the move
				// has been made.
				debugLog("checking for win");
				thisGame = checkWin(thisGame);
				debugLog(thisGame.state);

				// Preps the game to be saved in the model.
				thisGame.markModified('board');
				var a = thisGame.moveCnt+1;
				thisGame.set({moveCnt:a});
				var d = new Date();
				var now = d.getTime();
				thisGame.set({lastMoveTime:now});
				thisGame.save((err,u) => {
					var ret = {status:"ok",msg:"",thisGame:thisGame}
					resolv(ret);
				});
			});
	});
}

// This function will return all games that are stored in the model.
function getGames() {
	// Will return either a success or failure.
	return new Promise(function(resolv,reject) {
		game.find(function(error,record) {
			// If there is an error finding the game.
			if (error) {
				reject(error)
			} 
			// If the game is found.
			else {
				resolv(record);
			}
		});
	});
}

// This function will clear all games from the model before a certain date
function clear(date) {
	return new Promise(function(resolv, reject) {
		// Delete games on condition that the move is before the date specified.
        game.deleteMany( {lastMoveTime : { $lt : date }}, function(err, result) {
			if (err) {
				reject(err);
			}
			resolv(result);
        });
	});
}

// Will track the players logged
var players= [];

// This function will get the indext for a name provided given players logged.
function getIndex(name) {
	for (i=0;i<players.length;i++) {
		if (players[i].name == name) {
			return i;
		}
	}
	return -1;
}

// This function will get stats for all of the players that are logged in the model.
function getStats() {
	// re-declares the players object to an empty array.
	players =  [];
	return new Promise(function(resolv,reject) {
		// The funciton will loop through all games
		game.find(function(error,record) {
			for (var i=0;i<record.length;i++) {
				// This function will get the index of the player1
				var num1  = getIndex(record[i].player1Name);
				if (num1==-1) {
					var newP={name:record[i].player1Name,won:0,lost:0,stalemate:0};
					players.push(newP);
					num1 = getIndex(record[i].player1Name);
				}
				// This funciton will get the index of the player2
				var num2  = getIndex(record[i].player2Name);
				if (num2==-1) {
					var newP2={name:record[i].player2Name,won:0,lost:0,stalemate:0};
					players.push(newP2);
					num2  = getIndex(record[i].player2Name);
				}

				// If player1 wins increment the win columns and decrement teh loss column for the other player
				if (record[i].state=="player1Win") {
					players[num1].won++;
					players[num2].lost++;
				}

				// If player2 wins increment the win columns and decrement teh loss column for the other player
				else if (record[i].state=="player2Win")	{
					players[num1].lost++;
					players[num2].won++;
				}

				// If there is a tie, increment this column up for both.
				else if (record[i].state == "stalemate") {
					players[num1].stalemate++;
					players[num2].stalemate++;
				}
			}
			resolv(players);
		});
	});
}


// Export all public methods to be accessed by the express app
exports.play = play; 
exports.clear = clear;
exports.getGame = getGame;
exports.move = move;
exports.getGames = getGames;
exports.getStats = getStats;
