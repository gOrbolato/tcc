/**
 * @interface QuestionAnalysisItem
 * @description Define a estrutura de dados para o resultado da análise de uma única questão.
 * Esta estrutura é geralmente retornada pela API de relatórios.
 */
export interface QuestionAnalysisItem {
  name: string; // O nome ou texto da questão analisada.
  
  // A pontuação média da questão e a variação em relação a um período anterior.
  average_score: { 
    value: number; // A média atual.
    delta: number | null; // A diferença (positiva ou negativa) em relação ao período anterior.
  };

  // A distribuição das notas (quantos votos para cada nota de 1 a 5).
  score_distribution: { [key: string]: number };

  // Uma lista dos comentários textuais deixados pelos usuários para esta questão.
  comments: string[];

  // A pontuação de sentimento média dos comentários e sua variação.
  sentiment_score: { 
    value: number; // A média de sentimento atual.
    delta: number | null; // A variação em relação ao período anterior.
  };

  // Uma sugestão gerada por IA com base nos dados da questão.
  suggestion: {
    type: string; // Tipo de sugestão (ex: "Ponto Forte", "Ponto de Atenção").
    description: string; // Descrição da análise que levou à sugestão.
    recommendation: string; // A recomendação acionável.
  } | null;
}

/**
 * @type QuestionAnalysisMap
 * @description Define um tipo para um objeto onde cada chave é o identificador de uma questão
 * e o valor é o objeto `QuestionAnalysisItem` correspondente.
 */
export type QuestionAnalysisMap = Record<string, QuestionAnalysisItem>;
