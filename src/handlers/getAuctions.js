import AWS from "aws-sdk";

import commonMiddleware from "../lib/commonMiddleware";
import createHttpError from "http-errors";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

//contex: contain metadata, provider when lambda executed
// event: object inlude all infomation about event or this execution like body query parameter, path para, header, so on
// can add custom data (event or context) via middleware
async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;
  let auctions;

  // const params = {};
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeValues: {
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };
  try {
    const result = await dynamoDB.query(params).promise();
    auctions = result.Items;
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ auctions }),
  };
}

export const handler = commonMiddleware(getAuctions);
