from ultralytics import YOLO  # type: ignore
import cv2  # type: ignore
import torch  # type: ignore
import time
import sys
import requests  # type: ignore
from datetime import datetime
from typing import Dict, Optional

print("🚀 Starting program...")

# -------------------------------
# SERVER SETUP
# -------------------------------
SERVER_URL = "http://localhost:8000/log_energy/"

room_name = "Room1"

prev_q: Dict[str, int] = {"Q1":0, "Q2":0, "Q3":0, "Q4":0}

# Store ON timestamps
on_time: Dict[str, Optional[datetime]] = {"Q1":None, "Q2":None, "Q3":None, "Q4":None}

# Energy tracking
power_kw: float = 0.1  # 100W
total_energy: float = 0.0

try:
    # -------------------------------
    # LOAD MODEL
    # -------------------------------
    model = YOLO("yolov8s.pt")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    print(f"✅ Using device: {device}")

    # -------------------------------
    # LOAD VIDEO
    # -------------------------------
    cap = cv2.VideoCapture("video.mp4")

    if not cap.isOpened():
        print("❌ Video not found")
        sys.exit()

    print("🎥 Video started")

    x_ratio = 0.5
    y_ratio = 0.4

    # -------------------------------
    # MAIN LOOP
    # -------------------------------
    while True:
        ret, frame = cap.read()

        if not ret:
            print("✅ Video finished")
            break

        frame = cv2.resize(frame, (416, 416))
        h, w, _ = frame.shape

        x_line = int(w * x_ratio)
        y_line = int(h * y_ratio)

        # Draw quadrant lines
        cv2.line(frame, (x_line, 0), (x_line, h), (255,255,255), 2)
        cv2.line(frame, (0, y_line), (w, y_line), (255,255,255), 2)

        q: Dict[str, int] = {"Q1":0, "Q2":0, "Q3":0, "Q4":0}

        # -------------------------------
        # YOLO DETECTION
        # -------------------------------
        results = model(frame, conf=0.4)

        for r in results:
            for box in r.boxes:  # type: ignore
                if int(box.cls[0]) == 0:

                    x1, y1, x2, y2 = map(int, box.xyxy[0])

                    # Draw box
                    cv2.rectangle(frame, (x1,y1), (x2,y2), (0,255,0), 2)

                    cx = (x1 + x2)//2
                    cy = (y1 + y2)//2

                    cv2.circle(frame, (cx, cy), 5, (0,0,255), -1)

                    # Quadrant logic
                    if cx < x_line and cy < y_line:
                        q["Q1"] = 1
                        label = "Q1"
                    elif cx > x_line and cy < y_line:
                        q["Q2"] = 1
                        label = "Q2"
                    elif cx < x_line and cy > y_line:
                        q["Q3"] = 1
                        label = "Q3"
                    else:
                        q["Q4"] = 1
                        label = "Q4"

                    cv2.putText(frame, label, (x1, y1-10),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.6, (0,255,255), 2)

        current_time = datetime.now()

        # -------------------------------
        # EDGE + LOGGING + ENERGY
        # -------------------------------
        for key in q:

            # 🔼 ON EVENT
            if prev_q[key] == 0 and q[key] == 1:
                on_time[key] = current_time  # type: ignore

                payload = {
                    "room": room_name,
                    "quadrant": key,
                    "event": "ON"
                }
                try:
                    requests.post(SERVER_URL, json=payload)
                except Exception as e:
                    print(f"⚠️ Failed to send ON event: {e}")

                print(f"{key} ON at {current_time}")

            # 🔽 OFF EVENT
            elif prev_q[key] == 1 and q[key] == 0:

                off_time = current_time

                t_on = on_time.get(key)  # type: ignore
                if t_on is not None:
                    duration: float = (off_time - t_on).total_seconds()  # type: ignore

                    energy: float = power_kw * (duration / 3600.0)  # type: ignore

                    total_energy += energy  # type: ignore

                    payload = {
                        "room": room_name,
                        "quadrant": key,
                        "event": "OFF",
                        "duration_s": round(duration, 2),  # type: ignore
                        "energy_kwh": round(energy, 6)  # type: ignore
                    }
                    try:
                        requests.post(SERVER_URL, json=payload)
                    except Exception as e:
                        print(f"⚠️ Failed to send OFF event: {e}")

                    print(f"{key} OFF | Duration: {duration}s | Energy: {energy} kWh")

                on_time[key] = None

        prev_q = q.copy()

        cv2.imshow("Energy Tracking", frame)


        if cv2.waitKey(1) == 27:
            print("🛑 Interrupted")
            break

except KeyboardInterrupt:
    print("⚠️ Interrupted manually")

finally:
    try:
        cap.release()
        cv2.destroyAllWindows()
    except:
        pass

    print(f"⚡ TOTAL ENERGY USED: {total_energy} kWh")