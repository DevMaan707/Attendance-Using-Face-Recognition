const express = require('express');
const { Worker } = require('worker_threads');
const bodyParser = require('body-parser');
const moment = require('moment');
const { getUserData, getIntime, getOuttime, getTempIntime, getTempOuttime } = require("./user_status");
const dataController=require('./dataController')

// const htno = "DEV1V1bbbbbbbbddddfghjkdbbV1V1V1VMAN"; // Assuming htno is provided manually or from a configuration


const lectureStartTime = moment('11:42', 'HH:mm');
const lectureEndTime = moment('11:45', 'HH:mm');
const PeriodStart = moment('11:41', 'HH:mm');
const PeriodEnd = moment('11:44', 'HH:mm');

const app = express();
app.use(bodyParser.json());

app.post('/attendance',dataController.attendance)

app.post('/insert', async (req, res) => {
    try {

        const attendanceResponse = await axios.post('http://localhost:5000/attendance', req.body);
        const htno=attendanceResponse.data;

        const currentTime = moment().format('HH:mm');
        const userData = await getUserData(htno);
        const EnteredIntime = await getIntime(htno);
        const EnteredOuttime = await getOuttime(htno);
        const EnteredTempintime = await getTempIntime(htno);
        const EnteredTempoutime = await getTempOuttime(htno);

        let action;
        if (currentTime >= PeriodStart.format('HH:mm') && currentTime <= lectureStartTime.format('HH:mm')) {
            action = 'addInTime';
        } else if (currentTime > lectureStartTime.format('HH:mm') && EnteredTempoutime == null) {
            action = 'addTempOutTime';
        } else if (currentTime >= PeriodEnd.format('HH:mm')) {
            action = 'addOutTime';
        } else if (currentTime > lectureStartTime.format('HH:mm') && EnteredTempoutime != null) {
            action = 'addTempInTime';
        } else if (currentTime > lectureStartTime.format('HH:mm') && EnteredTempoutime != null && EnteredTempintime != null) {
            action = 'addTempOutTime';
            await executeWorkerTask('addTempInTime', htno, null);
        }

        if (action) {
            await executeWorkerTask(action, htno, currentTime);
        }

        if (EnteredTempintime != null && EnteredTempoutime != null) {
            const breakTime = moment.duration(moment(EnteredTempintime, 'HH:mm').diff(moment(EnteredTempoutime, 'HH:mm'))).asMinutes();
            await executeWorkerTask('addBreakTime', htno, breakTime);
        }

        res.status(200).json({ success: "Success data added" });
    } catch (e) {
        console.log("Error adding data:", e);
        res.status(500).json({ error: "Error" });
    }
});

const executeWorkerTask = (action, htno, time) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./dynamoWorker.js');
        worker.postMessage({ action, htno, time });
        worker.on('message', (message) => {
            if (message.status === 'success') {
                resolve();
            } else {
                reject(new Error(message.error));
            }
        });
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
};

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
