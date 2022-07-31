import AWS from "aws-sdk";

import commonMiddleware from "../lib/commonMiddleware";
import createHttpError from "http-errors";
const dynamoDB = new AWS.DynamoDB.DocumentClient();
import { getAuctionById } from "./getAuction";

//contex: contain metadata, provider when lambda executed
// event: object inlude all infomation about event or this execution like body query parameter, path para, header, so on
// can add custom data (event or context) via middleware
async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  let updateAuction;

  const auction = await getAuctionById(id);

  if (auction.status != "OPEN")
    throw new createHttpError.Forbidden("You can not bid on closed auctions!");

  if (amount <= auction.highestBid.amount)
    throw new createHttpError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}!`
    );

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set  highestBid.amount = :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamoDB.update(params).promise();
    updateAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ updateAuction }),
  };
}

export const handler = commonMiddleware(placeBid);
