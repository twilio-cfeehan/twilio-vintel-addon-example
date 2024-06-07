// serverless/functions/fetch-operator-results.ts
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
};

type MyEvent = {
    transcriptionSid: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> = async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
) {
    const response = new Twilio.Response();
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    response.appendHeader("Content-Type", "application/json");

    if (!event.transcriptionSid) {
        response.setBody({ error: "transcriptionSid not provided" });
        response.setStatusCode(400);
        return callback(null, response);
    }

    try {
        const resp = await fetch(`https://intelligence.twilio.com/v2/Transcripts/${event.transcriptionSid}/OperatorResults`, {
            method: "GET",
            headers: {
                Authorization: `Basic ${btoa(context.ACCOUNT_SID + ":" + context.AUTH_TOKEN)}`,
            },
        });

        if (resp.status !== 200) {
            throw new Error('Operator results not found');
        }

        const data = await resp.json();
        response.setBody(data.operator_results);
        response.setStatusCode(200);
    } catch (error) {
        response.setBody({ error: "Unable to fetch operator results" });
        response.setStatusCode(500);
    }

    return callback(null, response);
};
