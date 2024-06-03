import { Conversation } from "./Search";

export interface MergedConversation extends Conversation {
    status?: string;
    recording_sid?: string;
}
