//imports
require('dotenv').config();
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const app = express();
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');


//Defining port
const port = 8080 || process.env.PORT;

//MiddleWares to handle url-encoded data and json data
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));
app.use(expressLayout);
app.use('/css',express.static(__dirname+'public/css'))


app.set('layout','./layouts/main');
app.set('view engine','ejs');

//routes
app.use('/',require('./routes/index'));
app.use('/register',require('./routes/index'))
app.use('/update',require('./routes/index'))
app.use('/train',require('./routes/index'));
app.use('/putFace',require('./routes/index'));
app.use('/predict',require('./routes/index'))
//app.use('/auth',require('./server/routes/auth'));

//Staring 
app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})


