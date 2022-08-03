import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import createHttpError from "http-errors";
import createAuctionSchema from "../lib/schemas/createAuctionSchema";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

//contex: contain metadata, provider when lambda executed
// event: object inlude all infomation about event or this execution like body query parameter, path para, header, so on
// can add custom data (event or context) via middleware
async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
  };

  try {
    await dynamoDB
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ auction }),
  };
}

export const handler = commonMiddleware(createAuction).use(
  validator({
    inputSchema: createAuctionSchema,
    ajvOptions: {
      useDefaults: false,
      strict: false,
    },
  })
);
