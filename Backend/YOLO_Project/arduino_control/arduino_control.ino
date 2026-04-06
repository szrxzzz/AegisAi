/**
 * Arduino Nano Quadrant LED Control
 * 
 * Pins:
 * Q1 -> D2
 * Q2 -> D3
 * Q3 -> D4
 * Q4 -> D5
 * 
 * Serial commands:
 * "Q1:1" -> Turn on D2
 * "Q1:0" -> Turn off D2
 * ... and so on for Q2, Q3, Q4.
 */

const int pins[] = {2, 3, 4, 5}; // Q1, Q2, Q3, Q4

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 4; i++) {
    pinMode(pins[i], OUTPUT);
    digitalWrite(pins[i], LOW); // Ensure off at start
  }
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command.startsWith("Q")) {
      int qIndex = command.substring(1, 2).toInt() - 1;
      int state = command.substring(3).toInt();

      if (qIndex >= 0 && qIndex < 4) {
        if (state == 1) {
          digitalWrite(pins[qIndex], HIGH);
        } else {
          digitalWrite(pins[qIndex], LOW);
        }
      }
    }
  }
}
