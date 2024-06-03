import cv2
from ultralytics import YOLO
from mtcnn.mtcnn import MTCNN
from collections import defaultdict
import numpy as np

model = YOLO('yolov8n.pt')
mtcnn = MTCNN()
video = cv2.VideoCapture(0)
track_history = defaultdict(lambda: [])

while True:
    check, frame = video.read()

    if check:
        results = model.track(frame, persist=True)
        for result in results:
            boxes= result.boxes
            cls = boxes.cls.tolist()
            if 0 in cls:
                num_humans=0
                print("Human detected..")
                break
            else:
                num_humans=1
                print("Waiting for human..") 
        if num_humans==1:
            print("Waiting for detection...")
        else:
            boxes = results[0].boxes.xywh.cpu()
            track_ids = results[0].boxes.id.int().cpu().tolist()
            annotated_frame = results[0].plot()

            for box, track_id in zip(boxes, track_ids):
                x, y, w, h = box
                track = track_history[track_id]
                track.append((float(x), float(y)))  
                if len(track) > 30: 
                    track.pop(0)

                points = np.hstack(track).astype(np.int32).reshape((-1, 1, 2))
                cv2.polylines(annotated_frame, [points], isClosed=False, color=(230, 230, 230), thickness=10)

                if len(track) >= 2:
                    current_position = track[-1]
                    previous_position = track[-2]
                    if current_position[0] > previous_position[0]:
                        print("User moved from right to left (entered)")
                    elif current_position[0] < previous_position[0]:
                        print("User moved from left to right (exited)")

            cv2.imshow("YOLOv8 Tracking", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        break

video.release()
cv2.destroyAllWindows()
