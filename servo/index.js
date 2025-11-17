// Global variables!
const BAUD_RATE = 9600; // this should match the baud rate in your Arduino sketch
let port, connectBtn;   // these are used for setting up the serial connection


let angleToSend;        // keeping track of the angle I want to send to Arduino
let lastAngleSent;      // storing the last angle I sent
let currentServoAngle;  // reading data back in from Arduino

function setup() {
  setupSerial(); // Run our serial setup function (below)

  // Create a canvas that is the size of our browser window.
  // windowWidth and windowHeight are p5 variables
  createCanvas(windowWidth, windowHeight);

  // p5 text settings. BOLD and CENTER are constants provided by p5.
  // See the "Typography" section in the p5 reference: https://p5js.org/reference/
  textFont("system-ui", 50);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
}


function draw() {
  background(0);  // draw a black background
  displayHUD();   // a HUD, or 'heads up display', is for displaying important values.
                  // it's not strictly necessary, feel free to comment it out.
  drawGUI();      // draw the interactive circle/triangle thingy
  receiveData();  // read any data coming in from Arduino
  sendData();     // send data out to the Arduino
}

function drawGUI() {
  /**
  * Draw the interactive controller.
  * We want to set a position between 0-180 degrees based on our mouse's X position
  */
  translate(windowWidth/2, windowHeight/2); // translate to the center of the screen so that we can rotate
  textSize(48);                             // writing in a big font
  fill(255, 0, 80);                         // fill with a pretty color as an (r,g,b) value
  text("0", -200, 0);                       // annotating "0" as the far left position
  text("180", 200, 0);                      // annotating "180" as the far right position
  let theta = calculateRotation();          // see function below for the rotation calculation
  rotate(theta);                            // rotate is a p5 function
  triangle(-50, 0, 50, 0, 0, -150);         // draw a triangle relative to the center of the screen
  fill(255);                                // make the circle white
  circle(0, 0, 200);                        // draw a circle with diameter = 200 px
}

function calculateRotation() {
  /**
   * Map a mouseX position to a rotation
   */
  angleMode(DEGREES);                                                   // use degrees instead of radians
                                                                        // this only needs to happen once and could instead be in your setup() function; I'm putting it hear just for clarity
  let mouseXToAngle = map(mouseX, 0, windowWidth, -90, 90);             // map mouseX values to a rotation
                                                                        // between -90 and 90 degrees
  angleToSend = int(mouseXToAngle + 90);                                // the servo expects a number
                                                                        // betweeen 0-180, so add 90 to send
                                                                        // make it in integer with int()
                                                                        // to avoid weird ASCII confusion
  return mouseXToAngle;
}

function displayHUD() {
  /**
   * Make a "Heads Up Display" (HUD) that displays important values clearly to the user
   * This isn't strictly necessary, just useful for debugging
   */
  fill(255, 0, 80);
  textSize(22);
  text(`Last angle sent: ${angleToSend}`, 200, 100);
  text(`Current angle: ${currentServoAngle}`, 200, 150);
}

function receiveData() {
  /**
   * Receive data over serial from your Arduino
   * We're terminating data with a newline character here
   * i.e., we need to Serial.println() in our Arduino code
   */
  const portIsOpen = checkPort(); // Check whether the port is open (see checkPort function below)
  if (!portIsOpen) return; // If the port is not open, exit the draw loop

  let str = port.readUntil("\n"); // Read from the port until the newline
  if (str.length == 0) return; // If we didn't read anything, return.

  // trim the whitespace (the newline) and convert the string to a number
  currentServoAngle = Number(str.trim());
}

function sendData() {
  /**
   * Send a rotation to the Arduino
   * angleToSend and lastAngleSent are global variables
   * Checking against the last angle sent means we don't send redundant messages when it hasn't changed
   * But that check isn't strictly necessary; you could jsut port.write(angleToSend)
   */
  if (lastAngleSent != angleToSend) {
    console.log('writing:', angleToSend);
    port.write(angleToSend);
    lastAngleSent = angleToSend;
  }
}

// Three helper functions for managing the serial connection.

function setupSerial() {
  port = createSerial();

  // Check to see if there are any ports we have used previously
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    // If there are ports we've used, open the first one
    port.open(usedPorts[0], BAUD_RATE);
  }

  // create a connect button
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(5, 5); // Position the button in the top left of the screen.
  connectBtn.mouseClicked(onConnectButtonClicked); // When the button is clicked, run the onConnectButtonClicked function
}

function checkPort() {
  if (!port.opened()) {
    // If the port is not open, change button text
    connectBtn.html("Connect to Arduino");
    // Set background to gray
    background("gray");
    return false;
  } else {
    // Otherwise we are connected
    connectBtn.html("Disconnect");
    return true;
  }
}

function onConnectButtonClicked() {
  // When the connect button is clicked
  if (!port.opened()) {
    // If the port is not opened, we open it
    port.open(BAUD_RATE);
  } else {
    // Otherwise, we close it!
    port.close();
  }
}
