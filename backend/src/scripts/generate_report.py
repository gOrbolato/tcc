import os
import pandas as pd
import mysql.connector
from dotenv import load_dotenv
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph
from reportlab.lib.colors import red, green, black
from datetime import datetime

# Carrega as variáveis de ambiente
load_dotenv(dotenv_path='../../.env')

# --- Lógica de Análise e Sugestão ---

CATEGORIES = {
    "gestao": {
        "name": "Gestão e Administração",
        "keys": ["coordenacao", "direcao"]
    },
    "infraestrutura": {
        "name": "Infraestrutura e Recursos",
        "keys": ["infraestrutura", "equipamentos", "biblioteca", "localizacao", "acessibilidade"]
    },
    "docentes": {
        "name": "Corpo Docente",
        "keys": ["didatica", "dinamica_professores", "disponibilidade_professores"]
    },
    "conteudo": {
        "name": "Conteúdo do Curso",
        "keys": ["conteudo"]
    }
}

# Palavras-chave para análise de sentimento simples
NEGATIVE_KEYWORDS = ['ruim', 'péssimo', 'lento', 'antigo', 'quebrado', 'difícil', 'desorganizado', 'insatisfeito', 'problema', 'falta']

def analyze_sentiment(comment):
    if not isinstance(comment, str):
        return 0
    comment_lower = comment.lower()
    neg_count = sum(1 for word in NEGATIVE_KEYWORDS if word in comment_lower)
    return -neg_count

def generate_suggestions(df):
    suggestions = []
    for cat_key, cat_info in CATEGORIES.items():
        cat_name = cat_info['name']
        nota_cols = [f'nota_{key}' for key in cat_info['keys'] if f'nota_{key}' in df.columns]
        comentario_cols = [f'comentario_{key}' for key in cat_info['keys'] if f'comentario_{key}' in df.columns]

        if not nota_cols:
            continue

        # Calcula a média para a categoria inteira
        average_score = df[nota_cols].mean().mean()
        
        sentiment_score = 0
        if comentario_cols:
            # Soma o sentimento de todos os comentários da categoria
            sentiment_score = df[comentario_cols].apply(lambda row: row.apply(analyze_sentiment).sum(), axis=1).mean()

        # Regra 1: Nota baixa
        if average_score < 3.0:
            suggestion = f"""**Ponto Crítico em {cat_name} (Nota Média: {average_score:.1f}):** 
            A nota geral para este tópico está muito baixa. É urgente investigar as causas. 
            Analise os comentários específicos desta área para identificar os problemas e criar um plano de ação corretivo."""
            suggestions.append({"text": suggestion, "color": red})

        # Regra 2: Nota média com sentimento negativo
        elif average_score < 4.0 and sentiment_score < -0.1:
            suggestion = f"""**Ponto de Atenção em {cat_name} (Nota Média: {average_score:.1f}):** 
            As notas não são altas e os comentários indicam insatisfação. Recomenda-se focar em melhorias neste tópico. 
            Priorize os pontos mencionados nos comentários."""
            suggestions.append({"text": suggestion, "color": "orange"})

        # Regra 3: Nota alta
        elif average_score >= 4.5:
            suggestion = f"""**Ponto Forte em {cat_name} (Nota Média: {average_score:.1f}):** 
            Este tópico é um destaque positivo. Continue o bom trabalho e utilize as práticas desta área como exemplo para as demais. 
            Considere reconhecer os responsáveis."""
            suggestions.append({"text": suggestion, "color": green})
            
    return suggestions

# --- Geração do Relatório em PDF ---

def generate_report():
    try:
        db_connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"), user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"), database=os.getenv("DB_NAME")
        )
        query = "SELECT * FROM Avaliacoes"
        df = pd.read_sql(query, db_connection)
        db_connection.close()

        if df.empty:
            print("Nenhuma avaliação encontrada.")
            return None

        # --- Análise ---
        average_score = df['media_final'].mean()
        total_evaluations = len(df)
        suggestions_list = generate_suggestions(df)

        # --- Gráfico ---
        plt.figure(figsize=(8, 4))
        plt.hist(df['media_final'], bins=10, color='skyblue', edgecolor='black')
        plt.title('Distribuição das Médias Finais')
        plt.xlabel('Média Final'); plt.ylabel('Nº de Avaliações')
        chart_path = os.path.join('..', '..', 'reports', 'media_distribuicao.png')
        plt.savefig(chart_path)
        plt.close()

        # --- PDF ---
        report_path = os.path.join('..', '..', 'reports', 'relatorio_avaliacoes.pdf')
        c = canvas.Canvas(report_path, pagesize=letter)
        width, height = letter
        styles = getSampleStyleSheet()

        # Título
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, height - 50, "Relatório de Análise de Avaliações")
        c.setFont("Helvetica", 10)
        c.drawString(100, height - 70, f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")

        # Sumário
        c.setFont("Helvetica-Bold", 12)
        c.drawString(100, height - 120, "Resumo Geral")
        c.setFont("Helvetica", 11)
        c.drawString(100, height - 140, f"Total de Avaliações: {total_evaluations}")
        c.drawString(100, height - 160, f"Média Final Geral: {average_score:.2f}")

        # Gráfico
        c.drawImage(ImageReader(chart_path), 100, height - 340, width=400, height=180)

        # Sugestões e Plano de Ação
        c.setFont("Helvetica-Bold", 12)
        c.drawString(100, height - 380, "Sugestões e Plano de Ação")
        
        y_position = height - 400
        for sug in suggestions_list:
            p = Paragraph(sug['text'], style=styles['Normal'])
            p.wrapOn(c, width - 200, height)
            p_height = p.height
            if y_position - p_height < 80:
                c.showPage()
                y_position = height - 80
            
            p.drawOn(c, 100, y_position)
            y_position -= (p_height + 15)

        c.save()
        print(f"Relatório gerado com sucesso em: {report_path}")
        return report_path

    except Exception as e:
        print(f"Erro ao gerar relatório: {e}")
        return None

if __name__ == '__main__':
    generate_report()