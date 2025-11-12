#include <Servo.h>

Servo myservo;

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(10);
  myservo.attach(9);
  myservo.write(90);
}

void loop() {
  if (Serial.available() > 0) {   // if there's serial data 
    int pos = Serial.parseInt(); // read it
    Serial.println(pos);     // send it back as raw binary data    // in steps of 1 degree
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15 ms for the servo to reach the position
  }

}

