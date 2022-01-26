import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'haroon-comments-appsync-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        },
      },
      xrayEnabled: true,
    });

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL",{
      value: api.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this,"GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Reagion", {
      value: this.region
    });

    const commentsLambda = new lambda.Function(this, 'AppSyncCommentsHandler',{
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
      memorySize: 1024
    });

    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', commentsLambda);

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getCommentById"
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listComments"
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createComment"
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deleteComment"
    });

    // lambdaDs.createResolver({
    //   typeName: "Mutation",
    //   fieldName: "updateCommet"
    // });

    const commentTable = new ddb.Table(this, 'haroonCommentsTable',{
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {name: "id", type: ddb.AttributeType.STRING},
      sortKey: {name: "created_at", type: ddb.AttributeType.STRING}
    });
    // enable the Lambda function to access the DynamoDB table (using IAM)
    commentTable.grantFullAccess(commentsLambda)

    // Create an environment variable that we will use in the function code
    commentsLambda.addEnvironment('COMMENT_TABLE', commentTable.tableName);

  }
}
