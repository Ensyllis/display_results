// src/types.ts
export interface OpenAiResponseCategory {
    [phrase: string]: number; // phrase: score
  }
  
  export interface OpenAiResponseStatements {
    [category: string]: OpenAiResponseCategory; // e.g., "Excited about growth": { "phrase": score }
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
    notes?: string;
  }
  
  export interface PhraseToHighlight {
    text: string;
    score: number; // The intensity score (1-5)
    isWorried: boolean; // To determine color scale
    categoryKey: string; // e.g., "Excited about growth"
    // Add original start/end indices if you pre-calculate them
  }
  
  export type StatementType = "Sentiment" | "Factual";
  export type AspectType = "Margin" | "Growth";