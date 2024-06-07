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
    VINTEL_SERVICE_SID: string;
    SYNC_SERVICE_SID: string;
};

type MyEvent = {};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
    async function (
        context: Context<MyContext>,
        event: MyEvent,
        callback: ServerlessCallback
    ) {
        console.log(">>> INCOMING FETCH INDIVIDUAL ANALYSES REQUEST >>>");

        const response = new Twilio.Response();
        response.appendHeader("Access-Control-Allow-Origin", "*");
        response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
        response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
        response.appendHeader("Content-Type", "application/json");

        try {
            let client = context.getTwilioClient();

            // Fetching the list of transcripts
            const transcriptsResp = await fetch(
                `https://ai.twilio.com/v1/Services/${context.VINTEL_SERVICE_SID}/Transcripts?PageSize=50`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${btoa(
                            context.ACCOUNT_SID + ":" + context.AUTH_TOKEN
                        )}`,
                    },
                }
            );

            let transcriptsData = await transcriptsResp.json();
            const { transcripts } = transcriptsData;

            if (!transcripts || transcripts.length === 0) {
                throw new Error("No transcripts found");
            }

            let individualData: any[] = [];

            // Fetching analysis data from Sync Maps for each transcript
            for (let transcript of transcripts) {
                try {
                    const item = await client.sync.v1
                        .services(context.SYNC_SERVICE_SID)
                        .syncMaps(`TRANSCRIPT_${transcript.sid}`)
                        .syncMapItems("openai")
                        .fetch();

                    individualData.push({ ...item.data, date_created: transcript.date_created, transcription_sid: transcript.sid });

                    // Break if we have enough records
                    if (individualData.length >= 50) {
                        break;
                    }
                } catch (error) {
                    console.error(`Error fetching analysis for transcript ${transcript.sid}:`, error);
                }
            }

            response.setBody(individualData);
            return callback(null, response);
        } catch (error) {
            console.error("Error fetching individual analyses:", error);
            response.setBody({ error: "Unable to fetch individual analyses" });
            response.setStatusCode(500);
            callback(null, response);
        }
    };
