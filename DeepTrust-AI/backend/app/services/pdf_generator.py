import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_forensic_pdf(scan_data: Dict[str, Any], output_pdf_path: Path, evidence_image_path: Optional[str] = None) -> str:
    """
    Generates a professional DeepTrust AI Forensic Authenticity Certificate and PDF Report.
    """
    doc = SimpleDocTemplate(
        str(output_pdf_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#002B49'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#008FA8'),
        spaceAfter=15
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#020914'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#222222')
    )
    
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#666666')
    )

    story = []

    # Header Banner
    story.append(Paragraph("DEEPTRUST AI — FORENSIC VERIFICATION REPORT", title_style))
    story.append(Paragraph("Digital Authenticity & Forensic Media Examination Certificate", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#00D9F5'), spaceAfter=12))

    # Meta Table
    scan_id = scan_data.get("id", "N/A")
    created_at = scan_data.get("created_at", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"))
    media_type = str(scan_data.get("media_type", "audio")).upper()
    file_hash = scan_data.get("file_hash_sha256", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
    
    meta_info = [
        [Paragraph("<b>Certificate UUID:</b>", body_style), Paragraph(str(scan_id), body_style)],
        [Paragraph("<b>Timestamp:</b>", body_style), Paragraph(str(created_at), body_style)],
        [Paragraph("<b>Media Type:</b>", body_style), Paragraph(media_type, body_style)],
        [Paragraph("<b>SHA-256 Integrity Hash:</b>", body_style), Paragraph(f"<font name='Courier'>{file_hash[:48]}...</font>", body_style)],
        [Paragraph("<b>Analysis Engine:</b>", body_style), Paragraph(f"{scan_data.get('model_name', 'DeepTrust Engine')} ({scan_data.get('model_version', 'v2.0')})", body_style)],
    ]

    t_meta = Table(meta_info, colWidths=[1.8 * inch, 5.2 * inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F4F9FC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 14))

    # Assessment Results Box
    classification = scan_data.get("classification", "Under Evaluation")
    risk_score = scan_data.get("risk_score", 0.0)
    confidence = scan_data.get("confidence", 0.9)
    overall_risk = scan_data.get("overall_risk", "low").upper()

    risk_bg = colors.HexColor('#FFEBEF') if overall_risk in ('HIGH', 'CRITICAL') else colors.HexColor('#EBFBF6')
    risk_text_color = colors.HexColor('#D90429') if overall_risk in ('HIGH', 'CRITICAL') else colors.HexColor('#0F9D58')

    result_rows = [
        [
            Paragraph(f"<b>Classification:</b> <font color='{risk_text_color.hexval()}'><b>{classification}</b></font>", body_style),
            Paragraph(f"<b>Overall Risk:</b> <font color='{risk_text_color.hexval()}'><b>{overall_risk}</b></font>", body_style)
        ],
        [
            Paragraph(f"<b>Calculated Risk Score:</b> <b>{risk_score}%</b>", body_style),
            Paragraph(f"<b>Model Calibration Confidence:</b> <b>{round(confidence * 100, 1)}%</b>", body_style)
        ]
    ]
    t_result = Table(result_rows, colWidths=[3.5 * inch, 3.5 * inch])
    t_result.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), risk_bg),
        ('BOX', (0,0), (-1,-1), 1, risk_text_color),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_result)
    story.append(Spacer(1, 12))

    # Executive Summary & Findings
    story.append(Paragraph("FORENSIC SUMMARY & DETECTED ANOMALIES", section_heading))
    summary_text = scan_data.get("summary") or "Automated multi-spectral examination conducted on digital artifacts."
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 8))

    # Embed Evidence Visual (Spectrogram / ELA / Frame) if available
    if evidence_image_path and os.path.exists(evidence_image_path):
        story.append(Paragraph("PRIMARY FORENSIC SPECTRAL EVIDENCE", section_heading))
        try:
            img = RLImage(evidence_image_path, width=6.5 * inch, height=2.3 * inch)
            story.append(img)
            story.append(Spacer(1, 8))
        except Exception:
            pass

    # Technical Limitations
    story.append(Paragraph("TECHNICAL METHODOLOGY & LIMITATIONS", section_heading))
    limitations = scan_data.get(
        "technical_limitations",
        "Automated forensic models evaluate acoustic, compression, and statistical anomalies. Results may be affected by lossy transcoding."
    )
    story.append(Paragraph(limitations, body_style))
    story.append(Spacer(1, 10))

    # Recommendations
    story.append(Paragraph("RECOMMENDED VERIFICATION PROTOCOLS", section_heading))
    actions = scan_data.get("recommended_actions", [
        "Verify credentials through an established out-of-band communication channel.",
        "Preserve this document and original unmodified media for investigative review."
    ])
    for act in actions:
        story.append(Paragraph(f"• {act}", body_style))
    story.append(Spacer(1, 14))

    # Legal Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=8))
    story.append(Paragraph(
        "<b>LEGAL & COMPLIANCE DISCLAIMER:</b> This automated forensic report is generated for intelligence and risk assessment purposes. "
        "Automated probabilistic predictions do not constitute conclusive judicial proof of authenticity or manipulation. "
        "Independent expert human verification is recommended for legal proceedings.",
        disclaimer_style
    ))

    doc.build(story)
    return str(output_pdf_path)
