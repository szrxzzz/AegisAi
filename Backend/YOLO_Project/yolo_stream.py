import cv2 # type: ignore
import torch # type: ignore
import time
import os
import json
from datetime import datetime
from ultralytics import YOLO # type: ignore
from database import SessionLocal, EnergyLogDB # type: ignore
from state_manager import StateManager # type: ignore
import paho.mqtt.client as mqtt # type: ignore

_HERE = os.path.dirname(os.path.abspath(__file__))

video_path = os.path.join(_HERE, "video.mp4")
state_manager = StateManager()

# Global state
active_quadrants: dict = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}
q_override_state: dict = {"Q1": None, "Q2": None, "Q3": None, "Q4": None}

# MQTT — matches ESP32 config
MQTT_BROKER = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "aegis_ai_v8/quadrant_status"
MQTT_OVERRIDE_TOPIC = "aegis_ai_v8/q4_override"

def _on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"[MQTT] Connected to {MQTT_BROKER}")
        client.subscribe(MQTT_OVERRIDE_TOPIC)
    else:
        print(f"[MQTT] Connection failed rc={rc}")

def _on_message(client, userdata, msg):
    """Handle Q4 override button press from ESP32"""
    if msg.topic == MQTT_OVERRIDE_TOPIC:
        payload = msg.payload.decode().strip()
        if payload == "TOGGLE":
            current = q_override_state.get("Q4")
            q_override_state["Q4"] = 0 if current == 1 else 1
            print(f"[MQTT] Q4 override toggled -> {q_override_state['Q4']}")

mqtt_client = mqtt.Client(client_id="aegis-backend", clean_session=True)
mqtt_client.on_connect = _on_connect
mqtt_client.on_message = _on_message
try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
    mqtt_client.loop_start()
except Exception as e:
    print(f"[MQTT] Could not connect: {e}")

def set_video_path(path: str):
    global video_path
    video_path = path

def get_active_quadrants():
    """Get current occupancy status of all quadrants"""
    result = {}
    for quadrant in ["Q1", "Q2", "Q3", "Q4"]:
        manual = state_manager.manual_status[quadrant]
        if manual["light"] is not None or manual["fan"] is not None:
            # Manual override is set — use state_manager final status
            light_on = state_manager.get_final_status(quadrant, "light")
            fan_on = state_manager.get_final_status(quadrant, "fan")
            result[quadrant] = 1 if (light_on or fan_on) else 0
        else:
            # No manual override — use live detection dict directly
            result[quadrant] = active_quadrants.get(quadrant, 0)
    return result

def get_device_states():
    """Get full device states for all quadrants"""
    return state_manager.get_all_device_states()

def set_manual_device_status(quadrant: str, device: str, status):
    """Set manual override for a specific device"""
    state_manager.set_manual_status(quadrant, device, status)
    db = SessionLocal()
    try:
        state_manager.log_state_changes(db, "Room1")
    finally:
        db.close()


def generate_frames(room_name: str = "Room1"):
    global active_quadrants, q_override_state

    model = YOLO("yolov8n.pt")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    db = SessionLocal()
    prev_q: dict[str, int] = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}
    q_counts: dict[str, int] = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}
    on_time: dict[str, datetime | None] = {"Q1": None, "Q2": None, "Q3": None, "Q4": None}
    power_kw = 1.0  

    x_ratio = 0.5
    y_ratio = 0.4

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Cannot open video: {video_path}")
        db.close()
        return

    fps_raw = cap.get(cv2.CAP_PROP_FPS)
    fps: float = float(fps_raw) if fps_raw and float(fps_raw) > 0 else 30.0
    PROCESS_EVERY = 15
    target_interval: float = PROCESS_EVERY / fps 

    q = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}
    current_boxes = []
    
    try:
        frame_idx: int = 0
        decoded_count: int = 0
        start_time = time.time()

        try:
            mqtt_client.publish(MQTT_TOPIC, json.dumps({"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}))
        except Exception as e:
            print(f"MQTT Publish error on start: {e}")

        while True:
            for _ in range(PROCESS_EVERY - 1):
                if not cap.grab():
                    break
                frame_idx += 1

            ret, frame = cap.read()
            if not ret:
                break
            frame_idx += 1
            decoded_count += 1 

            elapsed = time.time() - start_time
            expected = (frame_idx / fps)
            if elapsed < expected:
                time.sleep(min(expected - elapsed, target_interval))

            frame = cv2.resize(frame, (416, 416))
            h, w, _ = frame.shape
            x_line = int(w * x_ratio)
            y_line = int(h * y_ratio)

            cv2.line(frame, (x_line, 0), (x_line, h), (255, 255, 255), 2)
            cv2.line(frame, (0, y_line), (w, y_line), (255, 255, 255), 2)

            results = model(frame, conf=0.3, verbose=False, imgsz=320)
            q = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0} 
            current_boxes = [] 

            for r in results:
                for box in r.boxes:  
                    if int(box.cls[0]) == 0:  
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        current_boxes.append((x1, y1, x2, y2))
                        
                        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                        if cx < x_line and cy < y_line: q["Q1"] = 1
                        elif cx > x_line and cy < y_line: q["Q2"] = 1
                        elif cx < x_line and cy > y_line: q["Q3"] = 1
                        else: q["Q4"] = 1
            
            for key in q:
                if q[key] == 1:
                    q_counts[key] = 15
                else:
                    q_counts[key] = max(0, q_counts[key] - 1) 
            
            for (x1, y1, x2, y2) in current_boxes:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
                
                label = "Person"
                if cx < x_line and cy < y_line: label = "Q1"
                elif cx > x_line and cy < y_line: label = "Q2"
                elif cx < x_line and cy > y_line: label = "Q3"
                else: label = "Q4"
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

            smoothed_q = {} 
            for key in q_counts:
                smoothed_q[key] = 1 if q_counts[key] >= 4 else 0 
                
            # Force manual overrides if set
            for key in ["Q1", "Q2", "Q3", "Q4"]:
                if q_override_state[key] is not None:
                    smoothed_q[key] = q_override_state[key]
                    q_counts[key] = 15 if q_override_state[key] == 1 else 0

            current_time = datetime.now()
            
            for key in smoothed_q:
                if prev_q[key] == 0 and smoothed_q[key] == 1: 
                    on_time[key] = current_time
                    db_log = EnergyLogDB(timestamp=current_time, room=room_name, quadrant=key, event="ON")
                    db.add(db_log)
                    db.commit()
                
                elif prev_q[key] == 1 and smoothed_q[key] == 0: 
                    off_time = current_time
                    t_on = on_time.get(key)
                    if t_on is not None:
                        duration = (off_time - t_on).total_seconds()
                        energy = power_kw * (duration / 3600.0)
                        db_log = EnergyLogDB(
                            timestamp=current_time, room=room_name, quadrant=key, 
                            event="OFF", duration_s=round(duration, 2), energy_kwh=round(energy, 6) 
                        )
                        db.add(db_log)
                        db.commit()
                    on_time[key] = None

            if smoothed_q != prev_q:
                try:
                    mqtt_client.publish(MQTT_TOPIC, json.dumps(smoothed_q))
                except Exception as e:
                    print(f"MQTT Publish error: {e}")

            prev_q = dict(smoothed_q) 
            active_quadrants = dict(smoothed_q)

            # Sync state_manager so /status endpoint reflects live detections
            for key in smoothed_q:
                state_manager.update_auto_status(key, smoothed_q[key] == 1)

            encode_params = [cv2.IMWRITE_JPEG_QUALITY, 65]
            ret_im, buffer = cv2.imencode('.jpg', frame, encode_params)
            if ret_im:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        current_time = datetime.now()
        cleanup_q: dict[str, int] = dict(active_quadrants) 
        for key, is_active in cleanup_q.items(): 
            if is_active == 1:
                off_time = current_time
                t_on = on_time.get(key)
                if t_on is not None:
                    duration = (off_time - t_on).total_seconds()
                    energy = power_kw * (duration / 3600.0)
                    db_log = EnergyLogDB(
                        timestamp=current_time, room=room_name, quadrant=key, 
                        event="OFF", duration_s=round(duration, 2), energy_kwh=round(energy, 6)  
                    )
                    db.add(db_log)
                    db.commit()
        
        active_quadrants = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}
        q_override_state = {"Q1": None, "Q2": None, "Q3": None, "Q4": None}
        
        try:
            mqtt_client.publish(MQTT_TOPIC, json.dumps(active_quadrants))
        except Exception as e:
            print(f"MQTT Publish error on end: {e}")
            
    finally:
        db.close()
        cap.release()
