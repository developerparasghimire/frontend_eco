"""Order invoice / receipt PDF generation.

Uses ReportLab's high-level Platypus layout engine. Pure Python, no system
dependencies. Returns the rendered bytes so callers can attach to email,
stream as an HTTP response, or save to storage.
"""
from __future__ import annotations

from decimal import Decimal
from io import BytesIO

from django.conf import settings
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)


def _money(value, currency: str = '₹') -> str:
    return f'{currency}{Decimal(value or 0):,.2f}'


def render_invoice_pdf(order) -> bytes:
    """Render a single-order invoice and return the PDF as bytes."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=18 * mm, bottomMargin=18 * mm,
        title=f'Invoice {order.order_number}',
        author='Eco Planet Solar',
    )

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle('h1', parent=styles['Title'], fontSize=22,
                        textColor=colors.HexColor('#0f172a'), spaceAfter=4)
    small = ParagraphStyle('small', parent=styles['Normal'], fontSize=9,
                           textColor=colors.HexColor('#475569'), leading=12)
    label = ParagraphStyle('label', parent=styles['Normal'], fontSize=8,
                           textColor=colors.HexColor('#64748b'),
                           spaceAfter=2, fontName='Helvetica-Bold')
    body = ParagraphStyle('body', parent=styles['Normal'], fontSize=10,
                          textColor=colors.HexColor('#0f172a'), leading=14)

    story: list = []

    # Header
    company = getattr(settings, 'COMPANY_NAME', 'Eco Planet Solar')
    company_addr = getattr(
        settings, 'COMPANY_ADDRESS',
        'Eco Planet Solar Pvt. Ltd.<br/>Bengaluru, Karnataka, India',
    )
    support = getattr(settings, 'SUPPORT_EMAIL', 'support@example.com')

    header_left = Paragraph(
        f'<b>{company}</b><br/><font size="9" color="#64748b">{company_addr}<br/>'
        f'Support: {support}</font>',
        body,
    )
    header_right = Paragraph(
        f'<para align="right"><font size="20" color="#0f172a"><b>INVOICE</b></font><br/>'
        f'<font size="10" color="#475569">#{order.order_number}</font><br/>'
        f'<font size="9" color="#64748b">'
        f'Date: {order.created_at.strftime("%d %b %Y")}</font></para>',
        body,
    )
    story.append(Table(
        [[header_left, header_right]],
        colWidths=[doc.width / 2.0] * 2,
        style=TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]),
    ))
    story.append(Spacer(1, 14))

    # Bill To / Payment block
    customer_email = getattr(order, 'customer_email', '') or order.guest_email or (
        order.user.email if order.user_id else ''
    )
    bill_to = Paragraph(
        f'<b>{order.shipping_full_name}</b><br/>'
        f'{order.shipping_address.replace(chr(10), "<br/>")}<br/>'
        f'{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}<br/>'
        f'{order.shipping_country}<br/>'
        f'Phone: {order.shipping_phone}<br/>'
        f'Email: {customer_email}',
        body,
    )
    pay_block = Paragraph(
        f'<b>Payment</b><br/>'
        f'Method: {order.get_payment_method_display()}<br/>'
        f'Status: {order.get_payment_status_display()}<br/>'
        + (f'Txn: {order.payment_id}<br/>' if order.payment_id else '')
        + (f'Coupon: {order.coupon_code}<br/>' if order.coupon_code else ''),
        body,
    )
    story.append(Table(
        [[Paragraph('<b>Bill to</b>', label), Paragraph('', label)],
         [bill_to, pay_block]],
        colWidths=[doc.width / 2.0] * 2,
        style=TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ]),
    ))
    story.append(Spacer(1, 14))

    # Line items table
    rows = [['#', 'Item', 'SKU', 'Qty', 'Unit price', 'Line total']]
    for idx, item in enumerate(order.items.all(), start=1):
        rows.append([
            str(idx),
            Paragraph(item.product_name + (
                '<br/><font size="8" color="#64748b">+ Installation '
                f'({_money(item.installation_fee)} × {item.quantity})</font>'
                if item.include_installation else ''
            ), body),
            item.sku,
            str(item.quantity),
            _money(item.unit_price),
            _money(item.line_total),
        ])
    items_table = Table(
        rows,
        colWidths=[10 * mm, 70 * mm, 25 * mm, 15 * mm, 28 * mm, 28 * mm],
    )
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#e2e8f0')),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1),
         [colors.white, colors.HexColor('#f8fafc')]),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 10))

    # Totals
    totals = [
        ['Subtotal', _money(order.subtotal)],
        ['Installation', _money(order.installation_total)],
    ]
    if order.discount_amount and Decimal(order.discount_amount) > 0:
        totals.append([
            f'Discount ({order.coupon_code})' if order.coupon_code else 'Discount',
            f'- {_money(order.discount_amount)}',
        ])
    totals += [
        [f'Tax ({order.tax_rate}%)', _money(order.tax_amount)],
        ['Shipping', _money(order.shipping_cost)],
        ['Grand total', _money(order.grand_total)],
    ]
    totals_table = Table(totals, colWidths=[40 * mm, 35 * mm], hAlign='RIGHT')
    totals_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('LINEABOVE', (0, -1), (-1, -1), 0.75, colors.HexColor('#0f172a')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('TOPPADDING', (0, -1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 18))

    if order.note:
        story.append(Paragraph('<b>Order note</b>', label))
        story.append(Paragraph(order.note, small))
        story.append(Spacer(1, 10))

    # Footer
    story.append(Paragraph(
        '<para align="center"><font size="8" color="#64748b">'
        f'Thank you for shopping with {company}. '
        f'For support, contact {support}.'
        '</font></para>',
        small,
    ))

    doc.build(story)
    return buffer.getvalue()
