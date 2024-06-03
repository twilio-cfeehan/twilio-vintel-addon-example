import "@twilio-labs/serverless-runtime-types";
import {
    Context,
    ServerlessCallback,
    ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
const fetch = require('node-fetch');

const { OpenAI } = require("openai");

type MyContext = {
    ACCOUNT_SID: string;
    AUTH_TOKEN: string;
    VINTEL_SERVICE_SID: string;
    OPENAI_MODEL: string;
    OPENAI_API_KEY: string;
    SYNC_SERVICE_SID: string;
};

type MyEvent = {};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
    async function (
        context: Context<MyContext>,
        event: MyEvent,
        callback: ServerlessCallback
    ) {
        console.log(">>> INCOMING AGGREGATED ANALYSIS REQUEST >>>");

        const response = new Twilio.Response();
        response.appendHeader("Access-Control-Allow-Origin", "*");
        response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
        response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
        response.appendHeader("Content-Type", "application/json");

        const formatMessage = (channel: number, text: string) => ({
            role: channel == 1 ? "user" : "assistant",
            content: text,
        });

        const prompt = [
            {
                role: "system",
                content: `Analyze these customer service interactions and provide aggregated insights. Respond back with a JSON object with the keys {"average_nps_score","average_csat_score"} and provide a plain text summary for "sentiment trends" and "business outcome themes". The response should be in the following format:

{
    "average_nps_score": 7.1,
    "average_csat_score": 6.3,
    "sentiment_summary": "Summary of sentiment trends...",
    "business_outcome_summary": "Summary of business outcome themes..."
}
Make sure the response is valid JSON and does not contain any additional characters or formatting.`,
            },
        ];

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

            let analysisData: any[] = [];

            // Fetching analysis data from Sync Maps for each transcript
            for (let transcript of transcripts) {
                try {
                    const item = await client.sync.v1
                        .services(context.SYNC_SERVICE_SID)
                        .syncMaps(`TRANSCRIPT_${transcript.sid}`)
                        .syncMapItems("openai")
                        .fetch();

                    analysisData.push(item.data);

                    // Break if we have enough records
                    if (analysisData.length >= 50) {
                        break;
                    }
                } catch (error) {
                    console.error(`Error fetching analysis for transcript ${transcript.sid}:`, error);
                }
            }

            if (analysisData.length === 0) {
                throw new Error("No analysis data found");
            }

            console.log("Collected analysis data:", analysisData);

            // Ensure analysisData is a valid JSON string
            const analysisDataString = JSON.stringify(analysisData);
            prompt.push({
                role: "user",
                content: analysisDataString
            });

            const openai = new OpenAI({
                apiKey: context.OPENAI_API_KEY,
            });

            const result = await openai.chat.completions.create({
                model: context.OPENAI_MODEL,
                messages: prompt,
                temperature: 0.3,
            });

            console.log("OpenAI input:", prompt);
            console.log("OpenAI response:", result.choices[0].message.content);

            if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
                const analysis = result.choices[0].message.content;

                console.log("OpenAI analysis output:", analysis);

                // Clean up the response string
                const cleanAnalysis = analysis.replace(/```json|```/g, '').trim();

                console.log("Cleaned analysis output:", cleanAnalysis);

                // Validate and parse the OpenAI response
                let parsedAnalysis;
                try {
                    parsedAnalysis = JSON.parse(cleanAnalysis);
                } catch (e: any) {
                    console.error(`Error parsing JSON: ${e.message}`);
                    throw new Error(`Unable to parse analysis JSON: ${e.message}`);
                }

                response.setBody(parsedAnalysis);

                // Ensure Sync Map exists
                let syncMap;
                try {
                    syncMap = await client.sync.v1
                        .services(context.SYNC_SERVICE_SID)
                        .syncMaps(`AGGREGATED_ANALYSIS`)
                        .fetch();
                } catch (e) {
                    syncMap = await client.sync.v1
                        .services(context.SYNC_SERVICE_SID)
                        .syncMaps.create({ uniqueName: `AGGREGATED_ANALYSIS` });
                }

                // Update or create Sync Map item
                try {
                    await client.sync.v1
                        .services(context.SYNC_SERVICE_SID)
                        .syncMaps(`AGGREGATED_ANALYSIS`)
                        .syncMapItems("openai")
                        .update({ data: parsedAnalysis });
                    console.log("Updated existing sync map item");
                } catch (e) {
                    await client.sync.v1
                        .services(context.SYNC_SERVICE_SID)
                        .syncMaps(`AGGREGATED_ANALYSIS`)
                        .syncMapItems.create({ key: "openai", data: parsedAnalysis });
                    console.log("Created new sync map item");
                }

                return callback(null, response);
            }

            throw new Error("Unable to perform aggregated analysis.");
        } catch (error) {
            console.error("Error performing aggregated analysis:", error);
            response.setBody({ error: "Unable to perform aggregated analysis" });
            response.setStatusCode(500);
            callback(null, response);
        }
    };
