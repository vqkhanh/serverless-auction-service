import AWS from "aws-sdk";

import commonMiddleware from "../../lib/commonMiddleware";
import createHttpError from "http-errors";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  let auction;

  try {
    const result = await dynamoDB
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();

    auction = result.Item;
    console.log("auction11=", auction);
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(error);
  }

  if (!auction) {
    throw new createHttpError.NotFound(`Auction with ID ${id} not found!`);
  }

  return auction;
}

//contex: contain metadata, provider when lambda executed
// event: object inlude all infomation about event or this execution like body query parameter, path para, header, so on
// can add custom data (event or context) via middleware
async function getAuction(event, context) {
  const { id } = event.pathParameters;

  const auction = await getAuctionById(id);
  console.log("auction=", auction);

  return {
    statusCode: 201,
    body: JSON.stringify({ auction }),
  };
}

export const handler = commonMiddleware(getAuction);
