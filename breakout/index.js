
const BAUD_RATE = 9600;   // must match Arduino
const MAX_DIST = 512;     // max joystick distance from center

// paddle config
const paddleWidth = 120; // width of paddle
const paddleHeight = 20; // height of paddle

// joystick state
let joyX = 0;     // joystick raw x-axis value from Arduino
let joyY = 0;     // joystick raw y-axis value from Arduino (not used, but could be in the future)
let joyBtn = 1;   // joystick button state: 1 = not pressed, 0 = pressed
let smoothedX = 0; // smoothed x-axis value

// game state
let level = 1; // current level
let lives = 3; // number of lives
let gameStarted = false; // game state: false = not started, true = started

// p5play objects
let walls, paddle, ball, bricks;

// serial connection
let port, connectBtn;

function setup() {
  setupSerial(); // setup serial connection

  new Canvas(850, 650); // create canvas
  displayMode('centered'); // center canvas in browser window

  // text setup
  textFont("Press Start 2P", 30); // set font to Press Start 2P
  textStyle(BOLD); // set text style to bold
  textAlign(CENTER, CENTER); // center text

  init(); // initialize game objects

}

function draw() {
  background(0); // draw black background

  receiveData(); // receive data from Arduino

  drawInstruction(); // draw UI (score + instructions)

  // if game not started and joystick button is pressed, start game
  if (!gameStarted && joyBtn === 0) {
    startGame(); // start game
  }

  // if game not started, do nothing (avoid updating paddle and ball)
  if (!gameStarted) {
    return;
  }

  updatePaddleFromJoystick(); // update paddle position from joystick

  // if all bricks are destroyed, level up!
  if (bricks.length === 0) {
    level++; // increment level by 1
    nextLevel(); // create new bricks
  }

  // if ball falls off bottom, lose a life
  if (ball.y - ball.d / 2 > canvas.h) {
    sendCommand('F'); // F = fail/miss to trigger buzzer sound
    lives--; // decrement lives by 1

    if (lives <= 0) {
      // Game over -> reset everything
      gameStarted = false; // set game state to false
      ball.speed = 0; // set ball speed to 0
      level = 1; // reset level to 1
      lives = 3; // reset lives to 3
    } else {
      // still have lives, reset ball position
      resetBall(); // reset ball position
    }
  }
}

// start game and reset game state
function startGame() {
  level = 1; // reset level to 1
  lives = 3; // reset lives to 3
  gameStarted = true; // set game state to true

  bricks.removeAll(); // remove all bricks
  createBricks(); // create new bricks

  resetBall(); // reset ball position

  smoothedX = 0; // reset paddle smoothing so it doesn't jump
}

// create new bricks and reset ball position for next level
function nextLevel() {
  bricks.removeAll(); // remove all bricks
  createBricks(); // create new bricks

  resetBall(); // reset ball position
}

function resetBall() {
  // Reset ball near bottom center, shooting upward
  ball.x = canvas.w / 2; // set ball x position to center of canvas
  ball.y = canvas.h - 200; // set ball y position to bottom of canvas
  ball.direction = 90 + random(-10, 10); // mostly upward random direction
  ball.speed = 6; // set ball speed to 6

  paddle.x = canvas.w / 2; // set paddle x position to center of canvas
  smoothedX = 0; // reset paddle smoothing so it doesn't jump

  joyX = 0; // reset joystick x position to 0
  joyY = 0; // reset joystick y position to 0
}

function init() {
  allSprites.color = 'white'; // set default color for all sprites to white

  bricks = new Group(); // create new group for bricks
  bricks.collider = 'static'; // set bricks collider to static
  bricks.w = 80; // set bricks width to 80
  bricks.h = 30; // set bricks height to 30
  bricks.tile = '='; // set bricks tile to be =

  createBricks(); // create new bricks

  walls = new Group(); // create new group for walls
  walls.collider = 'static'; // set walls collider to static
  walls.color = 'black'; // set walls color to black
  walls.stroke = 'white'; // set walls stroke to white
  walls.strokeWeight = 2; // set walls stroke weight to 2

  new walls.Sprite(canvas.w / 2, 2.5, canvas.w, 5); // create top wall
  new walls.Sprite(2.5, canvas.h / 2, 5, canvas.h); // create left wall
  new walls.Sprite(canvas.w - 2.5, canvas.h / 2, 5, canvas.h); // create right wall

  paddle = new Sprite(canvas.w / 2, canvas.h - 40, paddleWidth, paddleHeight); // create paddle
  paddle.rotationLock = true; // set paddle rotation lock to true
  paddle.collider = 'kinematic'; // not affected by physics
  paddle.y = canvas.h - 20; // locked y position
  paddle.color = 'lightgrey'; // set paddle color to lightgrey

  ball = new Sprite(canvas.w / 2, canvas.h - 200, 20); // create ball
  ball.bounciness = 1; // set ball bounciness to 1
  ball.friction = 0; // set ball friction to 0
  ball.speed = 0; // will be set when game starts
  ball.color = 'lightgrey'; // set ball color to lightgrey

  // if ball hits brick -> remove brick
  ball.collides(bricks, (ball, brick) => {
    brick.remove(); // remove brick
  });

  // if ball hits paddle -> adjust bounce
  ball.collides(paddle, (ball, paddle) => {
    // adjust ball direction based on paddle position
    // ball.x - paddle.x is the horizontal offset (negative=left, positive=right)
    // dividing by 2 reduces the intensity of the bounce
    ball.direction += (ball.x - paddle.x) / 2;
    ball.speed = 8; // set ball speed to 8
  });
}


// create new bricks
function createBricks() {
  bricks.removeAll(); // remove all bricks
  const colors = ['red', 'orange', 'yellow', 'green', 'cyan']; // set colors for bricks

  new Tiles(
    [
      '==========',
      '==========',
      '==========',
      '==========',
      '==========',
    ],
    47, // x position
    25, // y position
    bricks.w + 4, // spacing between bricks horizontally
    bricks.h + 4  // spacing between bricks vertically
  );

  let index = 0; // index for bricks
  // color each row differently
  for (let brick of bricks) {
    let row = Math.floor(index / 10); // 10 bricks per row
    brick.color = colors[row]; // set brick color to color of row
    index++; // increment index by 1
  }
}


function drawInstruction() {
  fill(255);

  textAlign(LEFT, TOP); // align text to left and top
  textSize(14); // set text size to 14
  text(`Level: ${level}`, 20, canvas.h - 60); // display level at bottom-left

  textAlign(RIGHT, TOP); // align text to right and top
  textSize(14); // set text size to 14
  text(`Lives: ${lives}`, canvas.w - 20, canvas.h - 60); // display lives at bottom-right

  // if game is not started, display instruction text
  if (!gameStarted) {
    // if game is not started, display instruction text with pulsing effect
    let opacity = abs(sin(frameCount * 1.7)) * 255;

    fill(255, 255, 255, opacity); // set text color to white with opacity
    textAlign(CENTER, CENTER); // align text to center
    textSize(22); // set text size to 22
    // display instruction text at center of the canvas
    text("Press joystick button to begin", canvas.w / 2, canvas.h / 2);
  }
}

function updatePaddleFromJoystick() {
  if (isNaN(joyX)) return;  // If serial data is invalid, exit the function

  // normalize the x-axis value to between around -1 and 1 (0 is the center of the joystick)
  let normX = joyX / MAX_DIST;
  normX = constrain(normX, -1, 1); // constrain the normalized value to between -1 and 1

  // smooth joystick motion by 20% of the difference between the current and new value
  smoothedX = lerp(smoothedX, normX, 0.2);
  if (isNaN(smoothedX)) smoothedX = 0; // if smoothedX is invalid, set it to 0

  paddle.x += smoothedX * 15;// move paddle horizontally relative to its current position by 15 pixels
  paddle.y = canvas.h - 20; // lock vertical position at the bottom of the canvas

  // keep paddle inside the walls (5px wall width)
  const leftLimit = 5 + paddleWidth / 2; // left limit of the paddle
  const rightLimit = canvas.w - 5 - paddleWidth / 2; // right limit of the paddle
  // constrain the paddle position to the left and right limits
  paddle.x = constrain(paddle.x, leftLimit, rightLimit);
}

// Send command to Arduino
function sendCommand(cmd) {
  const portIsOpen = checkPort();
  if (!portIsOpen) return;
  port.write(cmd + "\n");
}

function receiveData() {
  /**
   * Receive data over serial from your Arduino
   * We're terminating data with a newline character here
   * i.e., we need to Serial.println() in our Arduino code
   */
  const portIsOpen = checkPort(); // Check whether the port is open (see checkPort function below)
  if (!portIsOpen) return; // If the port is not open, exit the draw loop

  let vals = port.readUntil("\n"); // Read from the port until the newline
  let dataArray = vals.trim().split(","); // split the values into an array
  joyX = int(dataArray[0]); // convert the first value to an integer as joystick x-axis value
  joyY = int(dataArray[1]); // convert the second value to an integer as joystick y-axis value
  joyBtn = int(dataArray[2]); // convert the third value to an integer as joystick button state

  if (isNaN(joyX) || isNaN(joyY) || isNaN(joyBtn)) { // if any of the values are not a number, set them to 0
    joyX = 0; // set joyX to 0 as joystick x-axis value
    joyY = 0; // set joyY to 0 as joystick y-axis value
    joyBtn = 1; // set joyBtn to 1 as joystick button state
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
