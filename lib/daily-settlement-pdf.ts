import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import type { StoreSettings } from '@prisma/client';
import type { DailySettlementDay } from '@/lib/receipts';

const PAGE_WIDTH = 595.28; // A4 portrait
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 38;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2; // 519.28 pt
const BOTTOM_SAFE_Y = 58;

/**
 * Sanitizes strings for PDF StandardFonts WinAnsi (Windows-1252 / Latin-1 + selected symbols)
 * while preserving Norwegian letters (æ, ø, å, Æ, Ø, Å, –).
 */
function safePdfText(input: unknown): string {
  return String(input ?? '')
    .replace(/\u2212/g, '-') // Unicode minus -> ASCII hyphen
    .replace(/\u2192/g, '->') // Arrow -> ->
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00A0/g, ' ') // Non-breaking space
    .replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014]/g, '');
}

function fmtNok(value: number | null | undefined): string {
  const num = Number(value || 0);
  const formatted = num.toLocaleString('nb-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return safePdfText(formatted);
}

function truncateToWidth(text: string, font: PDFFont, size: number, maxWidth: number): string {
  const clean = safePdfText(text);
  if (font.widthOfTextAtSize(clean, size) <= maxWidth) return clean;
  let out = clean;
  while (out.length > 1 && font.widthOfTextAtSize(`${out}...`, size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}...`;
}

function drawRightText(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  font: PDFFont,
  size: number,
  color = rgb(0.1, 0.12, 0.16)
) {
  const clean = safePdfText(text);
  const w = font.widthOfTextAtSize(clean, size);
  page.drawText(clean, { x: rightX - w, y, size, font, color });
}

interface ColSpec {
  label: string;
  width: number;
  align: 'left' | 'right';
}

const TABLE_COLS: ColSpec[] = [
  { label: 'Kvitt.nr.', width: 52, align: 'left' },
  { label: 'Kl.', width: 42, align: 'left' },
  { label: 'Kunde / Opplevelse / Ref.', width: 152, align: 'left' },
  { label: 'Status', width: 50, align: 'left' },
  { label: 'MVA', width: 28, align: 'right' },
  { label: 'Grunnlag', width: 52, align: 'right' },
  { label: 'Utg. MVA', width: 46, align: 'right' },
  { label: 'Beløp', width: 52, align: 'right' },
  { label: 'Gebyr', width: 45, align: 'right' },
];
// Total = 52 + 42 + 152 + 50 + 28 + 52 + 46 + 52 + 45 = 519 pt

/**
 * Generates an accounting-grade A4 PDF document for a single daily Vipps settlement (`DO-xxx`).
 */
export async function generateDailySettlementPdfBuffer(
  day: DailySettlementDay,
  storeSettings?: Pick<StoreSettings, 'vatThresholdPassedDate'> | null
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.setTitle(safePdfText(`Dagsoppgjør ${day.settlementCode} (${day.date}) - Krs VR Arena AS`));
  doc.setAuthor('Krs VR Arena AS');
  doc.setSubject(safePdfText(`Bokføringsbilag ${day.settlementCode} for ${day.date}`));
  doc.setCreator('Krs VR Arena Regnskap');

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await doc.embedFont(StandardFonts.Courier);
  const fontMonoBold = await doc.embedFont(StandardFonts.CourierBold);

  const darkText = rgb(0.08, 0.1, 0.14);
  const mutedText = rgb(0.38, 0.42, 0.48);
  const borderLight = rgb(0.84, 0.86, 0.89);
  const borderDark = rgb(0.15, 0.18, 0.24);
  const bgSoft = rgb(0.96, 0.97, 0.98);
  const bgSupport = rgb(0.95, 0.96, 0.98);

  const thresholdDate = storeSettings?.vatThresholdPassedDate?.trim() || '';
  const hasVatActivity =
    Math.abs(day.outgoingVat || 0) > 0 ||
    Math.abs(day.revenue12VatBasis || 0) > 0 ||
    Math.abs(day.revenue25VatBasis || 0) > 0 ||
    Math.abs(day.revenueOtherVatBasis || 0) > 0 ||
    Boolean(thresholdDate && day.date >= thresholdDate);

  const orgNrText = `Org.nr 936 318 878${hasVatActivity ? ' MVA' : ''}`;
  const isHandlekurvDay = day.settlementNumber <= 102;
  const feeRateLabel = isHandlekurvDay
    ? 'Vipps Handlekurv 1,75 %'
    : '2,99 % + 1 kr per salg';

  const receiptSeriesText =
    day.firstReceiptNumber === day.lastReceiptNumber
      ? day.firstReceiptNumber
      : `${day.firstReceiptNumber} - ${day.lastReceiptNumber}`;
  const sequenceRangeText =
    day.firstSequenceNo === day.lastSequenceNo
      ? `#${day.firstSequenceNo}`
      : `#${day.firstSequenceNo}-#${day.lastSequenceNo}`;

  const generatedStamp = safePdfText(
    new Intl.DateTimeFormat('nb-NO', {
      timeZone: 'Europe/Oslo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())
  );

  const pages: PDFPage[] = [];
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(page);
  let y = PAGE_HEIGHT - 40;

  const drawTableHeader = (targetPage: PDFPage, startY: number): number => {
    targetPage.drawRectangle({
      x: MARGIN_X,
      y: startY - 18,
      width: CONTENT_WIDTH,
      height: 18,
      color: rgb(0.93, 0.94, 0.96),
      borderColor: borderLight,
      borderWidth: 0.75,
    });

    let curX = MARGIN_X;
    for (const col of TABLE_COLS) {
      if (col.align === 'left') {
        targetPage.drawText(safePdfText(col.label), {
          x: curX + 4,
          y: startY - 12.5,
          size: 7.5,
          font: fontBold,
          color: darkText,
        });
      } else {
        drawRightText(
          targetPage,
          col.label,
          curX + col.width - 4,
          startY - 12.5,
          fontBold,
          7.5,
          darkText
        );
      }
      curX += col.width;
    }

    return startY - 22;
  };

  // --- PAGE 1 TOP HEADER ---
  page.drawText(safePdfText(`VIPPS DAGSOPPGJØR ${day.settlementCode}`), {
    x: MARGIN_X,
    y,
    size: 17,
    font: fontBold,
    color: darkText,
  });

  drawRightText(page, 'Krs VR Arena AS', PAGE_WIDTH - MARGIN_X, y + 3, fontBold, 11, darkText);
  drawRightText(
    page,
    `${orgNrText} · Industrigata 12, 4632 Kristiansand`,
    PAGE_WIDTH - MARGIN_X,
    y - 10,
    fontRegular,
    8.5,
    mutedText
  );

  y -= 15;
  page.drawText(safePdfText('Betalingsløsning: VIPPS (Nettbutikk) · Salgsbilag'), {
    x: MARGIN_X,
    y,
    size: 8.5,
    font: fontRegular,
    color: mutedText,
  });

  y -= 10;
  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: PAGE_WIDTH - MARGIN_X, y },
    thickness: 1.5,
    color: borderDark,
  });

  // --- META & SERIES GRID ---
  y -= 12;
  const metaBoxHeight = 52;
  page.drawRectangle({
    x: MARGIN_X,
    y: y - metaBoxHeight,
    width: CONTENT_WIDTH,
    height: metaBoxHeight,
    color: bgSoft,
    borderColor: borderLight,
    borderWidth: 0.75,
  });

  const colW4 = CONTENT_WIDTH / 4;
  const drawMetaCell = (idx: number, label: string, val: string, sub?: string) => {
    const cx = MARGIN_X + idx * colW4 + 10;
    page.drawText(safePdfText(label.toUpperCase()), {
      x: cx,
      y: y - 14,
      size: 6.8,
      font: fontBold,
      color: mutedText,
    });
    page.drawText(safePdfText(val), {
      x: cx,
      y: y - 28,
      size: 10,
      font: fontBold,
      color: darkText,
    });
    if (sub) {
      page.drawText(safePdfText(sub), {
        x: cx,
        y: y - 41,
        size: 7.5,
        font: fontRegular,
        color: mutedText,
      });
    }
  };

  drawMetaCell(0, 'Dagsoppgjørsnr.', day.settlementCode, `Dato: ${day.date} (Oslo)`);
  drawMetaCell(1, 'Kvitteringsserie', receiptSeriesText, `Løpenr. ${sequenceRangeText}`);
  drawMetaCell(
    2,
    'Antall bilag',
    `${day.receiptCount} stk`,
    `${day.paymentCount} salg / ${day.refundCount} refusjon`
  );
  drawMetaCell(
    3,
    'Dagens sum netto',
    `${fmtNok(day.netTurnover)} kr`,
    `Akk. t.o.m. dato: ${fmtNok(day.accumulatedTurnover)} kr`
  );

  y -= metaBoxHeight + 10;

  // --- SALES & VAT BREAKDOWN BOX ---
  const taxableBasisTotal =
    Number(day.revenue12VatBasis || 0) +
    Number(day.revenue25VatBasis || 0) +
    Number(day.revenueOtherVatBasis || 0);

  const vatBoxHeight = 56;
  page.drawRectangle({
    x: MARGIN_X,
    y: y - vatBoxHeight,
    width: CONTENT_WIDTH,
    height: vatBoxHeight,
    color: rgb(1, 1, 1),
    borderColor: borderLight,
    borderWidth: 0.75,
  });

  page.drawText(safePdfText('OMSETNING VIA VIPPS OG MVA-SPESIFIKASJON (INKL. MVA DER AKTUELT)'), {
    x: MARGIN_X + 10,
    y: y - 13,
    size: 7.2,
    font: fontBold,
    color: mutedText,
  });

  const vatColW = CONTENT_WIDTH / 3;
  const drawSummaryLine = (colIdx: number, rowOffset: number, label: string, value: string) => {
    const lx = MARGIN_X + colIdx * vatColW + 10;
    const ly = y - 28 - rowOffset * 14;
    page.drawText(safePdfText(label), {
      x: lx,
      y: ly,
      size: 8.2,
      font: fontRegular,
      color: mutedText,
    });
    drawRightText(page, value, lx + vatColW - 22, ly, fontMonoBold, 8.5, darkText);
  };

  drawSummaryLine(0, 0, 'Brutto salg:', `${fmtNok(day.grossSales)} kr`);
  drawSummaryLine(0, 1, 'Refusjoner:', `${fmtNok(day.refunds)} kr`);
  drawSummaryLine(1, 0, 'Omsetning 0 % MVA:', `${fmtNok(day.revenue0Vat)} kr`);
  drawSummaryLine(1, 1, 'MVA-pliktig gr.l. (12 %):', `${fmtNok(taxableBasisTotal)} kr`);
  drawSummaryLine(2, 0, 'Utgående MVA:', `${fmtNok(day.outgoingVat)} kr`);
  drawSummaryLine(2, 1, 'Netto omsetning:', `${fmtNok(day.netTurnover)} kr`);

  y -= vatBoxHeight + 14;

  // --- RECEIPT TABLE ---
  page.drawText(safePdfText(`SPESIFIKASJON AV ENKELTBILAG (${day.receipts.length} stk)`), {
    x: MARGIN_X,
    y,
    size: 8,
    font: fontBold,
    color: darkText,
  });
  y -= 8;

  y = drawTableHeader(page, y);

  const rowHeight = 19;
  for (let i = 0; i < day.receipts.length; i++) {
    const r = day.receipts[i];
    if (y - rowHeight < BOTTOM_SAFE_Y + 28) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pages.push(page);
      y = PAGE_HEIGHT - 42;
      page.drawText(
        safePdfText(`DAGSOPPGJØR ${day.settlementCode} (${day.date}) - Fortsettelse enkeltbilag`),
        {
          x: MARGIN_X,
          y,
          size: 9.5,
          font: fontBold,
          color: darkText,
        }
      );
      y -= 12;
      y = drawTableHeader(page, y);
    }

    if (i % 2 === 1) {
      page.drawRectangle({
        x: MARGIN_X,
        y: y - rowHeight + 4,
        width: CONTENT_WIDTH,
        height: rowHeight,
        color: rgb(0.985, 0.985, 0.99),
      });
    }

    const descText = truncateToWidth(
      `${r.customerName}${r.experienceName ? ` · ${r.experienceName}` : ''} (${r.paymentRef})`,
      fontRegular,
      7.4,
      TABLE_COLS[2].width - 8
    );

    const rowY = y - 9.5;
    let curX = MARGIN_X;

    // 1. Kvitt.nr
    page.drawText(safePdfText(r.receiptNumber), {
      x: curX + 4,
      y: rowY,
      size: 7.5,
      font: fontMonoBold,
      color: darkText,
    });
    curX += TABLE_COLS[0].width;

    // 2. Kl.
    page.drawText(safePdfText(r.osloTime), {
      x: curX + 4,
      y: rowY,
      size: 7.5,
      font: fontMono,
      color: darkText,
    });
    curX += TABLE_COLS[1].width;

    // 3. Description
    page.drawText(descText, {
      x: curX + 4,
      y: rowY,
      size: 7.4,
      font: fontRegular,
      color: darkText,
    });
    curX += TABLE_COLS[2].width;

    // 4. Status
    page.drawText(safePdfText(r.status), {
      x: curX + 4,
      y: rowY,
      size: 7,
      font: fontRegular,
      color: r.amount < 0 ? rgb(0.7, 0.15, 0.15) : mutedText,
    });
    curX += TABLE_COLS[3].width;

    // 5. MVA %
    drawRightText(
      page,
      `${Number(r.vatRatePercent || 0)}%`,
      curX + TABLE_COLS[4].width - 4,
      rowY,
      fontMono,
      7.4,
      darkText
    );
    curX += TABLE_COLS[4].width;

    // 6. Grunnlag
    drawRightText(
      page,
      fmtNok(r.netAmount ?? r.amount),
      curX + TABLE_COLS[5].width - 4,
      rowY,
      fontMono,
      7.4,
      darkText
    );
    curX += TABLE_COLS[5].width;

    // 7. Utg. MVA
    drawRightText(
      page,
      fmtNok(r.vatAmount || 0),
      curX + TABLE_COLS[6].width - 4,
      rowY,
      fontMono,
      7.4,
      darkText
    );
    curX += TABLE_COLS[6].width;

    // 8. Beløp
    drawRightText(
      page,
      fmtNok(r.amount),
      curX + TABLE_COLS[7].width - 4,
      rowY,
      fontMonoBold,
      7.5,
      darkText
    );
    curX += TABLE_COLS[7].width;

    // 9. Gebyr
    drawRightText(
      page,
      fmtNok(r.vippsFee || 0),
      curX + TABLE_COLS[8].width - 4,
      rowY,
      fontMono,
      7.4,
      mutedText
    );

    page.drawLine({
      start: { x: MARGIN_X, y: y - rowHeight + 4 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: y - rowHeight + 4 },
      thickness: 0.4,
      color: borderLight,
    });

    y -= rowHeight;
  }

  // --- TABLE TOTALS FOOTER ---
  if (y - 24 < BOTTOM_SAFE_Y) {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = PAGE_HEIGHT - 60;
  }

  page.drawRectangle({
    x: MARGIN_X,
    y: y - 18,
    width: CONTENT_WIDTH,
    height: 20,
    color: bgSoft,
    borderColor: borderDark,
    borderWidth: 0.9,
  });

  const totY = y - 11;
  page.drawText(safePdfText(`Sum ${day.settlementCode} (${day.date})`), {
    x: MARGIN_X + 6,
    y: totY,
    size: 8,
    font: fontBold,
    color: darkText,
  });

  const grunnlagsColRight =
    MARGIN_X +
    TABLE_COLS[0].width +
    TABLE_COLS[1].width +
    TABLE_COLS[2].width +
    TABLE_COLS[3].width +
    TABLE_COLS[4].width +
    TABLE_COLS[5].width;
  const vatColRight = grunnlagsColRight + TABLE_COLS[6].width;
  const amountColRight = vatColRight + TABLE_COLS[7].width;
  const feeColRight = amountColRight + TABLE_COLS[8].width;

  const totalBasis = Number(day.revenue0Vat || 0) + taxableBasisTotal;
  drawRightText(page, fmtNok(totalBasis), grunnlagsColRight - 4, totY, fontMonoBold, 7.8, darkText);
  drawRightText(page, fmtNok(day.outgoingVat), vatColRight - 4, totY, fontMonoBold, 7.8, darkText);
  drawRightText(page, fmtNok(day.netTurnover), amountColRight - 4, totY, fontMonoBold, 7.8, darkText);
  drawRightText(page, fmtNok(day.vippsFee), feeColRight - 4, totY, fontMonoBold, 7.8, darkText);

  // --- FEES SECTION AT THE BOTTOM ("GEBYRER") ---
  y -= 36;
  const feesSectionHeight = 68;
  if (y - feesSectionHeight < BOTTOM_SAFE_Y) {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = PAGE_HEIGHT - 50;
  }

  page.drawText(safePdfText('GEBYRER (VIPPS)'), {
    x: MARGIN_X,
    y,
    size: 10.5,
    font: fontBold,
    color: darkText,
  });

  drawRightText(
    page,
    `Støttelinje for bokføring · ${feeRateLabel}`,
    PAGE_WIDTH - MARGIN_X,
    y + 1,
    fontRegular,
    8,
    mutedText
  );

  y -= 8;
  const supportBoxHeight = 46;
  page.drawRectangle({
    x: MARGIN_X,
    y: y - supportBoxHeight,
    width: CONTENT_WIDTH,
    height: supportBoxHeight,
    color: bgSupport,
    borderColor: rgb(0.68, 0.72, 0.78),
    borderWidth: 0.9,
  });

  page.drawText(safePdfText(`Sum Vipps-gebyrer: ${fmtNok(day.vippsFee)} kr`), {
    x: MARGIN_X + 10,
    y: y - 16,
    size: 9,
    font: fontMonoBold,
    color: darkText,
  });

  drawRightText(
    page,
    `Estimert netto utbetaling fra Vipps: ${fmtNok(day.estimatedVippsPayout)} kr`,
    PAGE_WIDTH - MARGIN_X - 10,
    y - 16,
    fontMonoBold,
    9,
    darkText
  );

  page.drawText(
    safePdfText(
      'Bank og kortgebyrer føres mot KTO 7770 Bank- og kortgebyrer. Gebyret påvirker ikke brutto salg eller netto salg.'
    ),
    {
      x: MARGIN_X + 10,
      y: y - 34,
      size: 7.8,
      font: fontRegular,
      color: mutedText,
    }
  );

  // --- PAGE FOOTERS ---
  const totalPages = pages.length;
  pages.forEach((p, idx) => {
    p.drawLine({
      start: { x: MARGIN_X, y: 42 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: 42 },
      thickness: 0.5,
      color: borderLight,
    });
    p.drawText(
      safePdfText(
        `Ubrutt nummerserie (${day.settlementCode} / ${receiptSeriesText}) · Nettbutikk (Vipps). Kontant/kortterminal i arena bokføres separat.`
      ),
      {
        x: MARGIN_X,
        y: 30,
        size: 6.8,
        font: fontRegular,
        color: mutedText,
      }
    );
    drawRightText(
      p,
      `Generert ${generatedStamp} · Side ${idx + 1} av ${totalPages}`,
      PAGE_WIDTH - MARGIN_X,
      30,
      fontRegular,
      6.8,
      mutedText
    );
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
