/*
  Blink

  Turns an LED on for one second, then off for one second, repeatedly.

  Most Arduinos have an on-board LED you can control. On the UNO, MEGA and ZERO
  it is attached to digital pin 13, on MKR1000 on pin 6. LED_BUILTIN is set to
  the correct LED pin independent of which board is used.
  If you want to know what pin the on-board LED is connected to on your Arduino
  model, check the Technical Specs of your board at:
  https://docs.arduino.cc/hardware/

  modified 8 May 2014
  by Scott Fitzgerald
  modified 2 Sep 2016
  by Arturo Guadalupi
  modified 8 Sep 2016
  by Colby Newman

  This example code is in the public domain.

  https://docs.arduino.cc/built-in-examples/basics/Blink/
*/

// declaring an array of LED pin numbers
int leds[] = {3, 7, 10};
// storing the total number of LEDs as a variable
int total = 3;

// runs once when the Arduino is powered or reset and initializes the LED pins as outputs
void setup() {
  // looping through each LED pin
  for (int i = 0; i < total; i++) {
    // setting each LED pin as an OUTPUT
    pinMode(leds[i], OUTPUT);
  }
}

// repeatedly cycles through each LED, blinking them in sequence with 1000 ms delays
void loop() {
  // loop through each LED in the array
  for (int i = 0; i < total; i++) {
    // turning the current LED (leds[i]) on by setting pin to HIGH voltage
    digitalWrite(leds[i], HIGH);
    // wait 1000ms while the LED stays on
    delay(1000);
    // turning the current LED (leds[i]) off by setting pin to LOW voltage
    digitalWrite(leds[i], LOW);
    // wait 1000ms while the LED stays off
    delay(1000);
  }
}
