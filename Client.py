import cv2
import requests
from ultralytics import YOLOv10
from mtcnn.mtcnn import MTCNN
from collections import defaultdict
import numpy as np
import threading
from Face import FACE

server_url='http://localhost:8080'

model = YOLOv10('yolov10n.pt')
mtcnn = MTCNN()
video = cv2.VideoCapture('cctv.mp4')

track_history = defaultdict(lambda: [])
frame_storage = defaultdict(lambda: [])

frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
zone_outer = np.array([
    (0, frame_height - 400),
    (0, frame_height - 257),
    (frame_width, frame_height - 257),
    (frame_width, frame_height - 400),
])
zone_inner_start = (0, frame_height - 250)
zone_inner_end = (frame_width, frame_height)
zone_color_outer = (255, 0, 0)
zone_color_inner = (0, 255, 0)

def is_inside_zone(point, zone):
    return cv2.pointPolygonTest(zone, point, False) >= 0

def is_inside_rectangle(point, start, end):
    x, y = point
    return start[0] <= x <= end[0] and start[1] <= y <= end[1]

def process_frames(frames, track_id):
    face = FACE()
    embeddings = []
    i=0
    for frame in frames:
        if i>=15:
            break
        i+=1
        extracted_face = face.extractFace(frame)
        if extracted_face is not None  and extracted_face.size != 0:
            embeddings.append(face.getEmbeddings())
    payload = {}
    payload[track_id] = embeddings
    print("Sending request to server...")    
    try:
        _ = requests.post(server_url+'/predict', json=payload)
        print("Sent!")
    except :
        print("Exception Occurred")

while True:
    check, frame = video.read()

    if check:
        results = model.track(frame, persist=True, verbose=False)
        annotated_frame = frame.copy()

        for result in results:
            boxes = result.boxes
            if boxes.cls.tolist() == [] or 0 not in boxes.cls.tolist():
                print("Waiting for human..")
                continue

            boxes = results[0].boxes.xywh.cpu().numpy()
            track_ids = results[0].boxes.id.int().cpu().tolist()

            for box, track_id in zip(boxes, track_ids):
                center_x, center_y, w, h = map(int, box)
                x = center_x - w // 2
                y = center_y - h // 2
                center_point = (center_x, center_y)

                track_history[track_id].append(center_point)
                frame_storage[track_id].append(frame[y:y+h, x:x+w])

                if len(track_history[track_id]) > 1:
                    prev_point = track_history[track_id][-2]
                    curr_point = center_point

                    was_in_inner = is_inside_rectangle(prev_point, zone_inner_start, zone_inner_end)
                    is_in_inner = is_inside_rectangle(curr_point, zone_inner_start, zone_inner_end)

                    was_in_outer = is_inside_zone(prev_point, zone_outer)
                    is_in_outer = is_inside_zone(curr_point, zone_outer)

                    if was_in_inner and is_in_outer:
                        print(f"User {track_id} entered the class.")
                        
                        threading.Thread(target=process_frames, args=(frame_storage[track_id], track_id)).start()
                        frame_storage[track_id] = []  
                    elif was_in_outer and is_in_inner:
                        print(f"User {track_id} exited the class.")
                       
                        threading.Thread(target=process_frames, args=(frame_storage[track_id], track_id)).start()
                        frame_storage[track_id] = [] 

            annotated_frame = results[0].plot()
            cv2.polylines(annotated_frame, [zone_outer], isClosed=True, color=zone_color_outer, thickness=2)
            cv2.rectangle(annotated_frame, zone_inner_start, zone_inner_end, zone_color_inner, thickness=2)
            cv2.imshow("YOLOv10 Tracking", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        break

video.release()
cv2.destroyAllWindows()