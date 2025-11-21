import sys
import json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def parse_and_style_text(text):
    """Converts markdown-like bold (**text**) to ReportLab's <b>text</b>."""
    return text.replace('**', '<b>').replace('**', '</b>')

def generate_pdf_report():
    # Read JSON data from stdin
    raw_data = sys.stdin.read()
    report_data = json.loads(raw_data)

    doc = SimpleDocTemplate(sys.stdout.buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(name='ReportTitle', fontSize=24, leading=28, alignment=TA_CENTER, spaceAfter=20))
    styles.add(ParagraphStyle(name='SectionTitle', fontSize=18, leading=22, spaceAfter=12, textColor='#2c3e50'))
    styles.add(ParagraphStyle(name='SubSectionTitle', fontSize=14, leading=16, spaceAfter=8, textColor='#34495e'))
    
    styles['BodyText'].fontSize = 10
    styles['BodyText'].leading = 14
    styles['BodyText'].spaceAfter = 10

    story = []

    # Title
    story.append(Paragraph("Relatório de Análise de Avaliações", styles['ReportTitle']))
    story.append(Spacer(1, 0.2 * inch))

    # General Summary (Still useful to have)
    story.append(Paragraph("Resumo Geral dos Dados", styles['SectionTitle']))
    total_evaluations = report_data.get("total_evaluations", {"value": 0, "delta": None})
    average_media_final = report_data.get("average_media_final", {"value": 0, "delta": None})

    story.append(Paragraph(f"Total de Avaliações: <b>{total_evaluations['value']}</b>", styles['BodyText']))
    if total_evaluations['delta'] is not None:
        delta_text = f" ({'+' if total_evaluations['delta'] > 0 else ''}{total_evaluations['delta']:.2f} vs. período anterior)"
        story.append(Paragraph(f"<font color='#555'>{delta_text}</font>", styles['BodyText']))
    
    story.append(Paragraph(f"Média Final Geral: <b>{average_media_final['value']:.2f}</b>", styles['BodyText']))
    if average_media_final['delta'] is not None:
        delta_text = f" ({'+' if average_media_final['delta'] > 0 else ''}{average_media_final['delta']:.2f} vs. período anterior)"
        story.append(Paragraph(f"<font color='#555'>{delta_text}</font>", styles['BodyText']))
    story.append(Spacer(1, 0.3 * inch))

    # Detailed AI Analysis
    detailed_analysis = report_data.get("detailed_analysis")
    if detailed_analysis:
        # Split the analysis into lines and process each one
        lines = detailed_analysis.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Handle section titles (###)
            if line.startswith('###'):
                title_text = line.replace('###', '').strip()
                story.append(Paragraph(title_text, styles['SectionTitle']))
                story.append(Spacer(1, 0.1 * inch))
            
            # Handle sub-section titles (e.g., 1. The "Performance Plateau" Hypothesis:)
            elif line.startswith('**') and line.endswith('**'):
                title_text = line.replace('**', '').strip()
                story.append(Paragraph(f"<b>{title_text}</b>", styles['SubSectionTitle']))

            # Handle list items (* or number.)
            elif line.startswith('* ') or (line and line[0].isdigit() and line[1] == '.'):
                list_item_text = line.split(' ', 1)[1]
                # Use a simple paragraph with a bullet character for simplicity
                story.append(Paragraph(f"• {parse_and_style_text(list_item_text)}", styles['BodyText'], bulletText='•'))

            # Handle normal paragraphs
            else:
                story.append(Paragraph(parse_and_style_text(line), styles['BodyText']))
    else:
        story.append(Paragraph("Nenhuma análise detalhada disponível.", styles['BodyText']))
    
    doc.build(story)

if __name__ == '__main__':
    generate_pdf_report()

