const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

let awsoptions = {
    region: "eu-north-1",
    credentials: {
        accessKeyId: "AKIA4MTWHUTSZXZJBGOG",
        secretAccessKey: "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"
    }
};

const client = new DynamoDBClient(awsoptions);

const getUserData = async function (htno) {
    const params = {
        TableName: "Student",
        Key: {
            "Hall Ticket no.": { S: htno }
        }
    };
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);
    return Item ? unmarshall(Item) : null;
};
// const client = new DynamoDBClient(awsoptions);

const getIntime = async function (htno) {
    const params = {
        TableName: "Student",
        Key: {
            "Hall Ticket no.": { S: htno }
        }
    };
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);
    const unmarshelledItem= Item ? unmarshall(Item) : null;
    return unmarshelledItem?unmarshelledItem.Intime:null;
};
const getOuttime = async function (htno) {
    const params = {
        TableName: "Student",
        Key: {
            "Hall Ticket no.": { S: htno }
        }
    };
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);
    const unmarshelledItem= Item ? unmarshall(Item) : null;
    return unmarshelledItem?unmarshelledItem.Outtime:null;
};
const getTempIntime = async function (htno) {
    const params = {
        TableName: "Student",
        Key: {
            "Hall Ticket no.": { S: htno }
        }
    };
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);
    const unmarshelledItem= Item ? unmarshall(Item) : null;
    return unmarshelledItem?unmarshelledItem.temp_in:null;
};
const getTempOuttime = async function (htno) {
    const params = {
        TableName: "Student",
        Key: {
            "Hall Ticket no.": { S: htno }
        }
    };
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);
    const unmarshelledItem= Item ? unmarshall(Item) : null;
    return unmarshelledItem?unmarshelledItem.temp_out:null;
};
module.exports = { getUserData,getIntime,getOuttime,getTempIntime,getTempOuttime };
