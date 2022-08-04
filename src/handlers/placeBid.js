import AWS from "aws-sdk";

import commonMiddleware from "../lib/commonMiddleware";
import createHttpError from "http-errors";
const dynamoDB = new AWS.DynamoDB.DocumentClient();
import { getAuctionById } from "./getAuction";
import validator from "@middy/validator";
import placeBidSchema from "../lib/schemas/placeBidSchema";

//contex: contain metadata, provider when lambda executed
// event: object inlude all infomation about event or this execution like body query parameter, path para, header, so on
// can add custom data (event or context) via middleware
async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;
  let updateAuction;

  const auction = await getAuctionById(id);

  if (email === auction.seller) {
    throw new createHttpError.Forbidden(`You cannot bid in your auctions!`);
  }

  if (email == auction.highestBid.bidder) {
    throw new createHttpError.Forbidden(`You are already the highest bid`);
  }

  if (auction.status != "OPEN")
    throw new createHttpError.Forbidden("You can not bid on closed auctions!");

  if (amount <= auction.highestBid.amount)
    throw new createHttpError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}!`
    );

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set  highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
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

export const handler = commonMiddleware(placeBid).use(
  validator({
    inputSchema: placeBidSchema,
    ajvOptions: {
      useDefaults: false,
      strict: false,
    },
  })
);
