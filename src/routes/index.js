const express= require('express');
//defining router
const app = express.Router();
//defining controller
const mainController = require('../controllers/mainController');
const dataController = require('../controllers/dataController')

//routes
app.get('/',mainController.homepage)
app.get('/register',mainController.register)
app.get('/update',mainController.update)
app.post('/putFace',dataController.putData)
app.get('/train',dataController.train)
app.post('/predict',dataController.predict)
app.post('/attendance',dataController.attendance)
//exports
module.exports = app;