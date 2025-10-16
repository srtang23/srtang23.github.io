const int analogInPin = A0;
const int ledPins[3] = {11, 10, 9};


int sensorValue;
int mappedValue;
int readings[10];
long total = 0;  
int prevSensorValue = 0;

unsigned long start;

void setup() {
  for (int ledPin : ledPins) {
    pinMode(ledPin, OUTPUT);
  }
  Serial.begin(9600);

}

void loop() {
  for (int ledPin : ledPins) {
    for (int ledPin : ledPins) {
      analogWrite(ledPin, 0);
    }

    start = millis();
    while (millis() - start < 2000) {

      averageReadings();
      sensorValue = total / (sizeof(readings) / sizeof(readings[0]));
      sensorValue = constrain(sensorValue, 400, 800);
      mappedValue = map(sensorValue, 400, 800, 0, 255);

      Serial.print("sensor = ");
      Serial.print(sensorValue);
      Serial.print("\t mapped = ");
      Serial.println(mappedValue);

      analogWrite(ledPin, mappedValue);
      delay(10);
    }
  }

}

void averageReadings() {
  total = 0;
  for (int reading : readings) {
    int sensorValue = analogRead(analogInPin);
    if (prevSensorValue > 0 && sensorValue > 2.5 * prevSensorValue) {
      sensorValue = prevSensorValue;
    }
    reading = sensorValue;
    total += sensorValue;
    prevSensorValue = sensorValue;
  }
}

