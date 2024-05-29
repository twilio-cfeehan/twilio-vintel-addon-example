import "@twilio-labs/serverless-runtime-types";
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
  TWIML_APP_SID: string;
  VINTEL_SERVICE_SID: string;
};

type MyEvent = {
  identity: string;
  page: number;
  limit: number;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> = async function (
  context: Context<MyContext>,
  event: MyEvent,
  callback: ServerlessCallback
) {
  console.log(">>> INCOMING TOKEN REQUEST >>>");
  console.log(event);

  const response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");

  const { page = 1, limit = 10 } = event; // Default to page 1, 10 items per page
  console.log(`Processing request for page: ${page}, limit: ${limit}`); // Debug log

  let rsp = await fetch("https://ai.twilio.com/v1/Search", {
    headers: {
      authorization: `Basic ${btoa(
        context.ACCOUNT_SID + ":" + context.AUTH_TOKEN
      )})`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      search_fields: [
        { field: "account_sid", eq: context.ACCOUNT_SID },
        { field: "service_sid", eq: context.VINTEL_SERVICE_SID },
      ],
      ordering: { field: "date_created", order: "desc" },
      page,
      limit,
    }),
    method: "POST",
  });

  let data = await rsp.json();
  console.log("Transcriptions", data);

  response.setBody(data);
  callback(null, response);
};
