#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFi.h>

// WiFi Configuration
const char *ssid = "ESPV1";
const char *password = "chickenrice";

// MQTT Configuration
const char *mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char *mqtt_topic_device_status = "aegis_ai_v8/device_status";
const char *mqtt_topic_manual_override = "aegis_ai_v8/manual_override";
const char *mqtt_topic_esp32_feedback = "aegis_ai_v8/esp32_feedback";

WiFiClient espClient;
PubSubClient client(espClient);

// Pin Mappings for ESP32
// Relay outputs (8 relays total: 4 lights + 4 fans)
const int pinQ1_Light = 18;
const int pinQ1_Fan = 19;
const int pinQ2_Light = 21;
const int pinQ2_Fan = 22;
const int pinQ3_Light = 23;
const int pinQ3_Fan = 25;
const int pinQ4_Light = 26;
const int pinQ4_Fan = 27;

// Push button inputs (8 buttons: 4 for lights + 4 for fans)
const int btnQ1_Light = 32;
const int btnQ1_Fan = 33;
const int btnQ2_Light = 34;
const int btnQ2_Fan = 35;
const int btnQ3_Light = 36;
const int btnQ3_Fan = 39;
const int btnQ4_Light = 4;
const int btnQ4_Fan = 5;

// Button debounce
const unsigned long debounceDelay = 50;

// Button state tracking
struct ButtonState {
  int pin;
  int lastState;
  int currentState;
  unsigned long lastDebounceTime;
  String quadrant;
  String device;
};

ButtonState buttons[8] = {
  {btnQ1_Light, HIGH, HIGH, 0, "Q1", "light"},
  {btnQ1_Fan, HIGH, HIGH, 0, "Q1", "fan"},
  {btnQ2_Light, HIGH, HIGH, 0, "Q2", "light"},
  {btnQ2_Fan, HIGH, HIGH, 0, "Q2", "fan"},
  {btnQ3_Light, HIGH, HIGH, 0, "Q3", "light"},
  {btnQ3_Fan, HIGH, HIGH, 0, "Q3", "fan"},
  {btnQ4_Light, HIGH, HIGH, 0, "Q4", "light"},
  {btnQ4_Fan, HIGH, HIGH, 0, "Q4", "fan"}
};

// Current device states (final states)
struct DeviceState {
  bool light;
  bool fan;
};

DeviceState quadrants[4] = {
  {false, false}, // Q1
  {false, false}, // Q2
  {false, false}, // Q3
  {false, false}  // Q4
};

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void applyRelayStates() {
  // Apply current states to relays
  digitalWrite(pinQ1_Light, quadrants[0].light ? HIGH : LOW);
  digitalWrite(pinQ1_Fan, quadrants[0].fan ? HIGH : LOW);
  digitalWrite(pinQ2_Light, quadrants[1].light ? HIGH : LOW);
  digitalWrite(pinQ2_Fan, quadrants[1].fan ? HIGH : LOW);
  digitalWrite(pinQ3_Light, quadrants[2].light ? HIGH : LOW);
  digitalWrite(pinQ3_Fan, quadrants[2].fan ? HIGH : LOW);
  digitalWrite(pinQ4_Light, quadrants[3].light ? HIGH : LOW);
  digitalWrite(pinQ4_Fan, quadrants[3].fan ? HIGH : LOW);
}

void publishManualOverride(String quadrant, String device, String action) {
  // Publish manual override to backend
  StaticJsonDocument<200> doc;
  doc["quadrant"] = quadrant;
  doc["device"] = device;
  doc["action"] = action;
  
  String payload;
  serializeJson(doc, payload);
  
  client.publish(mqtt_topic_manual_override, payload.c_str());
  Serial.print("Published manual override: ");
  Serial.println(payload);
}

void callback(char *topic, byte *payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  String messageTemp;
  for (int i = 0; i < length; i++) {
    messageTemp += (char)payload[i];
  }
  Serial.println(messageTemp);

  // Parse JSON
  // Expected format: {
  //   "Q1": {"light": {"final": true}, "fan": {"final": true}},
  //   "Q2": {"light": {"final": false}, "fan": {"final": false}},
  //   ...
  // }
  
  if (String(topic) == mqtt_topic_device_status) {
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, messageTemp);

    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.f_str());
      return;
    }

    // Update device states from backend
    for (int i = 0; i < 4; i++) {
      String qName = "Q" + String(i + 1);
      
      if (doc.containsKey(qName)) {
        JsonObject quadrant = doc[qName];
        
        if (quadrant.containsKey("light") && quadrant["light"].containsKey("final")) {
          quadrants[i].light = quadrant["light"]["final"];
        }
        
        if (quadrant.containsKey("fan") && quadrant["fan"].containsKey("final")) {
          quadrants[i].fan = quadrant["fan"]["final"];
        }
      }
    }
    
    // Apply updated states to relays
    applyRelayStates();
    
    Serial.println("Device states updated from backend");
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe(mqtt_topic_device_status);
      Serial.print("Subscribed to: ");
      Serial.println(mqtt_topic_device_status);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void handleButtons() {
  for (int i = 0; i < 8; i++) {
    ButtonState &btn = buttons[i];
    
    int reading = digitalRead(btn.pin);
    
    if (reading != btn.lastState) {
      btn.lastDebounceTime = millis();
    }
    
    if ((millis() - btn.lastDebounceTime) > debounceDelay) {
      if (reading != btn.currentState) {
        btn.currentState = reading;
        
        // Button pressed (falling edge)
        if (btn.currentState == LOW) {
          Serial.print("Button pressed: ");
          Serial.print(btn.quadrant);
          Serial.print(" ");
          Serial.println(btn.device);
          
          // Publish manual override toggle
          publishManualOverride(btn.quadrant, btn.device, "toggle");
        }
      }
    }
    
    btn.lastState = reading;
  }
}

void setup() {
  Serial.begin(115200);

  // Initialize relay pins as outputs
  pinMode(pinQ1_Light, OUTPUT);
  pinMode(pinQ1_Fan, OUTPUT);
  pinMode(pinQ2_Light, OUTPUT);
  pinMode(pinQ2_Fan, OUTPUT);
  pinMode(pinQ3_Light, OUTPUT);
  pinMode(pinQ3_Fan, OUTPUT);
  pinMode(pinQ4_Light, OUTPUT);
  pinMode(pinQ4_Fan, OUTPUT);
  
  // Initialize button pins as inputs with pullup
  for (int i = 0; i < 8; i++) {
    pinMode(buttons[i].pin, INPUT_PULLUP);
  }
  
  // Set all relays to OFF initially
  applyRelayStates();

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  Serial.println("ESP32 Manual Override System Ready!");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Handle button presses
  handleButtons();
  
  delay(10); // Small delay for stability
}
