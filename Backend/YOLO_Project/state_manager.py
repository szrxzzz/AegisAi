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
        
        # Track ON timestamps for energy calculation
        self.on_time: Dict[str, Dict[str, Optional[datetime]]] = {
            "Q1": {"light": None, "fan": None},
            "Q2": {"light": None, "fan": None},
            "Q3": {"light": None, "fan": None},
            "Q4": {"light": None, "fan": None}
        }
        
        self.power_kw = 0.1  # 100W per device
    
    def update_auto_status(self, quadrant: str, occupied: bool):
        """Update automatic status based on occupancy"""
        if quadrant in self.auto_status:
            self.auto_status[quadrant]["light"] = occupied
            self.auto_status[quadrant]["fan"] = occupied
    
    def set_manual_status(self, quadrant: str, device: str, status: Optional[bool]):
        """Set manual override for a specific device"""
        if quadrant in self.manual_status and device in ["light", "fan"]:
            self.manual_status[quadrant][device] = status
    
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
                prev_on_time = self.on_time[quadrant][device]
                
                # Device turned ON
                if final_status and prev_on_time is None:
                    self.on_time[quadrant][device] = current_time
                    db_log = EnergyLogDB(
                        timestamp=current_time,
                        room=room,
                        quadrant=quadrant,
                        device=device,
                        event="ON"
                    )
                    db.add(db_log)
                
                # Device turned OFF
                elif not final_status and prev_on_time is not None:
                    duration = (current_time - prev_on_time).total_seconds()
                    energy = self.power_kw * (duration / 3600.0)
                    
                    db_log = EnergyLogDB(
                        timestamp=current_time,
                        room=room,
                        quadrant=quadrant,
                        device=device,
                        event="OFF",
                        duration_s=round(duration, 2),
                        energy_kwh=round(energy, 6)
                    )
                    db.add(db_log)
                    self.on_time[quadrant][device] = None
        
        db.commit()
    
    def cleanup_on_shutdown(self, db: Session, room: str):
        """Log OFF events for all active devices on shutdown"""
        current_time = datetime.now()
        
        for quadrant in ["Q1", "Q2", "Q3", "Q4"]:
            for device in ["light", "fan"]:
                if self.on_time[quadrant][device] is not None:
                    duration = (current_time - self.on_time[quadrant][device]).total_seconds()
                    energy = self.power_kw * (duration / 3600.0)
                    
                    db_log = EnergyLogDB(
                        timestamp=current_time,
                        room=room,
                        quadrant=quadrant,
                        device=device,
                        event="OFF",
                        duration_s=round(duration, 2),
                        energy_kwh=round(energy, 6)
                    )
                    db.add(db_log)
                    self.on_time[quadrant][device] = None
        
        db.commit()
