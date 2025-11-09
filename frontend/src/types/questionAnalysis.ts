export interface QuestionAnalysisItem {
  name: string;
  average_score: { value: number; delta: number | null; };
  score_distribution: { [key: string]: number };
  comments: string[];
  sentiment_score: { value: number; delta: number | null; };
  suggestion: {
    type: string;
    description: string;
    recommendation: string;
  } | null;
}

export type QuestionAnalysisMap = Record<string, QuestionAnalysisItem>;
