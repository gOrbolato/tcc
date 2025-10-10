
import sys
import json
import pandas as pd

# Palavras-chave para análise de sentimento simples
NEGATIVE_KEYWORDS = ['ruim', 'péssimo', 'lento', 'antigo', 'quebrado', 'difícil', 'desorganizado', 'insatisfeito', 'problema', 'falta', 'demora', 'ineficiente']
POSITIVE_KEYWORDS = ['bom', 'ótimo', 'excelente', 'rápido', 'novo', 'funciona', 'fácil', 'organizado', 'satisfeito', 'eficiente']

CATEGORIES = {
    "infraestrutura": "Infraestrutura",
    "coordenacao": "Coordenação",
    "direcao": "Direção",
    "localizacao": "Localização",
    "acessibilidade": "Acessibilidade",
    "equipamentos": "Equipamentos",
    "biblioteca": "Biblioteca",
    "didatica": "Didática dos Professores",
    "conteudo": "Conteúdo do Curso",
    "dinamica_professores": "Dinâmica dos Professores",
    "disponibilidade_professores": "Disponibilidade dos Professores",
}

def analyze_sentiment(comment):
    if not isinstance(comment, str): return 0
    comment_lower = comment.lower()
    neg_count = sum(1 for word in NEGATIVE_KEYWORDS if word in comment_lower)
    pos_count = sum(1 for word in POSITIVE_KEYWORDS if word in comment_lower)
    return pos_count - neg_count

def generate_suggestions(df_evaluations):
    suggestions = []
    
    if df_evaluations.empty: return suggestions

    for key, name in CATEGORIES.items():
        nota_col = f'nota_{key}'
        comentario_col = f'comentario_{key}'

        if nota_col not in df_evaluations.columns: continue

        avg_score = df_evaluations[nota_col].mean()
        
        sentiment_score = 0
        if comentario_col in df_evaluations.columns:
            sentiment_score = df_evaluations[comentario_col].apply(analyze_sentiment).mean()

        if avg_score < 2.5 and sentiment_score < -0.5: # Nota muito baixa e sentimento negativo forte
            suggestions.append({
                "type": "critical",
                "category": name,
                "score": round(avg_score, 2),
                "sentiment": round(sentiment_score, 2),
                "suggestion": f"**Ponto Crítico em {name}:** A média ({round(avg_score, 2)}) é muito baixa e o sentimento é fortemente negativo. É urgente investigar as causas e implementar um plano de ação corretivo imediato. Priorize a escuta ativa dos alunos para entender os problemas específicos."
            })
        elif avg_score < 3.5 and sentiment_score < 0: # Nota média-baixa e sentimento negativo
            suggestions.append({
                "type": "attention",
                "category": name,
                "score": round(avg_score, 2),
                "sentiment": round(sentiment_score, 2),
                "suggestion": f"**Ponto de Atenção em {name}:** A média ({round(avg_score, 2)}) é baixa e o sentimento é negativo. Recomenda-se focar em melhorias nesta área. Analise os comentários para identificar os pontos fracos e planeje ações de médio prazo."
            })
        elif avg_score > 4.0 and sentiment_score > 0.5: # Nota alta e sentimento positivo forte
            suggestions.append({
                "type": "strong_point",
                "category": name,
                "score": round(avg_score, 2),
                "sentiment": round(sentiment_score, 2),
                "suggestion": f"**Ponto Forte em {name}:** A média ({round(avg_score, 2)}) é alta e o sentimento é fortemente positivo. Mantenha e promova as boas práticas desta área. Considere usar este sucesso como modelo para outras áreas."
            })
        elif avg_score > 3.5 and sentiment_score >= 0: # Nota boa e sentimento neutro/positivo
            suggestions.append({
                "type": "good_point",
                "category": name,
                "score": round(avg_score, 2),
                "sentiment": round(sentiment_score, 2),
                "suggestion": f"**Ponto Positivo em {name}:** A média ({round(avg_score, 2)}) é boa e o sentimento é neutro a positivo. Continue monitorando e buscando pequenas melhorias para manter a qualidade."
            })
    return suggestions

def main():
    # Lê os dados JSON do stdin
    raw_data = sys.stdin.read()
    evaluations_list = json.loads(raw_data)

    if not evaluations_list:
        print(json.dumps({"suggestions": [], "averages_by_question": {}}))
        return

    df = pd.DataFrame(evaluations_list)

    # Converte colunas de nota para numérico, tratando erros
    for col in CATEGORIES.keys():
        nota_col = f'nota_{col}'
        if nota_col in df.columns:
            df[nota_col] = pd.to_numeric(df[nota_col], errors='coerce')
    
    # Remove linhas onde a média final é NaN após a conversão
    df.dropna(subset=[f'nota_{list(CATEGORIES.keys())[0]}'], inplace=True) # Usa a primeira nota como base

    if df.empty:
        print(json.dumps({"suggestions": [], "averages_by_question": {}}))
        return

    # Calcula médias por pergunta
    averages_by_question = {}
    for col in CATEGORIES.keys():
        nota_col = f'nota_{col}'
        if nota_col in df.columns:
            averages_by_question[nota_col] = round(df[nota_col].mean(), 2)

    # Gera sugestões
    suggestions = generate_suggestions(df)

    # Saída JSON
    result = {
        "averages_by_question": averages_by_question,
        "suggestions": suggestions
    }
    print(json.dumps(result))

if __name__ == '__main__':
    main()
