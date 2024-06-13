import os
import json
import sys
import pickle
from sklearn.preprocessing import LabelEncoder
import requests
from collections import Counter

server_url = "http://localhost:8080"

class Predict:
    def __init__(self):
        self.encoder = LabelEncoder()
        self.labels = []
        self.embeddings = {}
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        
        with open('data/embeddings.json', 'r', encoding="utf-8") as file:
            self.embeddings = json.load(file)
        
        for username, user_embeddings in self.embeddings.items():
            self.labels.extend([username] * len(user_embeddings))
        
        self.encoder.fit(self.labels)
        with open('svm_model.pkl', 'rb') as file:
            self.model = pickle.load(file)

    def predict(self, embeddings):
        predictions = []
        for embedded_face in embeddings:
            pred = self.model.predict([embedded_face])
            pred_label = self.encoder.inverse_transform(pred)
            predictions.append(pred_label[0])
        
        return predictions

if __name__ == "__main__":
    embeddings_string = sys.argv[1]
    embeddings = json.loads(embeddings_string)

    predictor = Predict()
    predictions = predictor.predict(embeddings)
    print(json.dumps(predictions))
    d = dict((i:predictions.count(i)) for i in predictions)
    result = max(d,key= d.get)
    try;
    _ = request.get(server_url+'/attendance')
