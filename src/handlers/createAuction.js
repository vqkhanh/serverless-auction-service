import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';

import middy from '@middy/core';  // engine middleware
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

//contex: contain metadata, provider when lambda executed
// event: object inlude all infomation about event or this execution like body query parameter, path para, header, so on
// can add custom data (event or context) via middleware
async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createAt: now.toISOString()
  };

  try {
    await dynamoDB.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    }).promise();
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(error);
  }



  return {
    statusCode: 201,
    body: JSON.stringify({ auction }),
  };
}

export const handler = middy(createAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());