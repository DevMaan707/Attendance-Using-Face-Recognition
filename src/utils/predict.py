from sklearn.preprocessing import LabelEncoder
from collections import Counter
import tensorflow as tf
import cv2
import pickle
import numpy as np
import os
import json
from mtcnn.mtcnn import MTCNN
import sys
import matplotlib.pyplot as plt
from keras_facenet import FaceNet
sys.stdout.reconfigure(encoding='utf-8')

class Predict:
    def __init__(self):
        self.detector = MTCNN()
        self.embedder = FaceNet()
        self.target_size = (160,160)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        with open('data/names.json', 'r',encoding="utf-8") as file:
            self.LABELS = json.load(file)
       
        self.encoder = LabelEncoder()
        
        print("Started Encoding...")  
        self.encoder.fit(self.LABELS)
        self.encoder.transform(self.LABELS)
        self.X=[]
    
    def get_embedding(self,face_img):
       # face_img = face_img.numpy()
        face_img = face_img.astype('float32')
        face_img= np.expand_dims(face_img,axis=0)
        yhat = self.embedder.embeddings(face_img)
        return yhat[0]
    
    def load_faces(self, dir):
        print("hii")
        FACES = []
        for im_name in os.listdir(dir):
            try:
                path = dir+"/"+ im_name
                print(path)
                single_face = self.extract_face(path)
                FACES.append(single_face)
            except Exception as e:
                print(e)
        self.X.extend(FACES)
        return np.asarray(self.X)
    
    def extract_face(self, filename):
        img = cv2.imread(filename)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        #plt.imshow(img)
       # plt.show()
        x,y,w,h = self.detector.detect_faces(img)[0]['box']        
        face = img[y:y+h, x:x+w]
        face_arr = cv2.resize(face, self.target_size)
        return face_arr
    

        

faces = Predict()     


X=[]
target_size=(160,160)
detector = MTCNN()
def load_faces( dir):
        print("hii")
        FACES = []
        for im_name in os.listdir(dir):
            try:
                path = dir+"/"+ im_name                               
                img = cv2.imread(path)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                FACES.append(img)
            except Exception as e:
                print(e)
        
        return FACES
    
def extract_face(img_):    
    x,y,w,h = detector.detect_faces(img_)[0]['box']        
    face = img_[y:y+h, x:x+w]
    face_arr = cv2.resize(face, target_size)
    return face_arr

predictions=[]
img = load_faces('data/images/prediction')

with open('data/names.json', 'r',encoding="utf-8") as file:
    LABELS = json.load(file)
    
encoder = LabelEncoder()
encoder.fit(LABELS)
encoder.transform(LABELS)

for i in img:
    extractedFace = extract_face(i)
    embeddedFace = faces.get_embedding(extractedFace)
    embeddedFace = [embeddedFace]
    with open('svm_model.pkl', 'rb') as file:
            loaded_model = pickle.load(file) 
    pred = loaded_model.predict(embeddedFace)
    print(pred)
    print(encoder.inverse_transform(pred))
            
