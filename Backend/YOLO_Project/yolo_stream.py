import cv2 # type: ignore
import torch # type: ignore
import time
import os
from datetime import datetime
from ultralytics import YOLO # type: ignore
from database import SessionLocal, EnergyLogDB # type: ignore
from state_manager import StateManager # type: ignore

_HERE = os.path.dirname(os.path.abspath(__file__))

video_path = os.path.join(_HERE, "video.mp4")
state_manager = StateManager()

def set_video_path(path: str):
    global video_path
    video_path = path

def get_active_quadrants():
    """Get current occupancy status of all quadrants (legacy compatibility)"""
    result = {}
    for quadrant in ["Q1", "Q2", "Q3", "Q4"]:
        # A quadrant is active if auto status says it should be occupied
        result[quadrant] = 1 if state_manager.auto_status[quadrant]["light"] else 0
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
    model = YOLO("yolov8n.pt")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    db = SessionLocal()
    prev_occupancy: dict[str, bool] = {"Q1": False, "Q2": False, "Q3": False, "Q4": False}
    q_counts: dict[str, int] = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}

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

        while True:
            # Skip frames — stop if video ends during skip
            end_of_video = False
            for _ in range(PROCESS_EVERY - 1):
                if not cap.grab():
                    end_of_video = True
                    break
                frame_idx += 1

            if end_of_video:
                break

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

            # Determine occupancy with smoothing
            smoothed_occupancy = {} 
            for key in q_counts:
                smoothed_occupancy[key] = q_counts[key] >= 4
            
            # Update state manager with occupancy changes
            for key in smoothed_occupancy:
                if prev_occupancy[key] != smoothed_occupancy[key]:
                    state_manager.update_auto_status(key, smoothed_occupancy[key])
                    state_manager.log_state_changes(db, room_name)
            
            prev_occupancy = dict(smoothed_occupancy) 

            encode_params = [cv2.IMWRITE_JPEG_QUALITY, 65]
            ret_im, buffer = cv2.imencode('.jpg', frame, encode_params)
            if ret_im:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        # Cleanup on video end - turn off all auto statuses
        for quadrant in ["Q1", "Q2", "Q3", "Q4"]:
            state_manager.update_auto_status(quadrant, False)
        state_manager.cleanup_on_shutdown(db, room_name)
            
    finally:
        db.close()
        cap.release()
