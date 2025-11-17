
#include <Servo.h>

Servo myservo;  // create Servo object to control a servo

void setup() {
  Serial.begin(9600);
  myservo.attach(9);  // attaches the servo on pin 9 to the Servo object
}

void loop() {
  if (Serial.available() > 0) {     // if there's serial data 
 	  int pos = Serial.read();        // read it
 	  Serial.println(pos);  	        // send it back out as raw binary data
 	  myservo.write(pos);	            // use it to set the servo position
  }
  delay(15);                      // let the servo get there
}

