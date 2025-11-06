export interface QuestionAnalysisItem {
  name: string;
  average_score: number;
  score_distribution: { [key: string]: number };
  comments: string[];
  sentiment_score: number;
  suggestion: string;
}

export type QuestionAnalysisMap = Record<string, QuestionAnalysisItem>;
