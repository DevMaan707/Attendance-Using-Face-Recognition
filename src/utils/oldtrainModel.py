import os
import json
import cv2
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from collections import Counter
import tensorflow as tf
import pickle
import matplotlib.pyplot as plt
import numpy as np
from mtcnn.mtcnn import MTCNN
from keras_facenet import FaceNet

import sys
sys.stdout.reconfigure(encoding='utf-8')


class TrainModel:
    def __init__(self) :
        self.images=[]
        self.imagesPath=[]
        self.labels=[]
        self.encoder = LabelEncoder()
        self.model =SVC(kernel ='linear', probability=True)
        self.embeddedFaces=[]
        self.embedder = FaceNet()
        self.target_size=(160,160)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        with open('data/names.json', 'r',encoding="utf-8") as file:
            self.labels = json.load(file)
        with open('data/faces_data.json', 'r',encoding="utf-8") as file:
            self.imagesPath = json.load(file)
        print(self.labels)
        print(self.imagesPath)

    def getImages(self,dir):
        img = cv2.imread(dir)        
        self.images.append(cv2.resize(img,self.target_size))

    def loadImages(self):
        for num,i in enumerate(self.imagesPath):
            self.getImages(self.imagesPath[num])
        self.images = np.asarray(self.images)
        self.labels = np.asarray(self.labels)


    def get_embedding(self,face_img):
       
        face_img = face_img.astype('float32')
        face_img = np.expand_dims(face_img, axis=0)
        yhat = self.embedder.embeddings(face_img)
        return yhat[0]
       
    
    def trainModel(self):        
        #print("Started Embedding...".encode('utf-8'))  
        for img in self.images:
            self.embeddedFaces.append(self.get_embedding(img))
        #print("Started Encoding...".encode('utf-8'))  
        self.encoder.fit(self.labels)
        Y = self.encoder.transform(self.labels)   
        #print("Started Splitting data...".encode('utf-8'))     
        X_train,X_test,Y_train,Y_test = train_test_split(self.embeddedFaces,Y,shuffle=True, random_state=45)  
        #print("StartedTraining...".encode('utf-8'))        
        self.model.fit(X_train,Y_train)
        ypredTrain = self.model.predict(X_train)
        ypredTest = self.model.predict(X_test)
        #print("Accuracy:".encode('utf-8'))
        print(accuracy_score(Y_train,ypredTrain))
        print(accuracy_score(Y_test,ypredTest))
        with open('svm_model.pkl', 'wb') as file:
            pickle.dump(self.model, file)

mod = TrainModel()

mod.loadImages()
mod.trainModel()