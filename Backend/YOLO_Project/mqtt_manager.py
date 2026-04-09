"""
MQTT Manager for ESP32 Communication
Handles bidirectional MQTT communication between backend and ESP32
"""
import json
import paho.mqtt.client as mqtt
from typing import Callable, Optional
import threading
import time

class MQTTManager:
    """Manages MQTT communication with ESP32 devices"""
    
    def __init__(self, broker: str = "broker.emqx.io", port: int = 1883):
        self.broker = broker
        self.port = port
        self.client = mqtt.Client(client_id=f"AegisAI_Backend_{int(time.time())}")
        
        # MQTT Topics
        self.topic_quadrant_status = "aegis_ai_v8/quadrant_status"
        self.topic_device_status = "aegis_ai_v8/device_status"
        self.topic_manual_override = "aegis_ai_v8/manual_override"
        self.topic_esp32_feedback = "aegis_ai_v8/esp32_feedback"
        
        # Callbacks
        self.on_manual_override_callback: Optional[Callable] = None
        self.on_esp32_feedback_callback: Optional[Callable] = None
        
        # Setup callbacks
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect
        
        # Connection state
        self.connected = False
        self.connection_thread = None
        
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            print(f"✅ Connected to MQTT broker: {self.broker}:{self.port}")
            self.connected = True
            
            # Subscribe to ESP32 topics
            client.subscribe(self.topic_manual_override)
            client.subscribe(self.topic_esp32_feedback)
            print(f"📡 Subscribed to: {self.topic_manual_override}")
            print(f"📡 Subscribed to: {self.topic_esp32_feedback}")
        else:
            print(f"❌ Failed to connect to MQTT broker, return code: {rc}")
            self.connected = False
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        print(f"⚠️ Disconnected from MQTT broker, return code: {rc}")
        self.connected = False
        
    def _on_message(self, client, userdata, msg):
        """Callback when message received from MQTT"""
        try:
            topic = msg.topic
            payload = msg.payload.decode('utf-8')
            print(f"📨 MQTT Message [{topic}]: {payload}")
            
            # Parse JSON payload
            data = json.loads(payload)
            
            # Route to appropriate callback
            if topic == self.topic_manual_override:
                if self.on_manual_override_callback:
                    self.on_manual_override_callback(data)
            elif topic == self.topic_esp32_feedback:
                if self.on_esp32_feedback_callback:
                    self.on_esp32_feedback_callback(data)
                    
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse MQTT message: {e}")
        except Exception as e:
            print(f"❌ Error processing MQTT message: {e}")
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client.connect(self.broker, self.port, 60)
            self.connection_thread = threading.Thread(target=self.client.loop_forever, daemon=True)
            self.connection_thread.start()
            print(f"🔄 Connecting to MQTT broker: {self.broker}:{self.port}")
        except Exception as e:
            print(f"❌ Failed to connect to MQTT broker: {e}")
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.connected:
            self.client.disconnect()
            print("🔌 Disconnected from MQTT broker")
    
    def publish_device_status(self, device_states: dict):
        """
        Publish complete device status to ESP32
        Format: {
            "Q1": {"light": {"auto": 0, "manual": null, "final": 0}, "fan": {...}},
            ...
        }
        """
        if not self.connected:
            print("⚠️ MQTT not connected, cannot publish device status")
            return False
        
        try:
            payload = json.dumps(device_states)
            result = self.client.publish(self.topic_device_status, payload, qos=1)
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"✅ Published device status to MQTT")
                return True
            else:
                print(f"❌ Failed to publish device status, rc: {result.rc}")
                return False
        except Exception as e:
            print(f"❌ Error publishing device status: {e}")
            return False
    
    def publish_quadrant_status(self, quadrant_status: dict):
        """
        Publish simplified quadrant status (legacy format)
        Format: {"Q1": 0, "Q2": 0, "Q3": 1, "Q4": 1}
        """
        if not self.connected:
            print("⚠️ MQTT not connected, cannot publish quadrant status")
            return False
        
        try:
            payload = json.dumps(quadrant_status)
            result = self.client.publish(self.topic_quadrant_status, payload, qos=1)
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"✅ Published quadrant status to MQTT: {payload}")
                return True
            else:
                print(f"❌ Failed to publish quadrant status, rc: {result.rc}")
                return False
        except Exception as e:
            print(f"❌ Error publishing quadrant status: {e}")
            return False
    
    def set_manual_override_callback(self, callback: Callable):
        """Set callback for manual override messages from ESP32"""
        self.on_manual_override_callback = callback
    
    def set_esp32_feedback_callback(self, callback: Callable):
        """Set callback for ESP32 feedback messages"""
        self.on_esp32_feedback_callback = callback


# Global MQTT manager instance
mqtt_manager = MQTTManager()
