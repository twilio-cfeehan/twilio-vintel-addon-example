export interface OperatorSearchResponse {
    meta: Meta;
    operator_results: OperatorResult[];
}

export interface Meta {
    page: number;
    page_size: number;
    first_page_url: string;
    previous_page_url: string | null;
    url: string;
    next_page_url: string | null;
    key: string;
}

export interface OperatorResult {
    name: string;
    label_probabilities: { [key: string]: number } | {};
    url: string;
    match_probability: string | null;
    predicted_probability: string | null;
    operator_sid: string;
    extract_match: boolean | null;
    transcript_sid: string;
    normalized_result: string | null;
    operator_type: string;
    utterance_results: UtteranceResult[];
    predicted_label: string | null;
    utterance_match: boolean | null;
    text_generation_results: TextGenerationResults | null;
    extract_results: ExtractResults;
}

export interface UtteranceResult {
    utterance_parts: UtterancePart[];
    utterance_index: number;
    match_probability: number;
    label_probabilities: { [key: string]: number } | null;
}

export interface UtterancePart {
    text: string;
    label: string;
}

export interface TextGenerationResults {
    result: string;
    format: string;
}

export interface ExtractResults {
    [key: string]: string[];
}
