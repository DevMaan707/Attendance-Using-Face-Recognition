const { parentPort } = require('worker_threads');
const { DynamoDBClient, PutItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const awsoptions = {
    region: "eu-north-1",
    credentials: {
        accessKeyId: "AKIA4MTWHUTSZXZJBGOG",
        secretAccessKey: "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"
    }
};

const client = new DynamoDBClient(awsoptions);

const addInTime = async (htno, time) => {
    const params = {
        TableName: "Student",
        Item: marshall({
            "Hall Ticket no.": htno,
            "Intime": time.toString(),
            "Outtime": null,
            "temp_in": null,
            "temp_out": null,
            "BREAK": null,
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

parentPort.on('message', async (message) => {
    try {
        const { action, htno, time } = message;
        if (action === 'addInTime') await addInTime(htno, time);
        else if (action === 'addOutTime') await addOutTime(htno, time);
        else if (action === 'addTempInTime') await addTempInTime(htno, time);
        else if (action === 'addTempOutTime') await addTempOutTime(htno, time);
        else if (action === 'addBreakTime') await addBreakTime(htno, time);
        parentPort.postMessage({ status: 'success' });
    } catch (error) {
        parentPort.postMessage({ status: 'error', error: error.message });
    }
});
