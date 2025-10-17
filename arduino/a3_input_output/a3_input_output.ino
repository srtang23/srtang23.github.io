const int analogInPin = A0; // the analog input pin for the sensor
const int ledPins[3] = {11, 10, 9}; // the digital output pins for the three LEDs (red, green, blue)

int sensorValue;  // stores the averaged sensor value
int mappedValue;  // stores the sensor value mapped to LED brightness
int readings[10]; // array to hold a set of past 10 sensor readings for averaging
long total = 0;  // running total of readings (used for averaging)
int prevSensorValue = 0;  // stores the previous sensor value

unsigned long start;  // store the start time

void setup() {
  // initialize each LED pin as an output
  for (int ledPin : ledPins) {
    pinMode(ledPin, OUTPUT);
  }
  Serial.begin(9600);   // start serial communication

}

void loop() {
  // loop through each LED pin
  for (int ledPin : ledPins) {
    // turn off all LEDs before lighting up the current one
    for (int ledPin : ledPins) {
      analogWrite(ledPin, 0);
    }

    start = millis();  // record the current time as the start of this LED’s 2-second phase
    // keep updating LED brightness for 2 seconds
    while (millis() - start < 2000) {

      averageReadings();  // calculate the average of recent sensor readings

      // compute the average value by dividing the total by the number of readings
      sensorValue = total / (sizeof(readings) / sizeof(readings[0]));

      // constrain sensor values to the range 400–800 to filter out extreme values
      sensorValue = constrain(sensorValue, 400, 800);

      // map the sensor value (400–800) to LED brightness (0–255)
      mappedValue = map(sensorValue, 400, 800, 0, 255);

      // print out sensor and mapped values to the serial monitor
      Serial.print("sensor = ");
      Serial.print(sensorValue);
      Serial.print("\t mapped = ");
      Serial.println(mappedValue);

      // set LED brightness based on mapped sensor value
      analogWrite(ledPin, mappedValue);

      delay(10);  // wait 10 ms before taking the next reading
    }
  }

}

// helper method to compute the average of multiple sensor readings
void averageReadings() {
  total = 0;  // reset total before new averaging loop

  // loop through each slot in the readings array
  for (int reading : readings) {
    int sensorValue = analogRead(analogInPin);  // take a new analog reading from the sensor pin

    // if the new reading spikes more than 2.5× the previous one, treat it as noise
    if (prevSensorValue > 0 && sensorValue > 2.5 * prevSensorValue) {
      sensorValue = prevSensorValue;  // replace spike with previous stable value
    }
    reading = sensorValue;   // assign the sensor value to the local variable for reading
    total += sensorValue; // add the reading to the running total
    prevSensorValue = sensorValue;  // store this reading as the previous one for the next iteration
  }
}