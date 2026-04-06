import cv2 # type: ignore
import torch # type: ignore
import time
import os
from datetime import datetime
from ultralytics import YOLO # type: ignore
from database import SessionLocal, EnergyLogDB # type: ignore
import paho.mqtt.client as mqtt
import json

MQTT_BROKER = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "aegis_ai_v8/quadrant_status"
MQTT_OVERRIDE_TOPIC = "aegis_ai_v8/override"

_HERE = os.path.dirname(os.path.abspath(__file__))

try:
    mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
except AttributeError:
    mqtt_client = mqtt.Client()

try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.subscribe(MQTT_OVERRIDE_TOPIC)
    mqtt_client.loop_start()
    print("MQTT broker connected successfully.")
except Exception as e:
    print(f"MQTT broker unavailable (non-fatal): {e}")

video_path = os.path.join(_HERE, "video.mp4")
active_quadrants = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}
q_override_state = {"Q1": None, "Q2": None, "Q3": None, "Q4": None}

def on_message(client, userdata, msg):
    global q_override_state, active_quadrants
    topic = msg.topic
    payload = msg.payload.decode('utf-8').strip()
    
    if topic == MQTT_OVERRIDE_TOPIC:
        if payload in ["Q1_TOGGLE", "Q2_TOGGLE", "Q3_TOGGLE", "Q4_TOGGLE"]:
            target_q = payload.split("_")[0]
            current_q = active_quadrants.get(target_q, 0)
            q_override_state[target_q] = 0 if current_q == 1 else 1
            print(f"Manual Override Triggered for {target_q}. New state: {q_override_state[target_q]}")

mqtt_client.on_message = on_message

def set_video_path(path: str):
    global video_path
    video_path = path

def get_active_quadrants():
    global active_quadrants
    return active_quadrants

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
