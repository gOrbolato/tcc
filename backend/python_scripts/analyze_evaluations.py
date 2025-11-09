import sys
import json
import pandas as pd
from collections import Counter

# Palavras-chave para análise de sentimento simples
NEGATIVE_KEYWORDS = ['ruim', 'péssimo', 'lento', 'antigo', 'quebrado', 'difícil', 'desorganizado', 'insatisfeito', 'problema', 'falta', 'demora', 'ineficiente', 'inseguro', 'precisa melhorar']
POSITIVE_KEYWORDS = ['bom', 'ótimo', 'excelente', 'rápido', 'novo', 'funciona', 'fácil', 'organizado', 'satisfeito', 'eficiente', 'seguro', 'acessível']
STOPWORDS = set(['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'ela', 'nós', 'isso', 'este', 'esta'])

# Categorias com nomes mais descritivos
CATEGORIES = {
    "infraestrutura": "Infraestrutura Geral",
    "coordenacao": "Coordenação do Curso",
    "direcao": "Direção da Instituição",
    "localizacao": "Localização e Acesso",
    "acessibilidade": "Acessibilidade para Pessoas com Deficiência",
    "equipamentos": "Equipamentos e Laboratórios",
    "biblioteca": "Biblioteca (Física e Digital)",
    "didatica": "Didática e Metodologia dos Professores",
    "conteudo": "Relevância do Conteúdo do Curso",
    "dinamica_professores": "Dinamismo e Engajamento dos Professores",
    "disponibilidade_professores": "Disponibilidade e Suporte dos Professores",
}

def analyze_sentiment(comment):
    if not isinstance(comment, str): return 0
    comment_lower = comment.lower()
    neg_count = sum(1 for word in NEGATIVE_KEYWORDS if word in comment_lower)
    pos_count = sum(1 for word in POSITIVE_KEYWORDS if word in comment_lower)
    return pos_count - neg_count

def get_top_keywords(comments, n=3):
    words = []
    for text in comments:
        if not isinstance(text, str): continue
        # Remove pontuação simples e separa as palavras
        cleaned_text = text.lower().replace(',', '').replace('.', '').replace('!', '').replace('?', '')
        words.extend([word for word in cleaned_text.split() if word not in STOPWORDS and len(word) > 2])
    
    if not words:
        return []
    
    return [word for word, count in Counter(words).most_common(n)]

def generate_suggestion_object(avg_score, sentiment_score, score_distribution, comments):
    # A variável keywords e keyword_text não são mais usadas na string final, mas a lógica pode ser mantida para futuras melhorias.
    keywords = get_top_keywords(comments)
    
    # Análise de polarização
    polarization_text = ""
    if score_distribution:
        total_votes = sum(score_distribution.values())
        extremos = score_distribution.get(1, 0) + score_distribution.get(5, 0)
        if total_votes > 10 and (extremos / total_votes) > 0.4: # Mais de 40% das notas são 1 ou 5
            polarization_text = " Nota-se uma alta polarização nas respostas (muitas notas 1 e 5), indicando uma experiência de 'ame ou odeie'."

    if avg_score < 2.5 and sentiment_score < -0.5:
        return {
            "type": "Ponto Crítico",
            "description": f"A média é alarmantemente baixa, com um sentimento geral muito negativo.{polarization_text}",
            "recommendation": "Ação imediata é necessária. Investigue as causas raiz, focando nos pontos levantados pelos alunos."
        }
    elif avg_score < 3.5 and sentiment_score < 0:
        return {
            "type": "Ponto de Atenção",
            "description": f"O desempenho está abaixo do esperado, com sentimento negativo nos comentários.{polarization_text}",
            "recommendation": "Recomenda-se analisar os temas recorrentes para planejar melhorias."
        }
    elif avg_score > 4.0 and sentiment_score > 0.5:
        return {
            "type": "Ponto Forte",
            "description": "Esta área é um destaque, com uma excelente média e feedback muito positivo.",
            "recommendation": "Excelente trabalho! Continue a promover as boas práticas desta área. Considere usar este sucesso como modelo."
        }
    elif avg_score > 3.5 and sentiment_score >= 0:
        return {
            "type": "Ponto Positivo",
            "description": "A área apresenta um bom desempenho, com média satisfatória e sentimento geral positivo.",
            "recommendation": "Bom trabalho. Continue monitorando para manter a qualidade."
        }
    return None

def create_dataframe(evaluations_list):
    if not evaluations_list:
        return None
    df = pd.DataFrame(evaluations_list)
    for col in CATEGORIES.keys():
        nota_col = f'nota_{col}'
        if nota_col in df.columns:
            df[nota_col] = pd.to_numeric(df[nota_col], errors='coerce')
    
    if 'media_final' in df.columns:
        df['media_final'] = pd.to_numeric(df['media_final'], errors='coerce')
    
    nota_cols = [f'nota_{key}' for key in CATEGORIES.keys() if f'nota_{key}' in df.columns]
    if not nota_cols:
        return None
        
    df.dropna(subset=nota_cols, how='all', inplace=True)
    return df if not df.empty else None

def get_previous_metrics(df_previous):
    if df_previous is None:
        return {}
    
    previous_metrics = {}
    for key, name in CATEGORIES.items():
        nota_col = f'nota_{key}'
        if nota_col in df_previous.columns:
            valid_scores = df_previous[nota_col].dropna()
            if not valid_scores.empty:
                previous_metrics[name] = valid_scores.mean()
    return previous_metrics

def run_analysis(df):
    if df is None:
        return {"suggestions": [], "averages_by_question": {}, "analysis_by_question": {}, "score_distribution": {}}

    averages_by_question = {}
    analysis_by_question = {}
    suggestions = []
    aggregated_score_distribution = Counter()

    for key, name in CATEGORIES.items():
        nota_col = f'nota_{key}'
        comentario_col = f'comentario_{key}'

        if nota_col not in df.columns: continue

        valid_scores = df[nota_col].dropna()
        if valid_scores.empty: continue

        avg_score = valid_scores.mean()
        averages_by_question[name] = {"value": round(avg_score, 2), "delta": None}

        score_distribution = valid_scores.value_counts().to_dict()
        aggregated_score_distribution.update(score_distribution)
        
        comments = df[comentario_col].dropna().tolist() if comentario_col in df.columns else []
        
        sentiment_score = 0
        if comments:
            sentiment_score = df[comentario_col].dropna().apply(analyze_sentiment).mean()

        suggestion_obj = generate_suggestion_object(avg_score, sentiment_score, score_distribution, comments)
        if suggestion_obj:
            suggestions.append({
                "category": name,
                "score": round(avg_score, 2),
                "suggestion": suggestion_obj
            })

        analysis_by_question[key] = {
            "name": name,
            "average_score": {"value": round(avg_score, 2), "delta": None},
            "score_distribution": {int(k): int(v) for k, v in score_distribution.items()},
            "comments": comments,
            "sentiment_score": {"value": round(sentiment_score, 2), "delta": None},
            "suggestion": suggestion_obj
        }
    
    return {
        "averages_by_question": averages_by_question,
        "suggestions": suggestions,
        "analysis_by_question": analysis_by_question,
        "score_distribution": {int(k): int(v) for k, v in aggregated_score_distribution.items()}
    }

def generate_executive_summary(result):
    if not result or not result.get("suggestions"):
        return "Não foi possível gerar um resumo devido à falta de dados de avaliação."

    suggestions = result["suggestions"]
    avg_final = result.get("average_media_final", {}).get("value", 0)

    strong_points = sorted([s for s in suggestions if s.get("suggestion", {}).get("type") == "Ponto Forte"], key=lambda x: x["score"], reverse=True)
    attention_points = sorted([s for s in suggestions if "Atenção" in s.get("suggestion", {}).get("type") or "Crítico" in s.get("suggestion", {}).get("type")], key=lambda x: x["score"])

    summary = f"O relatório geral indica um desempenho com média final de {avg_final:.2f}. "

    if strong_points:
        top_strong_points = [s["category"] for s in strong_points[:2]]
        summary += f"Os destaques positivos foram em **{', '.join(top_strong_points)}**, onde os alunos demonstraram alta satisfação. "
    
    if attention_points:
        top_attention_points = [s["category"] for s in attention_points[:2]]
        summary += f"Por outro lado, as áreas que requerem maior atenção são **{', '.join(top_attention_points)}**. "

    if strong_points and attention_points:
        summary += "Recomenda-se focar os esforços de melhoria nas áreas críticas, enquanto se mantém e dissemina as boas práticas das áreas de destaque."
    elif attention_points:
        summary += "É crucial focar os esforços de melhoria nessas áreas para elevar a satisfação geral."
    elif strong_points:
        summary += "O desempenho geral é muito positivo. O foco deve ser em manter a excelência e identificar oportunidades de melhoria incremental."
    else:
        summary += "O desempenho geral é neutro, sem pontos de destaque ou de grande preocupação. Recomenda-se uma análise mais aprofundada para identificar oportunidades de melhoria."

    return summary

def main():
    sys.stdin.reconfigure(encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')


    raw_data = sys.stdin.read()
    
    try:
        data_periods = json.loads(raw_data)
        current_evaluations = data_periods.get("current", [])
        previous_evaluations = data_periods.get("previous", [])
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}), file=sys.stderr)
        sys.exit(1)

    df_current = create_dataframe(current_evaluations)
    df_previous = create_dataframe(previous_evaluations)

    result = run_analysis(df_current)

    current_total = len(df_current) if df_current is not None else 0
    current_avg_final = df_current['media_final'].mean() if df_current is not None and not df_current.empty and 'media_final' in df_current.columns else 0

    previous_total = len(df_previous) if df_previous is not None else 0
    previous_avg_final = df_previous['media_final'].mean() if df_previous is not None and not df_previous.empty and 'media_final' in df_previous.columns else 0

    result['total_evaluations'] = {
        "value": current_total,
        "delta": current_total - previous_total if df_previous is not None else None
    }
    result['average_media_final'] = {
        "value": round(current_avg_final, 2),
        "delta": round(current_avg_final - previous_avg_final, 2) if df_previous is not None else None
    }
    
    if df_previous is not None:
        previous_metrics = get_previous_metrics(df_previous)
        for name, metrics in result["averages_by_question"].items():
            if name in previous_metrics:
                delta = metrics["value"] - previous_metrics[name]
                metrics["delta"] = round(delta, 2)
        
        for key, analysis in result["analysis_by_question"].items():
            name = analysis["name"]
            if name in previous_metrics:
                delta = analysis["average_score"]["value"] - previous_metrics[name]
                analysis["average_score"]["delta"] = round(delta, 2)

    result["executive_summary"] = generate_executive_summary(result)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()