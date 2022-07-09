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
async function getAuctions(event, context) {
 let auctions;


  try {
    const result = await dynamoDB.scan({ 
        TableName: process.env.AUCTIONS_TABLE_NAME 
    }).promise();

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

export const handler = middy(getAuctions)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());