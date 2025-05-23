// Path: display_results/src/types.ts


export interface OpenAiResponseCategory {
  [phrase: string]: number; // phrase: score
}

export interface OpenAiResponseStatements {
  [category: string]: OpenAiResponseCategory; // e.g., "Excited about growth": { "phrase": score }
}

export interface Note { 
  _id: string;
  text: string;
  userId: string;
  userName?: string;
  timestamp: string;
}

export interface DocumentData {
  _id: string;
  original_title: string;
  original_abstract: string;
  openai_response: {
    "Sentiment Statements": OpenAiResponseStatements;
    "Factual Statements": OpenAiResponseStatements;
  };
  scores: {
    Sentiment_Score: [number, number];
    Factual_Score: [number, number];
  };
  error: string | null;
  notes: Note[]
}

export interface DocumentListItem {
  _id: string;
  original_title: string;
}

export interface PhraseToHighlight {
  text: string;
  score: number; // The intensity score (1-5)
  isWorried: boolean; // To determine color scale
  categoryKey: string; // e.g., "Excited about growth"
  opacity: number; // <<< New field for opacity (0.0 to 1.0)
  // Add original start/end indices if you pre-calculate them
}

export type StatementType = "Sentiment" | "Factual"; // Will be replaced by a number for focus
export type AspectType = "Margin" | "Growth"; // Will be replaced by a number for focus