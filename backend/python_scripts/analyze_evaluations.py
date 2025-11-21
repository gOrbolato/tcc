import sys
import json
import os
import pandas as pd
from collections import Counter
import google.generativeai as genai
import numpy as np # Adicionado numpy para np.nan

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

def get_detailed_analysis(analysis_by_question, average_media_final, all_comments):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Chave da API do Gemini não configurada. Defina a variável de ambiente GEMINI_API_KEY."

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro-latest')

        # Formatar os dados de entrada para o prompt
        input_data_str = f"Média geral final: {average_media_final:.2f}\n\n"
        input_data_str += "Médias por categoria:\n"
        for key, item in analysis_by_question.items():
            input_data_str += f"- {item['name']}: {item['average_score']['value']:.2f}\n"
        
        input_data_str += "\nComentários dos Alunos (amostra):\n"
        for category, comments in all_comments.items():
            if comments:
                input_data_str += f"- {category}:\n"
                for comment in comments[:5]: # Limita a 5 comentários por categoria para não exceder o limite do prompt
                    input_data_str += f"  - \"{comment}\"\n"


        prompt_content = f"""
        Assuma a posição de um Analista de Dados Educacionais Sênior. Com base nos dados quantitativos (médias) e qualitativos (comentários) a seguir, sua tarefa é gerar um relatório de análise aprofundado e um plano de ação.

        **Dados Brutos:**
        {input_data_str}

        **Sua resposta DEVE começar EXATAMENTE com a seguinte estrutura e seguir o formato definido:**

        ### Análise Detalhada

        **1. A Hipótese do "Platô de Desempenho":**
        Analise se os dados sugerem que a instituição atingiu um "platô de bom desempenho", onde a maioria dos resultados são "bons", mas não "excelentes". Discuta as implicações positivas (processos maduros) e negativas (falta de inovação, estagnação).

        **2. O Risco da Média Agregada:**
        Discuta os diferentes cenários que podem levar à média de {average_media_final:.2f}. O cenário é de consistência mediana (maioria das notas em torno de 4.0) ou de polarização oculta (notas excelentes sendo anuladas por notas problemáticas)? Use os dados das categorias para suportar sua análise.

        **3. Análise por Categoria (Integrando Comentários):**
        Com base nas médias de cada categoria e nos comentários fornecidos, identifique os pontos fortes e os pontos de atenção. Use os comentários para dar cor e contexto aos números. Por exemplo, se a nota de 'Localização e Acesso' é baixa, os comentários podem explicar se o problema é transporte, segurança ou estacionamento. Responda às perguntas: Onde somos excelentes? Onde precisamos melhorar urgentemente?

        ### Recomendações Estratégicas

        Com base na sua análise, proponha um plano de ação concreto.

        **Fase 1: Diagnóstico Aprofundado (Ações Imediatas)**
        1.  **Segmentação dos Dados:** Recomende a desagregação da média geral por outros eixos (unidade acadêmica, curso, docente, etc.).
        2.  **Análise da Distribuição de Frequência:** Recomende a construção de um histograma para visualizar a distribuição das notas e confirmar o cenário de consistência ou polarização.
        3.  **Análise Qualitativa:** Enfatize a importância de continuar a análise de sentimentos e tópicos dos comentários para dar contexto aos números, como você acabou de fazer.

        **Fase 2: Ações Táticas (Médio Prazo)**
        4.  **Criar o Programa "Faróis de Excelência":** Sugira a criação de um programa para identificar e disseminar as boas práticas das áreas com melhor desempenho.
        5.  **Plano de Desenvolvimento Focado:** Sugira um plano de ação individualizado para as áreas com pior desempenho, usando os insights dos comentários.
        6.  **Revisão de Metas e KPIs:** Recomende a redefinição de metas de sucesso, usando métricas multidimensionais em vez de uma única média.

        **Fase 3: Cultura de Dados (Longo Prazo)**
        7.  **Implementação de Dashboards Interativos:** Sugira a substituição de relatórios estáticos por dashboards interativos.
        8.  **Estabelecer Rituais de Análise de Dados:** Recomende a criação de um ciclo semestral de "Análise e Ação".

        Conclua com um parágrafo final que reforce a importância de uma gestão proativa e orientada por dados.
        """

        response = model.generate_content(prompt_content)
        return response.text.strip()
    except Exception as e:
        return f"Erro ao contatar a API do Gemini: {e}"

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
        cleaned_text = text.lower().replace(',', '').replace('.', '').replace('!', '').replace('?', '')
        words.extend([word for word in cleaned_text.split() if word not in STOPWORDS and len(word) > 2])
    
    if not words:
        return []
    
    return [word for word, count in Counter(words).most_common(n)]

def generate_suggestion_object(avg_score, sentiment_score, score_distribution, comments):
    keywords = get_top_keywords(comments)
    
    polarization_text = ""
    if score_distribution:
        total_votes = sum(score_distribution.values())
        extremos = score_distribution.get(1, 0) + score_distribution.get(5, 0)
        if total_votes > 10 and (extremos / total_votes) > 0.4:
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
    df.replace({np.nan: None}, inplace=True) # Replace NaN with None for JSON serialization
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
        return {"analysis_by_question": {}, "score_distribution": {}, "averages_by_question": {}}

    analysis_by_question = {}
    averages_by_question = {}
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

        analysis_by_question[key] = {
            "name": name,
            "average_score": {"value": round(avg_score, 2), "delta": None},
            "score_distribution": {int(k): int(v) for k, v in score_distribution.items()},
            "comments": comments,
            "sentiment_score": {"value": round(sentiment_score, 2), "delta": None},
            "suggestion": suggestion_obj
        }
    
    return {
        "analysis_by_question": analysis_by_question,
        "score_distribution": {int(k): int(v) for k, v in aggregated_score_distribution.items()},
        "averages_by_question": averages_by_question
    }

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

    all_comments = {item['name']: item['comments'] for item in result["analysis_by_question"].values() if item['comments']}
    result["detailed_analysis"] = get_detailed_analysis(result["analysis_by_question"], result["average_media_final"]["value"], all_comments)
    
    # Adicionando raw_data ao resultado final
    if df_current is not None:
        result['raw_data'] = df_current.to_dict(orient='records')
    else:
        result['raw_data'] = []

    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()