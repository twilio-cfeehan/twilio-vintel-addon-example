// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
const fetch = require("node-fetch");

type MyContext = {
  PROTOCOL: string;
};

type MyEvent = {
  transcript_sid: any;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    console.log(">>> INCOMING TOKEN REQUEST >>>");
    console.log(event);

    const response = new Twilio.Response();
    // Set the CORS headers to allow Flex to make an error-free HTTP request
    // to this Function
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    response.appendHeader("Content-Type", "application/json");

    if (!event.transcript_sid) {
      response.setBody({ error: "transcript_sid not provided" });
      response.setStatusCode(400);
      console.error("Missing transcript_sid in request");
      callback(null, response);
    }

    console.log("Creating transcript");
    await fetch(
      `${context.PROTOCOL}://${context.DOMAIN_NAME}/api/create-doc?transcriptionSid=${event.transcript_sid}`,
      {
        method: "POST",
      }
    );
    console.log("Transcript created");

    console.log("Performing Analysis");

    const analyseOpenAiPromise = fetch(
      `${context.PROTOCOL}://${context.DOMAIN_NAME}/api/analyse-openai?transcriptionSid=${event.transcript_sid}`,
      {
        method: "POST",
      }
    );

    const analyseHumeAiPromise = fetch(
      `${context.PROTOCOL}://${context.DOMAIN_NAME}/api/analyse-humeai?transcriptionSid=${event.transcript_sid}`,
      {
        method: "POST",
      }
    );

    // Perform analysis
    await Promise.all([analyseOpenAiPromise, analyseHumeAiPromise]);

    console.log("Analysis complete");

    response.setBody({ status: "complete" });
    return callback(null, response);
  };
