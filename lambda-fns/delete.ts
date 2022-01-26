const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function deleteComment(commentId: string) {
    const params = {
        TableName: process.env.COMMENT_TABLE,
        Key: {
            id: commentId
        }
    }
    try{
        await docClient.delete(params).promise()
        return commentId
    }
    catch(err){
        console.log('DynamoDB error : ', err)
        return null
    }
}

export default deleteComment