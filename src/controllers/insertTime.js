const express = require('express');
const { DynamoDBClient, PutItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const bodyParser = require('body-parser');
const { getUserData, getIntime, getOuttime, getTempIntime, getTempOuttime } = require("./user_status");
const moment = require("moment");

const htno = "DEV1V1bbbbbbbbfdghsjdskmbvddddbbV1V1V1VMAN"; // Assuming htno is provided manually or from a configuration

let awsoptions = {
    region: "eu-north-1",
    credentials: {
        accessKeyId: "AKIA4MTWHUTSZXZJBGOG",
        secretAccessKey: "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"
    }
};

const lectureStartTime = moment('22:26', 'HH:mm');
const lectureEndTime = moment('22:31', 'HH:mm');
const PeriodStart = moment('22:25', 'HH:mm');
const PeriodEnd = moment('22:30', 'HH:mm');

const client = new DynamoDBClient(awsoptions);
const app = express();
app.use(bodyParser.json());

app.post('/insert', async (req, res) => {
    const currentTime = moment().format('HH:mm');
    try {
        const userData = await getUserData(htno);
        const EnteredIntime = await getIntime(htno);
        const EnteredOuttime = await getOuttime(htno);
        const EnteredTempintime = await getTempIntime(htno);
        const EnteredTempoutime = await getTempOuttime(htno);
        // console.log("Temp out",EnteredTempoutime);
        if (currentTime >=PeriodStart.format('HH:mm') && currentTime<=lectureStartTime.format('HH:mm')) {
            await addInTime(htno, currentTime);
        }
        else if (currentTime > lectureStartTime.format('HH:mm') && EnteredTempoutime == null) {
            await addTempOutTime(htno, currentTime);}
            else if (currentTime >= PeriodEnd.format('HH:mm')) {
                await addOutTime(htno, currentTime);
        } else if (currentTime > lectureStartTime.format('HH:mm') && EnteredTempoutime != null) {
            await addTempInTime(htno, currentTime);
        } else if (currentTime > lectureStartTime.format('HH:mm') && EnteredTempoutime != null && EnteredTempintime != null) {
            await addTempOutTime(htno, currentTime);
            await addTempInTime(htno, null);
        }
        
        if (EnteredTempintime != null && EnteredTempoutime != null) {
            const breakTime = moment.duration(moment(EnteredTempintime, 'HH:mm').diff(moment(EnteredTempoutime, 'HH:mm'))).asMinutes();
            console.log(breakTime);
            await addBreakTime(htno, breakTime);
        }

        console.log("Successfully added data");
        res.status(200).json({ success: "Success data added" });
    } catch (e) {
        console.log("Error adding data:", e);
        res.status(500).json({ error: "Error" });
    }
});

const addInTime = async (htno, time) => {
    const params = {
        TableName: "Student",
        Item: marshall({
            "Hall Ticket no.": htno,
            "Intime": time.toString(),
            "Outtime":null,
            "temp_in":null,
            "temp_out":null,
            "BREAK":null,
        })
    };
    const command = new PutItemCommand(params);
    await client.send(command);
};

const addOutTime = async (htno, time) => {
    const params = {
        TableName: "Student",
        Key: marshall({
            "Hall Ticket no.": htno
        }),
        UpdateExpression: "SET Outtime = :time",
        ExpressionAttributeValues: {
            ":time": { S: time.toString() }
        }
    };
    const command = new UpdateItemCommand(params);
    await client.send(command);
};

const addTempInTime = async (htno, time) => {
    const params = {
        TableName: "Student",
        Key: marshall({
            "Hall Ticket no.": htno
        }),
        UpdateExpression: "SET temp_in = :time",
        ExpressionAttributeValues: {
            ":time": { S: time.toString() }
        }
    };
    const command = new UpdateItemCommand(params);
    await client.send(command);
};

const addTempOutTime = async (htno, time) => {
    const params = {
        TableName: "Student",
        Key: marshall({
            "Hall Ticket no.": htno
        }),
        UpdateExpression: "SET temp_out = :time",
        ExpressionAttributeValues: {
            ":time": { S: time.toString() }
        }
    };
    const command = new UpdateItemCommand(params);
    await client.send(command);
};

const addBreakTime = async (htno, time) => {
    const params = {
        TableName: "Student",
        Key: marshall({
            "Hall Ticket no.": htno
        }),
        UpdateExpression: "SET BREAK = :time",
        ExpressionAttributeValues: {
            ":time": { S: time.toString() }
        }
    };
    const command = new UpdateItemCommand(params);
    await client.send(command);
};

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
