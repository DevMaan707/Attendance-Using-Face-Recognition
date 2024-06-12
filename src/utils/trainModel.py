import os
import json
import pickle
from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

class TrainModel:
    def __init__(self):
        self.embeddings = {}
        self.labels = []
        self.embeddedFaces = []
        self.encoder = LabelEncoder()
        self.model = SVC(kernel='linear', probability=True)
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        
        with open('data/embeddings.json', 'r', encoding="utf-8") as file:
            self.embeddings = json.load(file)
        
        for username, user_embeddings in self.embeddings.items():
            self.labels.extend([username] * len(user_embeddings))
            self.embeddedFaces.extend(user_embeddings)

    def trainModel(self):
        print("Started Encoding...")
        self.encoder.fit(self.labels)
        Y = self.encoder.transform(self.labels)
        
        print("Started Splitting data...")
        X_train, X_test, Y_train, Y_test = train_test_split(self.embeddedFaces, Y, shuffle=True, random_state=45)
        
        print("Started Training...")
        self.model.fit(X_train, Y_train)
        
        ypredTrain = self.model.predict(X_train)
        ypredTest = self.model.predict(X_test)
        
        print("Training Accuracy:", accuracy_score(Y_train, ypredTrain))
        print("Testing Accuracy:", accuracy_score(Y_test, ypredTest))
        
        with open('svm_model.pkl', 'wb') as file:
            pickle.dump(self.model, file)

mod = TrainModel()
mod.trainModel()
