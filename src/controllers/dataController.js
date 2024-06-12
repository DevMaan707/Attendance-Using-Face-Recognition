const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

exports.putData = async (req, res) => {
    console.log("PutData");
    const { htno, embeddings } = req.body;

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        console.log('Data directory does not exist. Creating...');
        fs.mkdirSync(dataDir);
    }

    const embeddingsFilePath = path.join(dataDir, 'embeddings.json');
    
    let embeddingsData = {};
    if (fs.existsSync(embeddingsFilePath)) {
        embeddingsData = JSON.parse(fs.readFileSync(embeddingsFilePath));
    }
    
    if (!embeddingsData[htno]) {
        embeddingsData[htno] = [];
    }
    embeddingsData[htno].push(...embeddings);

    fs.writeFileSync(embeddingsFilePath, JSON.stringify(embeddingsData));
    
    res.status(200).json({ message: 'Embeddings saved successfully' });
    
};

exports.train = async (req, res) => {
    console.log("Train");
    const pythonScript = path.join(__dirname, '../trainModel.py');
    const pythonProcess = spawn('python', [pythonScript]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python script stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });

    res.status(200).json({ message: 'Training initiated' });
};

exports.predict = async (req, res) => {
    console.log("Predict");
    const { embeddings } = req.body;

    const embeddingsString = JSON.stringify(embeddings);
    const pythonScript = path.join(__dirname, '../predict.py');
    const pythonProcess = spawn('python', [pythonScript, embeddingsString]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        res.status(200).json({ message: 'Prediction completed', result: JSON.parse(result) });
    });
};

exports.attendance = async(req,res)=>{
    console.log("Savir do this ;)")
}