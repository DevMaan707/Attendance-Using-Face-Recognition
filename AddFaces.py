import cv2
import pickle
import numpy as np
import os
from mtcnn.mtcnn import MTCNN
import matplotlib.pyplot as plt
import requests
import base64
import json
server_url='http://localhost:8080'


class FACE:
    def __init__(self):        
        self.detector = MTCNN()
        self.FACENET_SIZE = (160,160)
        self.embedder = FaceNet()
        self.X=[]
        self.Y=[]
        
    def extractFace(self,Image):
        try:
            x,y,w,h = self.detector.detect_faces(Image)[0]['box']
            outlined_face = cv2.rectangle(Image,(x,y),(x+w,y+h),(255,0,0))
            face = outlined_face[y:y+h,x:x+w]
            face = cv2.resize(face,self.FACENET_SIZE)
            return outlined_face,face
        except:
            return None,None
        
    def getEmbeddings(self,image):
        image = image.astype('float32')
        image = np.expand_dims(image,axis=0)
        yhat = self.embedder.embeddings(image)
        return yhat[0]




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

   # print(extracted_faces)
    
    try:
        payload = {'htno': htno, 'images': json.dumps(embeddings)}
        response = requests.post(server_url+'/putData', json=payload)
        print("Sent!")
    except :
        print("Excetion Occurred")
    if k==ord('q'):
        break
video.release()
cv2.destroyAllWindows()