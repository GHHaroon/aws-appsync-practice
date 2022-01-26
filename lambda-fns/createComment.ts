const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import Comment from "./Comment";

async function createComment(comment:Comment) {
    console.log('creating comment')
    const params = {
        TableName: process.env.COMMENT_TABLE,
        Item: comment
    }
    try{
        await docClient.put(params).promise()
        return comment
    }
    catch(err){
        console.log(' DynamoDB error : ', err)
        return null
    }
}

export default createComment;