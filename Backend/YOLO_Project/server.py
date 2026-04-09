from fastapi import FastAPI, Depends, UploadFile, File, Response  # type: ignore
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from sqlalchemy.orm import Session # type: ignore
from pydantic import BaseModel  # type: ignore
from datetime import datetime
from database import SessionLocal, EnergyLogDB, engine, Base # type: ignore
from yolo_stream import generate_frames, set_video_path, get_active_quadrants, get_device_states, set_manual_device_status  # type: ignore
from mqtt_manager import mqtt_manager  # type: ignore
from state_manager import StateManager  # type: ignore
import uvicorn  # type: ignore
import shutil
import os
import csv
import io
import time

# Absolute path to project directory, so file ops work from any launch CWD
_HERE = os.path.dirname(os.path.abspath(__file__))

# Tables are now handled in database.py

# Pydantic Model (Data Validation for incoming API requests)
class EnergyLogCreate(BaseModel):
    room: str
    quadrant: str
    event: str
    duration_s: float | None = None
    energy_kwh: float | None = None

app = FastAPI(title="Energy Tracking Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MQTT connection
@app.on_event("startup")
async def startup_event():
    """Initialize MQTT connection on startup"""
    print("🚀 Starting AegisAI Backend Server...")
    
    # Import state_manager from yolo_stream
    from yolo_stream import state_manager
    
    # Set MQTT manager in state manager
    state_manager.set_mqtt_manager(mqtt_manager)
    
    # Set up MQTT callbacks
    def handle_manual_override(data):
        """Handle manual override from ESP32"""
        state_manager.handle_esp32_manual_override(data)
        
        # Log state changes
        db = SessionLocal()
        try:
            state_manager.log_state_changes(db, "Room1")
        finally:
            db.close()
    
    def handle_esp32_feedback(data):
        """Handle feedback from ESP32"""
        print(f"📡 ESP32 Feedback: {data}")
    
    mqtt_manager.set_manual_override_callback(handle_manual_override)
    mqtt_manager.set_esp32_feedback_callback(handle_esp32_feedback)
    
    # Connect to MQTT broker
    mqtt_manager.connect()
    
    print("✅ AegisAI Backend Server started successfully!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🔌 Shutting down AegisAI Backend Server...")
    mqtt_manager.disconnect()
    print("✅ Shutdown complete!")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------
# API ENDPOINTS
# -------------------------------
@app.post("/log_energy/")
def log_energy(log: EnergyLogCreate, db: Session = Depends(get_db)):
    """Receives ON/OFF events from YOLO script and saves to DB."""
    kwargs = {
        "timestamp": datetime.now(),
        "room": log.room,
        "quadrant": log.quadrant,
        "event": log.event,
        "duration_s": log.duration_s,
        "energy_kwh": log.energy_kwh
    }
    db_log = EnergyLogDB(**kwargs)  # type: ignore
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return {"status": "success", "data": db_log}

@app.post("/upload_video/")
async def upload_video(file: UploadFile = File(...)):
    save_path = os.path.join(_HERE, "video.mp4")
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    set_video_path(save_path)
    return {"status": "success", "filename": file.filename}

@app.get("/video_feed")
def video_feed(room: str = "Room1"):
    return StreamingResponse(generate_frames(room), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/status")
def status():
    return {"active_quadrants": get_active_quadrants()}

@app.get("/device_status")
def device_status():
    """Get detailed device status for all quadrants (auto, manual, final)"""
    return get_device_states()

@app.post("/manual_control")
def manual_control(quadrant: str, device: str, status: bool = None):
    """Set manual override for a specific device
    Args:
        quadrant: Q1, Q2, Q3, or Q4
        device: light or fan
        status: True (ON), False (OFF), or None (remove override)
    """
    if quadrant not in ["Q1", "Q2", "Q3", "Q4"]:
        return {"error": "Invalid quadrant"}
    if device not in ["light", "fan"]:
        return {"error": "Invalid device"}
    
    set_manual_device_status(quadrant, device, status)
    return {"status": "success", "quadrant": quadrant, "device": device, "manual_status": status}

@app.get("/energy/{room}")
def get_room_energy(room: str, db: Session = Depends(get_db)):
    """Calculates total energy and duration consumed per room and quadrant.
    Accumulates ALL ON/OFF cycles stored in the DB.
    Formula: energy_kwh = 1.0 kW * (total_duration_seconds / 3600)
    """
    logs = db.query(EnergyLogDB).filter(EnergyLogDB.room == room, EnergyLogDB.event == "OFF").all()
    
    # Per quadrant cumulative energy and duration
    quadrant_energy: dict[str, float] = {"Q1": 0.0, "Q2": 0.0, "Q3": 0.0, "Q4": 0.0}
    quadrant_duration: dict[str, float] = {"Q1": 0.0, "Q2": 0.0, "Q3": 0.0, "Q4": 0.0}
    
    for log in logs:
        q = log.quadrant
        if q in quadrant_energy:
            if log.energy_kwh is not None:
                quadrant_energy[q] += log.energy_kwh
            if log.duration_s is not None:
                quadrant_duration[q] += log.duration_s

    total_energy_kwh = sum(quadrant_energy.values())
    total_duration_s = sum(quadrant_duration.values())
    
    return {
        "room": room,
        "power_per_quadrant_kw": 1.0,
        "total_energy_kwh": total_energy_kwh,
        "total_duration_s": total_duration_s,
        "quadrant_breakdown": quadrant_energy,
        "quadrant_duration_s": quadrant_duration,
    }

@app.get("/export_logs/{room}")
def export_room_logs(room: str, db: Session = Depends(get_db)):
    """Exports all energy logs for a room as a CSV file."""
    logs = db.query(EnergyLogDB).filter(EnergyLogDB.room == room).order_by(EnergyLogDB.timestamp.asc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Room", "Quadrant", "Event", "Duration (s)", "Energy (kWh)"])
    
    for log in logs:
        writer.writerow([
            log.timestamp.strftime("%Y-%m-%d %H:%M:%S") if log.timestamp else "",
            log.room,
            log.quadrant,
            log.event,
            log.duration_s if log.duration_s is not None else "",
            log.energy_kwh if log.energy_kwh is not None else ""
        ])
        
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=energy_logs_{room}.csv"
    return response

@app.delete("/clear_logs/{room}")
def clear_room_logs(room: str, db: Session = Depends(get_db)):
    """Deletes all energy logs for a room so the CSV is clean for the next run."""
    deleted = db.query(EnergyLogDB).filter(EnergyLogDB.room == room).delete()
    db.commit()
    return {"status": "success", "deleted": deleted}

if __name__ == "__main__":
    print("Starting Server on http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
