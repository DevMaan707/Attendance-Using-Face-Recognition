const express = require('express');
const { Worker } = require('worker_threads');
const bodyParser = require('body-parser');
const moment = require('moment');
const axios = require('axios');
const { getUserData, getIntime, getOuttime, getTempIntime, getTempOuttime } = require("./user_status");
const dataController = require('./dataController');

const htno = "DEV1V1bbbbsdfghjkbbbbddddfghjkdbbV1V1V1VMAN"; // Assuming htno is provided manually or from a configuration

const graceStartTime = moment('22:36', 'HH:mm');
const graceEndTime = moment('22:41', 'HH:mm');
const PeriodStart = moment('22:35', 'HH:mm');
const PeriodEnd = moment('22:40', 'HH:mm'); // Adjusted to ensure logical PeriodEnd time

const app = express();
app.use(bodyParser.json());

app.post('/insert', async (req, res) => {
    try {
        const currentTime = moment().format('HH:mm');
        const userData = await getUserData(htno);
        const EnteredIntime = await getIntime(htno);
        const EnteredOuttime = await getOuttime(htno);
        const EnteredTempintime = await getTempIntime(htno);
        const EnteredTempoutime = await getTempOuttime(htno);

        let action;
        console.log(`Current Time: ${currentTime}`);
        console.log(`Period Start: ${PeriodStart.format('HH:mm')}`);
        console.log(`Grace Start Time: ${graceStartTime.format('HH:mm')}`);
        console.log(`Period End: ${PeriodEnd.format('HH:mm')}`);
        console.log(`Entered Intime: ${EnteredIntime}`);
        console.log(`Entered Outtime: ${EnteredOuttime}`);
        console.log(`Entered Temp Intime: ${EnteredTempintime}`);
        console.log(`Entered Temp Outtime: ${EnteredTempoutime}`);

        if (currentTime >= PeriodStart.format('HH:mm') && currentTime <= graceStartTime.format('HH:mm')) {
            action = 'addInTime';
        } else if (currentTime > graceStartTime.format('HH:mm') && !EnteredTempoutime) {
            action = 'addTempOutTime';
        } else if (currentTime >= PeriodEnd.format('HH:mm')) {
            action = 'addOutTime';
        } else if (currentTime > graceStartTime.format('HH:mm') && EnteredTempoutime && !EnteredTempintime) {
            action = 'addTempInTime';
        } else if (currentTime > graceStartTime.format('HH:mm') && EnteredTempoutime && EnteredTempintime) {
            action = 'addTempOutTime';
            await executeWorkerTask('addTempInTime', htno, null);
        }

        console.log(`Selected action: ${action}`);

        if (action) {
            await executeWorkerTask(action, htno, currentTime);
        }

        if (EnteredTempintime && EnteredTempoutime) {
            const breakTime = moment.duration(moment(EnteredTempintime, 'HH:mm').diff(moment(EnteredTempoutime, 'HH:mm'))).asMinutes();
            await executeWorkerTask('addBreakTime', htno, breakTime);
        }

        res.status(200).json({ success: "Success data added" });
    } catch (e) {
        console.error("Error adding data:", e);
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
