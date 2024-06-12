import cv2
import requests
import json
from Face import FACE

server_url='http://localhost:8080'
video=cv2.VideoCapture(0)

face = FACE()

while True:
    i=0
    user_registered = []
    faces_input=[]
    extracted_faces =[]
    embeddings =[]
    htno = input("Enter htno : ")
    user_registered.append(htno)
    print(user_registered)
    k=cv2.waitKey(1)
    while True:        
        err,frame=video.read()   
        print(i) 
        i+=1    
        outlined_frame, extracted_face = face.extractFace(frame)
        if extracted_face is not None and extracted_face.size != 0: 
            embeddings.append(face.getEmbeddings(extracted_face))           
        if len(extracted_faces)==10:
            break
    
    print("Sending request to server...")    
    try:
        payload = {'htno': htno, 'embeddings': json.dumps(embeddings)}
        response = requests.post(server_url+'/putData', json=payload)
        print("Sent!")
    except :
        print("Exception Occurred")
    if k==ord('q'):
        break
video.release()
cv2.destroyAllWindows()