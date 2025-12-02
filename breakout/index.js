
// ----- Serial + joystick variables -----
const BAUD_RATE = 9600;   // must match Arduino
const MAX_DIST = 512;     // max joystick distance from center

// Paddle config
const paddleWidth = 120;
const paddleHeight = 20;

// joystick state
let joyX = 0;     // joystick raw x-axis value from Arduino
let joyY = 0;
let joyBtn = 1;   // 1 = not pressed, 0 = pressed
let smoothedX = 0;

// game state
let level = 1;
let lives = 3;
let gameStarted = false;

// p5play objects
let walls, paddle, ball, bricks;

// serial globals
let port, connectBtn;

function setup() {
  setupSerial();

  new Canvas(850, 650);
  displayMode('centered'); // center canvas on page

  // text setup
  textFont("Press Start 2P", 30);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);


  init();

}

function draw() {
  // black canvas
  background(0);

  // Serial / joystick input
  receiveData();

  // UI (score + instructions)
  drawInstruction();

  // Start game with joystick button
  if (!gameStarted && joyBtn === 0) {
    startGame();
  }

  if (!gameStarted) {
    return;
  }

  // Update paddle from joystick
  updatePaddleFromJoystick();

  // Check if all bricks are destroyed - level up!
  if (bricks.length === 0) {
    level++;
    nextLevel();
  }

  // Ball falls off bottom - lose a life
  if (ball.y - ball.d / 2 > canvas.h) {
    sendLedCommand('R'); // miss = red LED
    lives--;

    if (lives <= 0) {
      // Game over - reset everything
      gameStarted = false;
      ball.speed = 0;
      level = 1;
      lives = 3;
    } else {
      // Still have lives - reset ball
      resetBall();
    }
  }
}

function startGame() {
  level = 1;
  lives = 3;
  gameStarted = true;

  // Clear old bricks
  bricks.removeAll();
  createBricks();

  resetBall();

  // Reset smoothing so paddle doesn't jump
  smoothedX = 0;
}

function nextLevel() {
  // Clear old bricks and create new ones
  bricks.removeAll();
  createBricks();

  resetBall();
}

function resetBall() {
  // Reset ball near bottom center, shooting upward
  ball.x = canvas.w / 2;
  ball.y = canvas.h - 200;
  ball.direction = 90 + random(-10, 10); // mostly upward
  ball.speed = 6;

  // Reset paddle to center
  paddle.x = canvas.w / 2;

  // Reset paddle smoothing so it can move freely
  smoothedX = 0;

  // Reset joystick readings to avoid jump
  joyX = 0;
  joyY = 0;
}

function init() {
  // default sprite color
  allSprites.color = 'white';

  bricks = new Group();
  bricks.collider = 'static';
  bricks.w = 80;
  bricks.h = 30;
  bricks.tile = '=';

  createBricks();

  // Create thin black walls that fit within the canvas
  walls = new Group();
  walls.collider = 'static';
  walls.color = 'black';
  walls.stroke = 'white';
  walls.strokeWeight = 2;

  // Top wall - horizontal
  new walls.Sprite(canvas.w / 2, 2.5, canvas.w, 5);

  // Left wall - vertical
  new walls.Sprite(2.5, canvas.h / 2, 5, canvas.h);

  // Right wall - vertical
  new walls.Sprite(canvas.w - 2.5, canvas.h / 2, 5, canvas.h);

  paddle = new Sprite(canvas.w / 2, canvas.h - 40, paddleWidth, paddleHeight);
  paddle.rotationLock = true;
  paddle.collider = 'kinematic';   // <- not affected by forces / collisions
  paddle.y = canvas.h - 20;        // <- make sure it starts at fixed y
  paddle.color = 'lightgrey';      // Light blue color for paddle

  ball = new Sprite(canvas.w / 2, canvas.h - 200, 20);
  ball.bounciness = 1;
  ball.friction = 0;
  ball.speed = 0; // will be set when game starts
  ball.color = 'lightgrey';            // White color for ball

  // Ball hits a brick
  ball.collides(bricks, (ball, brick) => {
    brick.remove();
    sendLedCommand('G');   // success = green LED
  });

  // Ball hits paddle → adjust bounce
  ball.collides(paddle, (ball, paddle) => {
    ball.direction += (ball.x - paddle.x) / 2;
    ball.speed = 8;
  });
}

function createBricks() {
  bricks.removeAll();

  // Define colors for each row
  const colors = ['red', 'orange', 'yellow', 'green', 'cyan'];

  new Tiles(
    [
      '==========',
      '==========',
      '==========',
      '==========',
      '==========',
    ],
    47,  // x position - centered with wall spacing
    25,  // y position
    bricks.w + 4,  // spacing between bricks horizontally
    bricks.h + 4   // spacing between bricks vertically
  );

  // Color each row differently
  let index = 0;
  for (let brick of bricks) {
    let row = Math.floor(index / 10); // 10 bricks per row
    brick.color = colors[row];
    index++;
  }
}


function drawInstruction() {
  fill(255);

  // Level at top-left
  textAlign(LEFT, TOP);
  textSize(14);
  text(`Level: ${level}`, 20, canvas.h - 60);

  // Lives at top-right
  textAlign(RIGHT, TOP);
  textSize(14);
  text(`Lives: ${lives}`, canvas.w - 20, canvas.h - 60);

  // Flashing instruction in center when game is stopped
  if (!gameStarted) {
    // Smooth pulsing effect using sine wave (faster speed)
    let opacity = abs(sin(frameCount * 1.7)) * 255;

    fill(255, 255, 255, opacity);
    textAlign(CENTER, CENTER);
    textSize(22);
    text("Press joystick button to begin", canvas.w / 2, canvas.h / 2);
  }
}


function updatePaddleFromJoystick() {
  if (isNaN(joyX)) return;

  let normX = joyX / MAX_DIST;
  normX = constrain(normX, -1, 1);

  smoothedX = lerp(smoothedX, normX, 0.2);
  if (isNaN(smoothedX)) smoothedX = 0;

  // move paddle horizontally only
  paddle.x += smoothedX * 15;

  // lock vertical position
  paddle.y = canvas.h - 20;

  // keep paddle inside the walls (5px wall width)
  const leftLimit = 5 + paddleWidth / 2;
  const rightLimit = canvas.w - 5 - paddleWidth / 2;
  paddle.x = constrain(paddle.x, leftLimit, rightLimit);
}

// Send LED command to Arduino
function sendLedCommand(cmd) {
  const portIsOpen = checkPort();
  if (!portIsOpen) return;
  port.write(cmd + "\n");
}

function receiveData() {
  const portIsOpen = checkPort();
  if (!portIsOpen) return;

  let vals = port.readUntil("\n");
  if (!vals) return;

  let dataArray = vals.trim().split(",");
  joyX = int(dataArray[0]);
  joyY = int(dataArray[1]);
  joyBtn = int(dataArray[2]);

  if (isNaN(joyX) || isNaN(joyY) || isNaN(joyBtn)) {
    joyX = 0;
    joyY = 0;
    joyBtn = 1;
  }
}

function setupSerial() {
  port = createSerial();

  // Check to see if there are any ports we have used previously
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    port.open(usedPorts[0], BAUD_RATE);
  }

  // create a connect button
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(5, 5);
  connectBtn.mouseClicked(onConnectButtonClicked);
}

function checkPort() {
  if (!port.opened()) {
    connectBtn.html("Connect to Arduino");
    return false;
  } else {
    connectBtn.html("Disconnect");
    return true;
  }
}

function onConnectButtonClicked() {
  if (!port.opened()) {
    port.open(BAUD_RATE);
  } else {
    port.close();
  }
}
