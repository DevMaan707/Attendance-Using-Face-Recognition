const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const {spawn} = require('child_process');

exports.putData = async (req, res) => {
    console.log("PutData")
    const { htno, images } = req.body;

    const extracted_faces = JSON.parse(images);

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        console.log('Data directory does not exist. Creating...');
        fs.mkdirSync(dataDir);
    }
    const namesFilePath = path.join(dataDir, 'names.json');
    const facesDataFilePath = path.join(dataDir, 'faces_data.json');

    let names = [];
    let nNames= new Array(10).fill(htno);
    if (fs.existsSync(namesFilePath)) {
        names = JSON.parse(fs.readFileSync(namesFilePath));
        names.push(...nNames);
    } else {
        names = new Array(10).fill(htno);
    }

    let facesData = [];
    if (fs.existsSync(facesDataFilePath)) {
        facesData = JSON.parse(fs.readFileSync(facesDataFilePath));
    }  

    extracted_faces.forEach((base64Image, index) => {
    const imageData = Buffer.from(base64Image, 'base64');
    const imagesDir = path.join(dataDir, 'images', htno); // Corrected line
    if (!fs.existsSync(imagesDir)) {
        console.log('Images directory does not exist. Creating...');
        fs.mkdirSync(imagesDir, { recursive: true });
    }
    const imageFilePath = path.join(imagesDir, `image_${index}.png`);
    fs.writeFileSync(imageFilePath, imageData);
    facesData.push(imageFilePath);
    });

    fs.writeFileSync(namesFilePath, JSON.stringify(names));
    fs.writeFileSync(facesDataFilePath, JSON.stringify(facesData));

    res.status(200).json({ message: 'Images saved successfully' });
    //train();
};


exports.train= async(req,res)=>{
    console.log("Train")
    const pythonScript = path.join(__dirname,'../trainModel.py');
    const pythonProcess = spawn('python',[pythonScript]);
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python script stdout: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script stderr: ${data}`);
    });
    
    
    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
    res.status(200).json({ message: 'Trained saved successfully'});
}

exports.predict = async (req,res)=>{
    console.log("Helloww")
    const {images} = req.body;
    const faces = JSON.parse(images);

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        console.log('Data directory does not exist. Creating...');
        fs.mkdirSync(dataDir);
    }

    const predDir = path.join(dataDir, 'images','prediction');
    if (!fs.existsSync(predDir)) {
        console.log('Data directory does not exist. Creating...');
        fs.mkdirSync(predDir);
    }

    faces.forEach((base64Image, index) => {
        const imageData = Buffer.from(base64Image, 'base64');
        const imagesDir = path.join(dataDir, 'images', 'prediction');
        if (!fs.existsSync(imagesDir)) {
            console.log('Images directory does not exist. Creating...');
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        const imageFilePath = path.join(imagesDir, `image_${index}.png`);
        fs.writeFileSync(imageFilePath, imageData);
        //facesData.push(imageFilePath);
        });


    const pythonScript = path.join(__dirname,'../predict.py');
    const pythonProcess = spawn('python',[pythonScript]);
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python script stdout: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script stderr: ${data}`);
    });
    
    
    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
    res.status(200).json({ message: 'Trained saved successfully'});
}


