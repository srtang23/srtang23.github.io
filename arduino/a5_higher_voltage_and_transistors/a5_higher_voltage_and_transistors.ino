#include <IRremote.hpp> //// library to read IR remote signals

const int MOSFET_PIN = 4; // pin that drives the MOSFET gate
const int IR_RECEIVE_PIN = 6; // IR receiver output pin

const int POWER_BUTTON = 69; // IR command value for the remote’s POWER button

int brightness = 0; // LED brightness (0-255)
int fadeAmount = 5;             // how much brightness changes each loop
bool fading = false;            // toggle state for fading


void setup() {
  pinMode(MOSFET_PIN, OUTPUT); // set MOSFET gate as output
  analogWrite(MOSFET_PIN, 0); // start with LED completely off
  IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK); // start the IR receiver

}

void loop() {
  // check if an IR signal is received:
  if (IrReceiver.decode()) {
    int cmd = IrReceiver.decodedIRData.command; // retrieve command value
    bool repeat = IrReceiver.decodedIRData.flags & IRDATA_FLAGS_IS_REPEAT; // detect long-press repeat signals

    // if it’s a real button press AND it's the POWER button
    if (!repeat && cmd == POWER_BUTTON) {

      fading = !fading; // toggle fading on/off

      if (!fading) {
        analogWrite(MOSFET_PIN, 0);  // turn off when stopping
      }
    }
    IrReceiver.resume(); // get ready to receive the next IR packet
  }
  // if fading is turned on:
  if (fading) {
    analogWrite(MOSFET_PIN, brightness); // set the brightness of MOSFET_PIN
    brightness += fadeAmount; // change the brightness for next time through the loop:

    // reverse fade direction at ends:
    if (brightness <= 0 || brightness >= 255) {
      fadeAmount = -fadeAmount;
    }
    delay(10);  // fade speed
  }
}
