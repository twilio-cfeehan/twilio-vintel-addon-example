import { AnalysisOpenAI } from "@/types/Analysis";
import { HumeAIResult } from "@/types/HumeAi";
import { Recording, RecordingsResponse } from "@/types/Recordings";
import { Conversation } from "@/types/Search";
import { Sentence } from "@/types/Sentences";
import { Transcript } from "@/types/Transcript";
import { TranscriptAnalysisResult } from "@/types/TranscriptAnalysis";
import { OperatorResult } from '@/types/OperatorResult';
import MockData from "./MockData";

class ApiService {
  token: string = "";

  async init(): Promise<String> {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""}/api/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token } = await resp.json();
      this.token = token;

      return this.token;
    } catch (error) {
      console.error("Error initializing VoiceService:", error);
      throw error;
    }
  }

  async getViewToken(transcriptionSid: string): Promise<String> {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""}/api/view-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcriptionSid }),
        }
      );

      const { token } = await resp.json();
      this.token = token;

      return this.token;
    } catch (error) {
      console.error("Error initializing VoiceService:", error);
      throw error;
    }
  }

  getToken(): string {
    return this.token;
  }

  async getCalls(): Promise<Recording[]> {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""}/api/recordings`
      );

      const { recordings } = await resp.json();
      return recordings;
    } catch (error) {
      console.error("Error initializing VoiceService:", error);
      throw error;
    }
  }

  async getAllTranscriptions(): Promise<Conversation[]> {
    let allConversations: Conversation[] = [];
    let page = 1;
    let pageCount = 1;

    do {
      const { conversations, meta } = await this.getTranscriptions(page, "", "", 1000);
      allConversations = allConversations.concat(conversations);
      pageCount = meta.page_count;
      page++;
    } while (page <= pageCount);

    return allConversations;
  }

  async getTranscriptions(page = 1, searchValue = "", filterFrom = "", limit = 10): Promise<{ conversations: Conversation[], meta: any }> {
    try {
      console.log(`Fetching transcriptions for page: ${page}, searchValue: ${searchValue}, filterFrom: ${filterFrom}, limit: ${limit}`); // Debug log
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""}/api/transcriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ page, searchValue, filterFrom, limit }),
        }
      );

      const data = await resp.json();
      console.log(`Received conversations for page: ${page}`, data); // Debug log

      // Ensure data contains conversations and meta
      if (!data.conversations || !data.meta) {
        throw new Error("Invalid response format");
      }

      return data; // Assuming data contains both conversations and meta
    } catch (error) {
      console.error("Error initializing VoiceService:", error);
      throw error;
    }
  }

  async getTranscriptAnalysis(
    transcriptionSid: string
  ): Promise<TranscriptAnalysisResult> {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""
        }/api/transcript?transcriptionSid=${transcriptionSid}`
      );

      return await resp.json();
    } catch (error) {
      console.error("Error initializing VoiceService:", error);
      throw error;
    }
  }

  async getSentences(transcriptSid: string): Promise<Sentence[]> {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""
        }/api/transcript?callSid=${transcriptSid}`
      );

      const { sentences } = await resp.json();
      return sentences;
    } catch (error) {
      console.error("Error initializing VoiceService:", error);
      throw error;
    }
  }

  async analyseSentences(sentences: Sentence[]): Promise<any> {
    try {
      const formatMessage = (channel: number, text: string) => ({
        role: channel == 2 ? "user" : "assistant",
        content: text,
      });

      const prompt = [
        {
          role: "system",
          content: `Anaylse this customer service interaction, respond base with a JSON object with the keys {"sentiment","business_outcome","summary"}`,
        },
      ];

      sentences.forEach(({ channel, transcript }) =>
        prompt.push(formatMessage(channel, transcript))
      );

      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""}/api/analyse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prompt),
        }
      );
    } catch (error) {
      console.error("Error initializing VoiceService:", error);
      throw error;
    }
  }

  async getAnalysisOpenAi(transcriptSid: string): Promise<AnalysisOpenAI> {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""
        }/api/fetch-analysis-openai?transcriptionSid=${transcriptSid}`
      );

      if (resp.status !== 200) {
        throw new Error("Analysis not found");
      }
      return await resp.json();
    } catch (error) {
      console.error("Error getting Open AI:", error);
      throw error;
    }
  }

  async getAnalysisHumeAi(transcriptSid: string): Promise<HumeAIResult> {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""
        }/api/fetch-analysis-humeai?transcriptionSid=${transcriptSid}`
      );

      if (resp.status !== 200) {
        throw new Error("Analysis not found");
      }
      return await resp.json();
    } catch (error) {
      console.error("Error getting Hume AI:", error);
      throw error;
    }
  }

  async getAnalysisHumeAiMock(transcriptSid: string): Promise<HumeAIResult> {
    const data = MockData;
    return new Promise<HumeAIResult>((resolve, reject) => {
      console.log("Returning Mock Hume Data", data);
      resolve(data as HumeAIResult);
    });
  }
  // async getAggregatedTranscriptions(): Promise<Conversation[]> {
  //   let allConversations: Conversation[] = [];
  //   let page = 1;
  //   let pageCount = 1;

  //   do {
  //     const { conversations, meta } = await this.getTranscriptions(page, "", "", 1000);
  //     allConversations = allConversations.concat(conversations);
  //     pageCount = meta.page_count;
  //     page++;
  //   } while (page <= pageCount);

  //   return allConversations;
  // }

  async getAggregatedAnalysis(): Promise<any> {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""}/api/aggregate-analysis-openai`
      );

      if (resp.status !== 200) {
        throw new Error("Aggregated analysis not found");
      }

      return await resp.json();
    } catch (error) {
      console.error("Error getting aggregated analysis:", error);
      throw error;
    }
  }
  async getIndividualAnalyses(): Promise<any[]> {
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ""}/api/fetch-individual-analyses`);
      return await resp.json();
    } catch (error) {
      console.error("Error fetching individual analyses:", error);
      throw error;
    }
  }
  async getOperatorResults(transcriptionSid: string): Promise<OperatorResult[]> {
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_OVERRIDE || ''}/api/fetch-operator-results?transcriptionSid=${transcriptionSid}`);
      console.log(resp);

      if (resp.status !== 200) {
        throw new Error('Operator results not found');
      }
      return await resp.json();
    } catch (error) {
      console.error('Error getting operator results:', error);
      throw error;
    }
  }

}



const service = new ApiService();

export default service;
