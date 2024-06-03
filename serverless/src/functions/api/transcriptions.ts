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
  searchValue: string;
  filterFrom: string;
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

  const { page = 1, limit = 10, searchValue, filterFrom } = event; // Default to page 1, 10 items per page
  console.log(`Processing request for page: ${page}, limit: ${limit}, searchValue: ${searchValue}, filterFrom: ${filterFrom}`); // Debug log

  const body = {
    search_fields: [
      { field: "account_sid", eq: context.ACCOUNT_SID },
      { field: "service_sid", eq: context.VINTEL_SERVICE_SID },
    ],
    ordering: { field: "date_created", order: "desc" },
    page,
    limit: 1000, // Fetch a large number of records to filter locally
  };

  let rsp = await fetch("https://ai.twilio.com/v1/Search", {
    headers: {
      authorization: `Basic ${btoa(
        context.ACCOUNT_SID + ":" + context.AUTH_TOKEN
      )}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    method: "POST",
  });

  let data = await rsp.json();
  console.log("Transcriptions", data);

  if (!data.conversations || !data.meta) {
    response.setBody({
      code: 400,
      message: "Invalid response format",
    });
    response.setStatusCode(400);
    callback(null, response);
    return;
  }

  let filteredConversations = data.conversations;

  // Apply partial matching filter for `searchValue`
  if (searchValue) {
    filteredConversations = filteredConversations.filter((conversation: any) =>
      conversation.sid.includes(searchValue)
    );
  }

  // Apply partial matching filter for `filterFrom`
  if (filterFrom) {
    filteredConversations = filteredConversations.filter((conversation: any) =>
      conversation.from_number.includes(filterFrom)
    );
  }

  // Fetch additional details for each conversation
  const enrichedConversations = await Promise.all(
    filteredConversations.map(async (conversation: any) => {
      const detailsRsp = await fetch(`https://intelligence.twilio.com/v2/Transcripts/${conversation.sid}`, {
        headers: {
          authorization: `Basic ${btoa(
            context.ACCOUNT_SID + ":" + context.AUTH_TOKEN
          )}`,
          "content-type": "application/json",
        },
      });
      const detailsData = await detailsRsp.json();
      return {
        ...conversation,
        status: detailsData.status,
        recording_sid: detailsData.channel.media_properties.source_sid,
      };
    })
  );

  // Paginate results after filtering
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedConversations = enrichedConversations.slice(start, end);

  response.setBody({
    conversations: paginatedConversations,
    meta: {
      page_count: Math.ceil(enrichedConversations.length / limit),
      page,
      total_matched: enrichedConversations.length,
    },
  });

  callback(null, response);
};
