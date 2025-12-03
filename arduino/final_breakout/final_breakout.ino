#define ANALOG_X_PIN A0 // joystick x axis connected to analog pin A0
#define ANALOG_Y_PIN A1  // ioystick y axis connected to analog pin A1
#define JOY_BUTTON_PIN 3  // yoystick button on digital pin 3
#define BUZZER_PIN 10

#define GREEN_PIN 9 // green LED connected to digital pin 9
#define RED_PIN 10 // red LED connected to digital pin 10

const int MAX_ANALOG_VAL = 1023;  // max analog read value
const int JOYSTICK_CENTER_VALUE = int(MAX_ANALOG_VAL / 2); // joystick center
const int JOYSTICK_MOVEMENT_THRESHOLD = 12; // deadzone so it doesn't jitter

int joyX; // joystick raw x-axis value
int joyY; // joystick raw y-axis value


void setup() {
  Serial.begin(9600); // serial communication to p5.js
  pinMode(GREEN_PIN, OUTPUT); // green led pin as output
  pinMode(RED_PIN, OUTPUT); // red led pin as output
  pinMode(JOY_BUTTON_PIN, INPUT_PULLUP); // button is HIGH normally, LOW when pressed
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {

  // read joystick x and y axes (0-1023)
  joyX = analogRead(ANALOG_X_PIN);
  joyY = analogRead(ANALOG_Y_PIN);

  // compute how far from center they are
  int xDistFromCenter = joyX - JOYSTICK_CENTER_VALUE;
  int yDistFromCenter = joyY - JOYSTICK_CENTER_VALUE;

  //  ignore small noise near center
  if (abs(xDistFromCenter) < JOYSTICK_MOVEMENT_THRESHOLD) {
    xDistFromCenter = 0;
  }

  if (abs(yDistFromCenter) < JOYSTICK_MOVEMENT_THRESHOLD) {
    yDistFromCenter = 0;
  }

  // read joystick button state (1 = not pressed, 0 = pressed)
  int buttonVal = digitalRead(JOY_BUTTON_PIN);

  // send data to p5.js in format (xDistFromCenter, yDistFromCenter, buttonVal)
  Serial.print(xDistFromCenter);
  Serial.print(",");
  Serial.print(yDistFromCenter);
  Serial.print(",");
  Serial.println(buttonVal);


  // receive data from p5.js, if p5.js sent something:
  if (Serial.available() > 0) {
    char cmd = Serial.read();  // read one character

    if (cmd == 'F') {   // F -> fail/miss
      tone(BUZZER_PIN, 100, 200);
      delay(1000);
    }
  }
  delay(20); // delay to wait for serial communication
}

