#Attendance-Using-Face-Recognition

##Information
This project implements an attendance system using facial recognition technology. The following components and technologies were utilized:

 - YOLOv10: Used to track students entering and exiting the classroom.
 - FaceNet (via keras_facenet): Employed to obtain facial embeddings.
 - Support Vector Classifier (SVC): Used to train the model for recognizing and identifying students based on their facial embeddings.
 - AWS DynamoDB: Stores attendance records.
 - Admin Portal: Developed using Express.js, this portal allows administrators to view all tables and attendance data.
