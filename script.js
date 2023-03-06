const SCREEN_SIZE = Math.min(480, window.innerWidth, window.innerHeight - 100);
const GRID_SIZE = 3;
const PIECE_SIZE = SCREEN_SIZE / GRID_SIZE;
const PUZZLE = [];
const DIFFICUTY = 200;

let gameEnded = false;
let gameFroze = true;
let lastPiece;
let img;
let startTime;
let currentTime;

// DOM
const btn = document.getElementById("btn");
const upBtn = document.getElementById("up-btn");
const leftBtn = document.getElementById("left-btn");
const downBtn = document.getElementById("down-btn");
const rightBtn = document.getElementById("right-btn");
const time = document.getElementById("time");
const instructions = document.getElementById("instructions");
const heading = document.getElementById("heading");
let canvas;

btn.addEventListener("click", (e) => {
  e.target.disabled = true;
  btn.style.display = "none";
  instructions.style.display = "block";

  // Randomize the pieces
  for (let i = 0; i < DIFFICUTY; i++) {
    setTimeout(randomize, 10 * i);
  }

  setTimeout(() => {
    // Unfroze the keyboard && restart the game if needed
    gameFroze = false;
    gameEnded = false;

    // Start the drawing loop
    loop();

    // Save the starting time
    startTime = new Date().getTime();
  }, 1500);
});

function preload() {
  imgNum = Math.floor(Math.random() * 25);
  img = loadImage(
    "https://raw.githubusercontent.com/millingab/benlo.github.io/main/" +
      String(imgNum) +
      ".png"
  );
}

function setup() {
  canvas = createCanvas(SCREEN_SIZE, SCREEN_SIZE);
  for (let x = 0; x < GRID_SIZE; x++) {
    PUZZLE.push([]);
    for (let y = 0; y < GRID_SIZE; y++) {
      PUZZLE[x].push(new Piece(x, y, PIECE_SIZE, img));
    }
  }

  lastPiece = PUZZLE[GRID_SIZE - 1][GRID_SIZE - 1];
  // Empty out the last spot
  lastPiece.isEmpty = true;
}

function draw() {
  background(255);

  // Update current time
  currentTime = new Date().getTime();
  let diff = Math.floor((currentTime - startTime) / 1000);

  if (!gameEnded) {
    PUZZLE.forEach((row) =>
      row.forEach((piece) => {
        piece.draw();
      })
    );

    // update the DOM
    time.innerHTML = diff ? `${diff} sec` : "";
    time.style.display = diff ? "block" : "none";
  } else {
    background(200);
    stroke(0);
    textSize(width / 20);
    text(`YOU WON IN ${diff}s!`, width / 2, height / 2);
    textSize(width / 30);
    text("Click the start button to play again!", width / 2, height / 2 + 50);
    noLoop();

    btn.disabled = false;
  }
}

function keyPressed() {
  if (!gameFroze) {
    if (keyCode === UP_ARROW) {
      moveLastPiece("up");
    }
    if (keyCode === RIGHT_ARROW) {
      moveLastPiece("right");
    }
    if (keyCode === DOWN_ARROW) {
      moveLastPiece("down");
    }
    if (keyCode === LEFT_ARROW) {
      moveLastPiece("left");
    }
    checkGame();
  }
}

upBtn.addEventListener("click", () => {
  moveLastPiece("up");
  checkGame();
});

downBtn.addEventListener("click", () => {
  moveLastPiece("down");
  checkGame();
});

leftBtn.addEventListener("click", () => {
  moveLastPiece("left");
  checkGame();
});

rightBtn.addEventListener("click", () => {
  moveLastPiece("right");
  checkGame();
});

function moveLastPiece(direction) {
  const { x, y } = lastPiece;
  let targetedPiece;

  switch (direction) {
    case "up": {
      const targetY = y - 1;
      if (targetY > -1) {
        targetedPiece = findPieceByPosition(x, targetY);
      }
      break;
    }
    case "right": {
      const targetX = x + 1;
      if (targetX < GRID_SIZE) {
        targetedPiece = findPieceByPosition(targetX, y);
      }
      break;
    }
    case "down": {
      const targetY = y + 1;
      if (targetY < GRID_SIZE) {
        targetedPiece = findPieceByPosition(x, targetY);
      }
      break;
    }
    case "left": {
      const targetX = x - 1;
      if (targetX > -1) {
        targetedPiece = findPieceByPosition(targetX, y);
      }
      break;
    }
  }

  if (targetedPiece) {
    let { x: tempX, y: tempY } = targetedPiece;
    let tempPos = targetedPiece.pos.copy();
    targetedPiece.x = lastPiece.x;
    targetedPiece.y = lastPiece.y;
    targetedPiece.pos = lastPiece.pos.copy();
    lastPiece.x = tempX;
    lastPiece.y = tempY;
    lastPiece.pos = tempPos;
  }
}

function findPieceByPosition(x, y) {
  for (let i = 0; i < PUZZLE.length; i++) {
    for (let j = 0; j < PUZZLE[i].length; j++) {
      let current = PUZZLE[i][j];
      if (current.x === x && current.y === y) {
        return current;
      }
    }
  }
}

function randomize() {
  let ran = random();
  let pos;
  if (ran < 0.25) {
    pos = "up";
  } else if (ran < 0.5) {
    pos = "right";
  } else if (ran < 0.75) {
    pos = "down";
  } else if (ran < 1) {
    pos = "left";
  }
  moveLastPiece(pos);
}

function checkGame() {
  for (let i = 0; i < PUZZLE.length; i++) {
    for (let j = 0; j < PUZZLE[i].length; j++) {
      let current = PUZZLE[i][j];
      if (
        current.targetPos.x !== current.pos.x ||
        current.targetPos.y !== current.pos.y
      ) {
        return;
      }
    }
  }

  gameFroze = true;
  gameEnded = true;
  heading.innerHTML = "Congrats! BEN is GAY!";
  canvas.canvas.classList.add("woop");
}
class Piece {
  constructor(x, y, size, img) {
    this.x = x;
    this.y = y;
    this.targetPos = createVector(this.x * size, this.y * size);
    this.pos = this.targetPos.copy();
    this.size = size;
    this.isEmpty = false;
    this.img = img;
    this.id = this.x + this.y * 3 + 1;
  }

  draw() {
    stroke(0);
    if (img.width < img.height) {
      this.img.resize(width, 0);
    } else {
      this.img.resize(0, height);
    }

    if (!this.isEmpty) {
      image(
        this.img,
        this.pos.x,
        this.pos.y,
        this.size,
        this.size,
        this.targetPos.x,
        this.targetPos.y,
        this.size,
        this.size
      );
    }

    if (!this.isEmpty) {
      fill(0);
      // textAlign(CENTER, CENTER);
      // textSize(24);
      // text(this.id, this.pos.x + this.size / 2, this.pos.y + this.size / 2);
    }
  }
}
