"""
State Manager for Quadrant Device Status
Handles automatic, manual, and final states for lights and fans in each quadrant
"""
from datetime import datetime
from typing import Dict, Optional
from sqlalchemy.orm import Session
from database import EnergyLogDB

class StateManager:
    """Manages device states for all quadrants"""
    
    def __init__(self):
        # Auto status based on occupancy detection
        self.auto_status: Dict[str, Dict[str, bool]] = {
            "Q1": {"light": False, "fan": False},
            "Q2": {"light": False, "fan": False},
            "Q3": {"light": False, "fan": False},
            "Q4": {"light": False, "fan": False}
        }
        
        # Manual switch status (None = no override, True = ON, False = OFF)
        self.manual_status: Dict[str, Dict[str, Optional[bool]]] = {
            "Q1": {"light": None, "fan": None},
            "Q2": {"light": None, "fan": None},
            "Q3": {"light": None, "fan": None},
            "Q4": {"light": None, "fan": None}
        }
        
        # Track previous final states to detect changes
        self.prev_final_status: Dict[str, Dict[str, bool]] = {
            "Q1": {"light": False, "fan": False},
            "Q2": {"light": False, "fan": False},
            "Q3": {"light": False, "fan": False},
            "Q4": {"light": False, "fan": False}
        }
        
        # Track ON timestamps for energy calculation
        self.on_time: Dict[str, Dict[str, Optional[datetime]]] = {
            "Q1": {"light": None, "fan": None},
            "Q2": {"light": None, "fan": None},
            "Q3": {"light": None, "fan": None},
            "Q4": {"light": None, "fan": None}
        }
        
        self.power_kw = 0.1  # 100W per device
        
        # MQTT manager reference (set externally)
        self.mqtt_manager = None
    
    def update_auto_status(self, quadrant: str, occupied: bool):
        """Update automatic status based on occupancy"""
        if quadrant in self.auto_status:
            prev_light = self.auto_status[quadrant]["light"]
            prev_fan = self.auto_status[quadrant]["fan"]
            
            self.auto_status[quadrant]["light"] = occupied
            self.auto_status[quadrant]["fan"] = occupied
            
            # Publish to MQTT if state changed
            if (prev_light != occupied or prev_fan != occupied) and self.mqtt_manager:
                self._publish_mqtt_update()
    
    def set_manual_status(self, quadrant: str, device: str, status: Optional[bool]):
        """Set manual override for a specific device"""
        if quadrant in self.manual_status and device in ["light", "fan"]:
            self.manual_status[quadrant][device] = status
            
            # Publish to MQTT when manual status changes
            if self.mqtt_manager:
                self._publish_mqtt_update()
    
    def get_final_status(self, quadrant: str, device: str) -> bool:
        """Calculate final status: manual overrides auto"""
        manual = self.manual_status[quadrant][device]
        if manual is not None:
            return manual
        return self.auto_status[quadrant][device]
    
    def get_all_device_states(self) -> Dict:
        """Get complete state for all devices in all quadrants"""
        result = {}
        for quadrant in ["Q1", "Q2", "Q3", "Q4"]:
            result[quadrant] = {
                "light": {
                    "auto": self.auto_status[quadrant]["light"],
                    "manual": self.manual_status[quadrant]["light"],
                    "final": self.get_final_status(quadrant, "light")
                },
                "fan": {
                    "auto": self.auto_status[quadrant]["fan"],
                    "manual": self.manual_status[quadrant]["fan"],
                    "final": self.get_final_status(quadrant, "fan")
                }
            }
        return result
    
    def log_state_changes(self, db: Session, room: str):
        """Log energy events when device states change"""
        current_time = datetime.now()
        
        for quadrant in ["Q1", "Q2", "Q3", "Q4"]:
            for device in ["light", "fan"]:
                final_status = self.get_final_status(quadrant, device)
                prev_final = self.prev_final_status[quadrant][device]
                prev_on_time = self.on_time[quadrant][device]
                
                # Only log if final status actually changed
                if final_status != prev_final:
                    auto_state = 1 if self.auto_status[quadrant][device] else 0
                    manual_override = None
                    if self.manual_status[quadrant][device] is not None:
                        manual_override = 1 if self.manual_status[quadrant][device] else 0
                    final_state = 1 if final_status else 0
                    
                    # Device turned ON
                    if final_status and not prev_final:
                        self.on_time[quadrant][device] = current_time
                        db_log = EnergyLogDB(
                            timestamp=current_time,
                            room=room,
                            quadrant=quadrant,
                            device=device,
                            event="ON",
                            auto_state=auto_state,
                            manual_override=manual_override,
                            final_state=final_state
                        )
                        db.add(db_log)
                        print(f"✅ Logged ON: {quadrant} {device} (Auto:{auto_state}, Manual:{manual_override}, Final:{final_state})")
                    
                    # Device turned OFF
                    elif not final_status and prev_final:
                        if prev_on_time is not None:
                            duration = (current_time - prev_on_time).total_seconds()
                            energy = self.power_kw * (duration / 3600.0)
                            
                            db_log = EnergyLogDB(
                                timestamp=current_time,
                                room=room,
                                quadrant=quadrant,
                                device=device,
                                event="OFF",
                                auto_state=auto_state,
                                manual_override=manual_override,
                                final_state=final_state,
                                duration_s=round(duration, 2),
                                energy_kwh=round(energy, 6)
                            )
                            db.add(db_log)
                            print(f"✅ Logged OFF: {quadrant} {device} (Duration:{duration:.2f}s, Energy:{energy:.6f}kWh)")
                        self.on_time[quadrant][device] = None
                    
                    # Update previous final status
                    self.prev_final_status[quadrant][device] = final_status
        
        db.commit()
    
    def cleanup_on_shutdown(self, db: Session, room: str):
        """Log OFF events for all active devices on shutdown"""
        current_time = datetime.now()
        
        for quadrant in ["Q1", "Q2", "Q3", "Q4"]:
            for device in ["light", "fan"]:
                if self.on_time[quadrant][device] is not None:
                    duration = (current_time - self.on_time[quadrant][device]).total_seconds()
                    energy = self.power_kw * (duration / 3600.0)
                    
                    auto_state = 1 if self.auto_status[quadrant][device] else 0
                    manual_override = None
                    if self.manual_status[quadrant][device] is not None:
                        manual_override = 1 if self.manual_status[quadrant][device] else 0
                    
                    db_log = EnergyLogDB(
                        timestamp=current_time,
                        room=room,
                        quadrant=quadrant,
                        device=device,
                        event="OFF",
                        auto_state=auto_state,
                        manual_override=manual_override,
                        final_state=0,
                        duration_s=round(duration, 2),
                        energy_kwh=round(energy, 6)
                    )
                    db.add(db_log)
                    self.on_time[quadrant][device] = None
        
        db.commit()
    
    def set_mqtt_manager(self, mqtt_manager):
        """Set MQTT manager for publishing updates"""
        self.mqtt_manager = mqtt_manager
    
    def _publish_mqtt_update(self):
        """Publish current device states to MQTT"""
        if not self.mqtt_manager:
            return
        
        # Publish full device status
        device_states = self.get_all_device_states()
        self.mqtt_manager.publish_device_status(device_states)
        
        # Also publish simplified quadrant status for legacy compatibility
        quadrant_status = {}
        for quadrant in ["Q1", "Q2", "Q3", "Q4"]:
            # Quadrant is ON if either light or fan final status is ON
            light_final = self.get_final_status(quadrant, "light")
            fan_final = self.get_final_status(quadrant, "fan")
            quadrant_status[quadrant] = 1 if (light_final or fan_final) else 0
        
        self.mqtt_manager.publish_quadrant_status(quadrant_status)
    
    def handle_esp32_manual_override(self, data: dict):
        """
        Handle manual override message from ESP32
        Expected format: {
            "quadrant": "Q1",
            "device": "light",  # or "fan"
            "action": "toggle"  # or "on", "off"
        }
        """
        try:
            quadrant = data.get("quadrant")
            device = data.get("device")
            action = data.get("action", "toggle")
            
            if not quadrant or not device:
                print(f"⚠️ Invalid ESP32 override data: {data}")
                return
            
            if quadrant not in ["Q1", "Q2", "Q3", "Q4"] or device not in ["light", "fan"]:
                print(f"⚠️ Invalid quadrant or device: {quadrant}, {device}")
                return
            
            # Get current final status
            current_final = self.get_final_status(quadrant, device)
            
            # Determine new manual status based on action
            if action == "toggle":
                # Toggle the final status
                new_manual_status = not current_final
            elif action == "on":
                new_manual_status = True
            elif action == "off":
                new_manual_status = False
            else:
                print(f"⚠️ Unknown action: {action}")
                return
            
            # Set manual override
            self.set_manual_status(quadrant, device, new_manual_status)
            
            print(f"🔄 ESP32 Manual Override: {quadrant} {device} -> {new_manual_status}")
            
        except Exception as e:
            print(f"❌ Error handling ESP32 manual override: {e}")
