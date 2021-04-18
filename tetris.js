var game;
var score = 0;
var user;
var playerScores;
var highScoresString;
var highScores;
var winOrLose = "playing";
var startX = 3;
var startY = 0;
var verticalArea = 20;
var horizantalArea = 15;
var coordinateArray = [...Array(verticalArea)].map((e) =>
  Array(horizantalArea).fill(0)
);
var curTetromino = [];
var tetrominoCopy;
var randomColor;
var tetrominos;
var number = 0;
var stater = "old";
var container = document.querySelector(".container");
var tetrominos1 = [];
var randomTetromino;
var tetrominoColors = [
  "rgb(157, 141, 248)", //light purple
  "cyan",
  "rgb(87, 171, 255)", // blue
  "rgb(250, 227, 71)", //yellow
  "rgb(252,171,238)", //orange
  "lightgreen",
  "rgb(250, 65, 165)", //pink
];
var curTetrominoColor;
var collision = false;
var stoppedTetris = [];
var deleteTetris = [];
var DIRECTION = {
  down: 1,
  left: 2,
  right: 3,
};
var direction;

localStorage.setItem("score", score);

document.querySelector(".score-board").innerHTML =
  "SCORE:" +
  localStorage.getItem("score") +
  "<br/> HIGHEST: " +
  localStorage.getItem("high score");

function setUserName() {
  user = document.querySelector(".name").value;

  if (user === "") {
    user = "anonymous";
  }

  localStorage.setItem("username", user);

  document.querySelector(".name").value = "";
}

function getUserName() {
  var userName = {
    score: score,
    player: user,
  };

  if (highScores === undefined) {
    highScoresString = JSON.stringify([]);
  } else {
    highScoresString = JSON.stringify(highScores);
  }

  localStorage.setItem("high", highScoresString);

  highScores = JSON.parse(localStorage.getItem("high"));

  var unique = highScores.some(function (item) {
    return item.player == userName.player;
  });

  var isSamewithOLdPlayerName = highScores.filter(function (item) {
    //sadece function return dönerek yapmaya çalış for'la(good partstan)
    return item.player == userName.player;
  });

  if (!unique) {
    highScores.push(userName);
  } else {
    if (
      isSamewithOLdPlayerName[isSamewithOLdPlayerName.length - 1].score <
      userName.score
    ) {
      //ilk condition: yani bu arraye bişey attıysak
      highScores.splice(highScores.indexOf(isSamewithOLdPlayerName[0]), 1);
      highScores.push(userName);
    }
  }

  highScores.sort((a, b) => b.score - a.score);

  if (highScores.length > 5) {
    highScores.pop();
  }

  highScores.forEach(function (item, key) {
    playerScores = key + 1 + ". " + item.player + ": " + item.score;
    document.querySelector(".game-over").innerHTML += "<br />" + playerScores;
  });
}

function Coordinates(x, y) {
  this.x = x;
  this.y = y;
}

function createPiece(x, y) {
  this.pieceElement = document.createElement("div");

  this.pieceElement.className = "tetris";

  this.pieceElement.style.left = x + "px";
  this.pieceElement.style.top = y + "px";
  this.pieceElement.style.backgroundColor = curTetrominoColor;

  container.appendChild(this.pieceElement);
}

function createCoordArray() {
  var i = 0,
    j = 0;

  for (var y = 0; y < 600; y += 30) {
    for (var x = 0; x < 450; x += 30) {
      coordinateArray[i][j] = new Coordinates(x, y);

      i++;
    }

    j++;
    i = 0;
  }
}

function increaseScore() {
  localStorage.setItem("score", score);

  if (
    localStorage.getItem("high score") === null ||
    (!!localStorage.getItem("high score") &&
      score > localStorage.getItem("high score"))
  ) {
    localStorage.setItem("high score", score);
  }

  document.querySelector(".score-board").innerHTML =
    "SCORE:" +
    localStorage.getItem("score") +
    "<br/> HIGHEST: " +
    localStorage.getItem("high score");
}

function moveDownAllStopped() {
  for (var i = 0; i < stoppedTetris.length; i++) {
    if (stoppedTetris[i][1] < limit) {
      stoppedTetris[i][1]++;

      var x = stoppedTetris[i][0];
      var y = stoppedTetris[i][1];

      document.querySelectorAll(".stopped")[i].style.left =
        coordinateArray[x][y].x + "px";
      document.querySelectorAll(".stopped")[i].style.top =
        coordinateArray[x][y].y + "px";
    }
  }
}

function deleteRow() {
  var count = 0;
  var maincount = 0;

  deleteTetris = [];

  for (var i = 19; i >= 0; i--) {
    for (var j = 0; j < stoppedTetris.length; j++) {
      if (stoppedTetris[j][1] === i) {
        count++;

        deleteTetris.push(stoppedTetris[j]);
      }

      maincount++;
    }

    if (count === horizantalArea) {
      var filtered = stoppedTetris.filter(function (value) {
        return value[1] != i;
      });

      stoppedTetris = filtered;
      limit = i;

      for (var m = 0; m < deleteTetris.length; m++) {
        var x = deleteTetris[m][0];
        var y = deleteTetris[m][1];
        var coorX = coordinateArray[x][y].x;
        var coorY = coordinateArray[x][y].y;

        document.querySelectorAll(".stopped").forEach(function (value) {
          if (
            value.style.left === coorX + "px" &&
            value.style.top === coorY + "px"
          ) {
            value.remove();
          }
        });
      }

      moveDownAllStopped();

      score = score + 100;

      increaseScore();

      i++;
    }

    deleteTetris = [];
    count = 0;
    maincount = 0;
  }
}

function hittingTheLeftWall() {
  tetrominoCopy = curTetromino;

  for (var i = 0; i < tetrominoCopy.length; i++) {
    var x = tetrominoCopy[i][0] + startX;
    var y = tetrominoCopy[i][1] + startY;

    if (x <= 0) {
      return true;
    }

    x--; //yukarda geri sıfırlıyor zaten.

    for (var j = 0; j < stoppedTetris.length; j++) {
      if (stoppedTetris[j][0] === x && stoppedTetris[j][1] === y) {
        return true;
      }
    }
  }
  return false;
}

function hittingTheRightWall() {
  tetrominoCopy = curTetromino;

  for (var i = 0; i < tetrominoCopy.length; i++) {
    var x = tetrominoCopy[i][0] + startX;
    var y = tetrominoCopy[i][1] + startY;

    if (x >= 14) {
      return true;
    }

    x++;

    for (var j = 0; j < stoppedTetris.length; j++) {
      if (stoppedTetris[j][0] === x && stoppedTetris[j][1] === y) {
        return true;
      }
    }
  }

  return false;
}

function setTetromino() {
  var intersection = [];

  startX = 3;
  startY = 0;

  for (var i = 0; i < curTetromino.length; i++) {
    var x = curTetromino[i][0] + startX;
    var y = curTetromino[i][1] + startY;

    if (stoppedTetris.length > 0) {
      stoppedTetris.forEach(function (element) {
        if (element[0] === x && element[1] === y) {
          intersection.push([x, y]);
        }
      });

      if (intersection.length > 0) {
        winOrLose = "gameOver";

        clearInterval(game);

        finishGame();
        break;
      } else {
        var coorX = coordinateArray[x][y].x;
        var coorY = coordinateArray[x][y].y;

        new createPiece(coorX, coorY);
      }
    } else {
      var coorX = coordinateArray[x][y].x;
      var coorY = coordinateArray[x][y].y;
      new createPiece(coorX, coorY);
    }
  }
}

function changeCurTetromino() {
  stater = "new";

  document.querySelectorAll(".tetris").forEach(function (value) {
    value.className = "stopped";
  });

  for (var i = 0; i < curTetromino.length; i++) {
    var x = curTetromino[i][0] + startX;
    var y = curTetromino[i][1] + startY;

    stoppedTetris.push([x, y]);
  }

  deleteRow();
  createTetromino();
  setTetromino();
}

function changePosition() {
  for (var i = 0; i < curTetromino.length; i++) {
    var x = curTetromino[i][0] + startX;
    var y = curTetromino[i][1] + startY;

    document.querySelectorAll(".tetris")[i].style.left =
      coordinateArray[x][y].x + "px";
    document.querySelectorAll(".tetris")[i].style.top =
      coordinateArray[x][y].y + "px";
  }
}

function gameInterval() {
  direction = DIRECTION.down;

  CheckForVerticalCollison();

  if (!collision && stater === "old" && winOrLose === "playing") {
    startY++;

    changePosition();
  }

  if (stater === "new") {
    stater = "old";
  }
}

function setUp() {
  document.addEventListener("keydown", HandleKeyPress);

  startX = 3;
  startY = 0;
  tetrominoCopy = [];
  winOrLose = "playing";
  stoppedTetris = [];

  createTetromino();
  setTetromino();

  game = setInterval(gameInterval, 1000);
}

function HandleKeyPress(key) {
  if (winOrLose === "playing") {
    if (key.keyCode === 32) {
      //space
      clearInterval(game);

      var pause = document.createElement("div");

      pause.className = "pause";
      pause.innerHTML = "Press SPACE to continue";
      winOrLose = "break";

      container.appendChild(pause);
    } else if (key.keyCode === 37) {
      direction = DIRECTION.left;

      if (!hittingTheLeftWall()) {
        startX--;
        changePosition();
      }
    } else if (key.keyCode === 39) {
      direction = DIRECTION.right;

      if (!hittingTheRightWall()) {
        startX++;
        changePosition();
      }
    } else if (key.keyCode === 40) {
      //DOWN
      moveTetrominoDown();
    } else if (key.keyCode === 38) {
      //UP
      if (!rotateTetromino()) {
        curTetromino = tetrominos[number][randomTetromino];
        changePosition();
      }
    }
  } else if (winOrLose === "break") {
    if (key.keyCode === 32) {
      winOrLose = "playing";

      game = setInterval(gameInterval, 1000);

      document.querySelector(".pause").remove();
    }
  }
}

function moveTetrominoDown() {
  if (direction === DIRECTION.down) {
    score++;

    increaseScore();
  }

  direction = DIRECTION.down;

  CheckForVerticalCollison();

  if (!collision && stater === "old") {
    startY++;
    changePosition();
  }

  if (stater === "new") {
    stater = "old";
  }
}

function createTetrominos() {
  // Push L
  tetrominos1.push([
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
  // Push T
  tetrominos1.push([
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
  // Push I
  tetrominos1.push([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
  // Push J
  tetrominos1.push([
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
  // Push Square
  tetrominos1.push([
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]);

  // Push S
  tetrominos1.push([
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ]);
  // Push Z
  tetrominos1.push([
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ]);

  var tetrominos2 = [
    [
      [2, 2],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ],
    [
      [2, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [2, 1],
      [2, 2],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 2],
    ],
  ];

  var tetrominos3 = [
    [
      [0, 2],
      [2, 1],
      [1, 1],
      [0, 1],
    ],
    [
      [1, 2],
      [2, 1],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    [
      [2, 2],
      [2, 1],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  ];

  var tetrominos4 = [
    [
      [0, 0],
      [1, 2],
      [1, 1],
      [1, 0],
    ],
    [
      [0, 1],
      [1, 2],
      [1, 1],
      [1, 0],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ],
    [
      [0, 2],
      [1, 2],
      [1, 1],
      [1, 0],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [2, 1],
      [2, 2],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 2],
    ],
  ];

  tetrominos = [tetrominos1, tetrominos2, tetrominos3, tetrominos4];
}

function createTetromino() {
  number = 0;

  randomTetromino = Math.floor(Math.random() * tetrominos1.length);
  curTetromino = tetrominos[number][randomTetromino];

  curTetrominoColor = tetrominoColors[randomTetromino];
}

function rotateTetromino() {
  if (number < 3) {
    number++;
  } else {
    number = 0;
  }

  tetrominoCopy = tetrominos[number][randomTetromino];

  for (var i = 0; i < tetrominoCopy.length; i++) {
    var x = tetrominoCopy[i][0] + startX;
    var y = tetrominoCopy[i][1] + startY;

    if (x < 0 || x >= horizantalArea || y >= verticalArea) {
      number--;
      return true;
    }

    if (stoppedTetris.length > 0) {
      for (var j = 0; j < stoppedTetris.length; j++) {
        if (stoppedTetris[j][0] === x && stoppedTetris[j][1] === y) {
          number--;
          return true;
        }
      }
    }
  }
  return false;
}

function CheckForVerticalCollison() {
  tetrominoCopy = curTetromino;

  for (var i = 0; i < tetrominoCopy.length; i++) {
    var x = tetrominoCopy[i][0] + startX;
    var y = tetrominoCopy[i][1] + startY;

    if (direction === DIRECTION.down) {
      y++;
    }

    if (y >= verticalArea) {
      collision = true;
      changeCurTetromino();
      collision = false;
      break;
    }

    if (stoppedTetris.length > 0) {
      for (var j = 0; j < stoppedTetris.length; j++) {
        if (stoppedTetris[j][0] === x && stoppedTetris[j][1] === y) {
          collision = true;

          changeCurTetromino();
          break;
        }
      }

      if (collision) {
        collision = false;
        break;
      }
    }
  }
}

function finishGame() {
  var replayButton = document.createElement("button");
  var gameOverBoard = document.createElement("div");

  gameOverBoard.className = "game-over";
  replayButton.className = "replay-button";

  replayButton.innerHTML = "PLAY AGAIN";

  container.appendChild(gameOverBoard);

  getUserName();

  gameOverBoard.appendChild(replayButton);
  replayButton.addEventListener("click", function () {
    score = 0;
    increaseScore();

    document.querySelectorAll(".tetris").forEach(function (value) {
      value.remove();
    });

    document.querySelectorAll(".stopped").forEach(function (value) {
      value.remove();
    });

    gameOverBoard.remove();

    setStartBoard();
  });
}

function setStartBoard() {
  var startBoard = document.createElement("div");
  var startButton = document.createElement("button");
  var nameInput = document.createElement("input");

  startBoard.className = "start-game";
  nameInput.className = "name";

  container.appendChild(startBoard);
  startBoard.appendChild(nameInput);
  document.querySelector(".start-game").appendChild(startButton);

  nameInput.placeholder = "USER NAME";

  startButton.innerHTML = "PLAY";

  startButton.addEventListener("click", function (event) {
    setUserName();

    event.target.parentNode.remove();

    setUp();
  });
}

setStartBoard();
createTetrominos();
createCoordArray();
