// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
const fetch = require('node-fetch');

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  TWILIO_API_KEY: string;
  TWILIO_API_SECRET: string;
  VINTEL_SERVICE_SID: string;
};

type MyEvent = {
  transcriptionSid: string;
};

const TOKEN_TTL_IN_SECONDS = 60 * 60 * 6;

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

    if (!event.transcriptionSid) {
      response.setBody({ error: "transcriptionSid not provided" });
      response.setStatusCode(400);
      console.error("Missing transcriptionSid in request");
      callback(null, response);
    }

    let token_resp = await fetch("https://ai.twilio.com/v1/Tokens", {
      headers: {
        authorization: `Basic ${btoa(
          context.ACCOUNT_SID + ":" + context.AUTH_TOKEN
        )})`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        grants: [
          {
            product: "annotator",
            service_sid: context.VINTEL_SERVICE_SID,
            transcript_sid: event.transcriptionSid,
            metadata: {
              isDownloadButtonVisible: true,
            },
          },
        ],
      }),
      method: "POST",
    });

    let data = await token_resp.json();

    response.setBody(data);

    console.log("VINTEL Service: ", context.VINTEL_SERVICE_SID);
    console.log(response);
    callback(null, response);
  };
