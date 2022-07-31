import { getEndedAuctions } from "../lib/getEndedAuctions";
import { closeAuction } from "../lib/closeAuction";
import createHttpError from "http-errors";

async function processAuctions(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );
    await Promise.all(closePromises);
    return { close: closePromises.length };
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError(error);
  }
}
export const handler = processAuctions;
