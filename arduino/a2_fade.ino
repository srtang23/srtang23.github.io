const int buttonPin = 2;  // the number of the pushbutton pin
const int redPin = 11;    // the number of the red LED pin
const int greenPin = 10;  // the number of the green LED pin
const int bluePin = 9;  // the number of the blue LED pin

int count = -1; // mode counter; starts at -1 so first press makes it 0
int buttonState;  // debounced reading of the pushbutton
int lastButtonState = LOW; // last reading from the pushbutton

unsigned long lastDebounceTime = 0;  // the last time the output pin was toggled
unsigned long debounceDelay = 50;    // the debounce time; increase if the output flickers

// Set red, green, and blue LED pins as output, pushbutton pin as input
void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(buttonPin, INPUT);
}

void loop() {
  int reading = digitalRead(buttonPin); // reads the current state of the pushbutton

  // if the reading changed from the last loop, reset the debounce timer
  if (reading != lastButtonState) {
    lastDebounceTime = millis();  // records the current time
  }

  // if the reading has exceeded the set debouce time
  if ((millis() - lastDebounceTime) > debounceDelay) {
    // if the button state has changed:
    if (reading != buttonState) {

      buttonState = reading; // updates the debounced button state

      // checks if the pushbutton is pressed
      if (buttonState == HIGH) {
        count++;  // increment the counter by 1
      }
    }
  }

  // chooses LED color or fade colors based on count modulo 4
  if (count % 4 == 0) {
    setColor(255, 0, 0); // set LEDs to red (turn on by default)
  } else if (count % 4 == 1) {
    setColor(0, 255, 0); // set LEDs to green
  } else if (count % 4 == 2) {
    setColor(0, 0, 255); // set LEDs to blue
  } else if (count % 4 == 3) {
    fadeColors();        // color fading
  }
  // save the readingm next time through the loop, it'll be the lastButtonState:
  lastButtonState = reading;
}

// takes three brightness values (0–255) and sets each LED color
void setColor(int redVal, int greenVal, int blueVal) {
  analogWrite(redPin, redVal);  // sets brightness of the red LED
  analogWrite(greenPin, greenVal);  // sets brightness of the green LED
  analogWrite(bluePin, blueVal);  // sets brightness of the blue LED
}

// gradually increases brightness of each LED color one after another
void fadeColors() {
  for(int i = 0; i < 256;i++){  // fade red LED from 0 to 255
    analogWrite(redPin, i); // adjust red LED brightness
    delay(10);  // short pause
  }

  for(int i = 0; i < 256;i++){  // fade green LED from 0 to 255
    analogWrite(greenPin, i); // adjust green LED brightness
    delay(10);  // short pause
  }

  for(int i = 0; i < 256;i++){  // fade blue LED from 0 to 255
    analogWrite(bluePin, i);  // adjust blue LED brightness
    delay(10);  // short pause
  }
}
