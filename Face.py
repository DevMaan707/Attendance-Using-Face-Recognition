import cv2
import numpy as np
from mtcnn.mtcnn import MTCNN
from keras_facenet import FaceNet


class FACE:

    def __init__(self):        
        self.detector = MTCNN()
        self.FACENET_SIZE = (160,160)
        self.embedder = FaceNet()        
        
    def extractFace(self,Image):
        try:
            x,y,w,h = self.detector.detect_faces(Image)[0]['box']
            outlined_face = cv2.rectangle(Image,(x,y),(x+w,y+h),(255,0,0))
            face = outlined_face[y:y+h,x:x+w]
            face = cv2.resize(face,self.FACENET_SIZE)
            return face
        except:
            return None
        
    def getEmbeddings(self,image):
        image = image.astype('float32')
        image = np.expand_dims(image,axis=0)
        yhat = self.embedder.embeddings(image)
        return yhat[0]