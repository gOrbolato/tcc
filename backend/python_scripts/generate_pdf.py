import sys
import json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def generate_pdf_report():
    # Read JSON data from stdin
    raw_data = sys.stdin.read()
    report_data = json.loads(raw_data)

    doc = SimpleDocTemplate(sys.stdout.buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(name='ReportTitle', fontSize=24, leading=28, alignment=TA_CENTER, spaceAfter=20))
    styles.add(ParagraphStyle(name='SectionTitle', fontSize=16, leading=20, spaceAfter=10, textColor='#333333'))
    styles.add(ParagraphStyle(name='SubSectionTitle', fontSize=12, leading=14, spaceAfter=5, textColor='#555555'))
    
    # Modify existing 'BodyText' style instead of adding a new one
    styles['BodyText'].fontSize = 10
    styles['BodyText'].leading = 12
    styles['BodyText'].spaceAfter = 6

    styles.add(ParagraphStyle(name='HighlightText', fontSize=10, leading=12, spaceAfter=6, textColor='#0056b3'))
    styles.add(ParagraphStyle(name='Positive', fontSize=10, leading=12, spaceAfter=6, textColor='#28a745'))
    styles.add(ParagraphStyle(name='Attention', fontSize=10, leading=12, spaceAfter=6, textColor='#ffc107'))
    styles.add(ParagraphStyle(name='Critical', fontSize=10, leading=12, spaceAfter=6, textColor='#dc3545'))

    story = []

    # Title
    story.append(Paragraph("Relatório de Avaliações", styles['ReportTitle']))
    story.append(Spacer(1, 0.2 * inch))

    # Executive Summary
    story.append(Paragraph("Resumo Executivo da Análise", styles['SectionTitle']))
    executive_summary_text = report_data.get("executive_summary", "Nenhum resumo executivo disponível.")
    # Replace **text** with <b>text</b> for ReportLab
    executive_summary_text = executive_summary_text.replace('**', '<b>').replace('**', '</b>') # Replace all occurrences
    story.append(Paragraph(executive_summary_text, styles['BodyText']))
    story.append(Spacer(1, 0.3 * inch))

    # General Summary
    story.append(Paragraph("Resumo Geral", styles['SectionTitle']))
    total_evaluations = report_data.get("total_evaluations", {"value": 0, "delta": None})
    average_media_final = report_data.get("average_media_final", {"value": 0, "delta": None})

    story.append(Paragraph(f"Total de Avaliações: <b>{total_evaluations['value']}</b>", styles['BodyText']))
    if total_evaluations['delta'] is not None:
        delta_text = f" ({'+' if total_evaluations['delta'] > 0 else ''}{total_evaluations['delta']:.2f} vs. período anterior)"
        story.append(Paragraph(f"<font color='{styles['HighlightText'].textColor}'>{delta_text}</font>", styles['BodyText']))
    
    story.append(Paragraph(f"Média Final Geral: <b>{average_media_final['value']:.2f}</b>", styles['BodyText']))
    if average_media_final['delta'] is not None:
        delta_text = f" ({'+' if average_media_final['delta'] > 0 else ''}{average_media_final['delta']:.2f} vs. período anterior)"
        story.append(Paragraph(f"<font color='{styles['HighlightText'].textColor}'>{delta_text}</font>", styles['BodyText']))
    story.append(Spacer(1, 0.3 * inch))

    # Suggestions and Insights
    story.append(Paragraph("Sugestões e Insights", styles['SectionTitle']))
    suggestions = report_data.get("suggestions", [])
    if suggestions:
        for suggestion_item in suggestions:
            category = suggestion_item.get("category", "N/A")
            score = suggestion_item.get("score", 0)
            suggestion_detail = suggestion_item.get("suggestion", {})
            
            type_text = suggestion_detail.get("type", "N/A")
            description = suggestion_detail.get("description", "N/A")
            recommendation = suggestion_detail.get("recommendation", "N/A")

            style_for_type = styles['BodyText']
            if "Ponto Forte" in type_text or "Ponto Positivo" in type_text:
                style_for_type = styles['Positive']
            elif "Ponto de Atenção" in type_text:
                style_for_type = styles['Attention']
            elif "Ponto Crítico" in type_text:
                style_for_type = styles['Critical']

            story.append(Paragraph(f"<b>{category}</b> (Média: {score:.1f})", styles['SubSectionTitle']))
            story.append(Paragraph(f"<b>{type_text}:</b> {description}", style_for_type))
            story.append(Paragraph(f"<b>Recomendação:</b> {recommendation}", styles['BodyText']))
            story.append(Spacer(1, 0.1 * inch))
    else:
        story.append(Paragraph("Nenhuma sugestão disponível.", styles['BodyText']))
    
    doc.build(story)

if __name__ == '__main__':
    generate_pdf_report()
