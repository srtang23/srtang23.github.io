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
