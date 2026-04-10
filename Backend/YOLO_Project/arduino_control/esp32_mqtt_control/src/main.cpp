#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
// WiFi Configuration
const char* ssid = "ESPV1";
const char* password = "chickenrice";
// MQTT Configuration
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_topic = "aegis_ai_v8/quadrant_status";

WiFiClient espClient;
PubSubClient client(espClient);

// Pin Mappings for ESP32
const int pinQ1 = 23; // Q1
const int pinQ2 = 25; // Q2
const int pinQ3 = 18; // Q3
const int pinQ4 = 19; // Q4

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

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  String messageTemp;
  for (int i = 0; i < length; i++) {
    messageTemp += (char)payload[i];
  }
  Serial.println(messageTemp);

  // Parse JSON
  // Example payload: {"Q1": 0, "Q2": 0, "Q3": 1, "Q4": 1}
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, messageTemp);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  // Read values (default to 0 if missing)
  int q1 = doc["Q1"] | 0;
  int q2 = doc["Q2"] | 0;
  int q3 = doc["Q3"] | 0;
  int q4 = doc["Q4"] | 0;

  // Control Pins based on the active state
  // This matches the edge trigger logic: if status is 1/High, it remains pulled High.
  // When it becomes 0, it falls back to Low.
  digitalWrite(pinQ1, q1 == 1 ? LOW : HIGH);
  digitalWrite(pinQ2, q2 == 1 ? LOW : HIGH);
  digitalWrite(pinQ3, q3 == 1 ? LOW : HIGH);
  digitalWrite(pinQ4, q4 == 1 ? LOW : HIGH);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Subscribe to the quadrant status topic
      client.subscribe(mqtt_topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  // Initialize Pins as Output
  pinMode(pinQ1, OUTPUT);
  pinMode(pinQ2, OUTPUT);
  pinMode(pinQ3, OUTPUT);
  pinMode(pinQ4, OUTPUT);

  // Initial state LOW to ensure lights are off before active
  digitalWrite(pinQ1, HIGH);
  digitalWrite(pinQ2, HIGH);
  digitalWrite(pinQ3, HIGH);
  digitalWrite(pinQ4, HIGH);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}