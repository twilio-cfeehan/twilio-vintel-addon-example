// types/OperatorResult.ts
export interface OperatorResult {
    name: string;
    operator_sid: string;
    transcript_sid: string;
    operator_type: string;
    text_generation_results?: {
        result: string;
        format: string;
    };
    extract_results?: Record<string, any>;
    label_probabilities?: Record<string, number>;
    match_probability?: number;
    predicted_probability?: number;
    utterance_results?: UtteranceResult[];
}

export interface UtteranceResult {
    utterance_parts: UtterancePart[];
    utterance_index: number;
    match_probability: number;
    label_probabilities?: Record<string, number>;
}

export interface UtterancePart {
    text: string;
    label: string;
}
