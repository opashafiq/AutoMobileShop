'use client'

/* ═══════════════════════════════════════════════════════════
   Shared VECTOR PDF builder for report pages.

   Replaces the screenshot pipeline (html-to-image `toPng` +
   `sliceTallImageIntoPdfPages`) that rasterized the entire
   report into one giant PNG before slicing it into pages.
   Rasterizing is slow for large datasets (~870+ rows) and the
   output is never sharper than its screen resolution — text
   goes blurry when the PDF is zoomed or printed.

   Here the report is drawn with jsPDF's native text/shape
   API (tables via jspdf-autotable), so every glyph, line and
   border is vector: generation is near-instant regardless of
   row count, files are tiny, and text stays perfectly crisp
   at any zoom level.
   ═══════════════════════════════════════════════════════════ */

import jsPDF from 'jspdf'
import { autoTable, CellDef, Color, RowInput, Styles } from 'jspdf-autotable'
import { getApiUrl, getFetcher } from '@/app/api/globalFetcher'
import { format as formatDateFn } from 'date-fns'

/* ── Company info (same endpoint as CompanyInfoHeader) ── */

export interface VectorPdfCompanyInfo {
  businessName: string
  address1: string
  address2: string
}

/* Fetched once per session — every report page needs the same block */
let companyInfoCache: VectorPdfCompanyInfo | null = null

async function fetchCompanyInfo(): Promise<VectorPdfCompanyInfo | null> {
  if (companyInfoCache) return companyInfoCache
  try {
    const data = (await getFetcher(getApiUrl('/api/CompanyInfo/WOLogo'))) as Record<
      string,
      unknown
    >
    companyInfoCache = {
      businessName: String(data?.tbbiBusinessName ?? ''),
      address1: String(data?.tbbi_Address1 ?? ''),
      address2: String(data?.tbbi_Address2 ?? ''),
    }
  } catch {
    /* Header block is cosmetic — a failed fetch must not block the report */
    return null
  }
  return companyInfoCache
}

/* ── Table description passed in by each report page ── */

export interface VectorPdfTableSpec {
  /** Header row(s) of the table */
  head: RowInput[]
  /** Body rows — cells are plain strings, numbers or `{ content, colSpan, styles }` wrappers */
  body: RowInput[]
  /** Per-column style overrides (width / alignment), keyed by column index */
  columnStyles?: { [key: string]: Partial<Styles> }
}

export interface VectorPdfOptions {
  /** Report title, printed centered under the company block (e.g. "CHECK REGISTER") */
  title: string
  /** Italic-ish detail line under the title, e.g. "From: 2025-10-01 | To: 2026-11-04 | Category: allgemein" */
  subtitle?: string
  table: VectorPdfTableSpec
}

/* ── Palette (matches the print layout's tailwind slate colors) ── */

const INK = [15, 23, 42] as const // slate-900
const MUTED = [100, 116, 139] as const // slate-500
const BAR_FROM = [37, 99, 235] as const // blue-600
const BAR_TO = [96, 165, 250] as const // blue-400
const HEAD_FILL = [241, 245, 249] as const // slate-100
const BORDER = [203, 213, 225] as const // slate-300
const BOX_FILL = [248, 250, 252] as const // slate-50
const BOX_BORDER = [226, 232, 240] as const // slate-200

/** Letter page geometry: 612 × 792 pt with 30 pt side margins */
const MARGIN_X = 30
const CONTENT_W = 612 - MARGIN_X * 2

/**
 * Draw the blue gradient bar (`bg-gradient-to-r from-blue-600 to-blue-400`).
 * Interpolated thin slices — visually indistinguishable at 5 pt height.
 */
function drawGradientBar(pdf: jsPDF, x: number, y: number, w: number, h: number): void {
  const STEPS = 40
  const sliceW = w / STEPS
  for (let i = 0; i < STEPS; i++) {
    const t = i / (STEPS - 1)
    const r = Math.round(BAR_FROM[0] + (BAR_TO[0] - BAR_FROM[0]) * t)
    const g = Math.round(BAR_FROM[1] + (BAR_TO[1] - BAR_FROM[1]) * t)
    const b = Math.round(BAR_FROM[2] + (BAR_TO[2] - BAR_FROM[2]) * t)
    pdf.setFillColor(r, g, b)
    pdf.rect(x + i * sliceW, y, sliceW + 0.2, h, 'F')
  }
}

/**
 * Draw the company block: gradient bar over a rounded light box with the
 * business name and its two address lines, all centered. Returns the
 * bottom y coordinate for the caller.
 */
function drawCompanyHeader(pdf: jsPDF, company: VectorPdfCompanyInfo): number {
  const y = 26
  const barH = 5
  const padY = 14

  /* Box: name line plus each present address line, padded above and below */
  const nameFont = 15
  const addrFont = 8.5
  const linesH = (company.address1 ? 11 : 0) + (company.address2 ? 11 : 0)
  const boxH = padY + nameFont + 4 + (company.address1 || company.address2 ? linesH : -12) + padY

  const cx = MARGIN_X + CONTENT_W / 2

  pdf.setFillColor(BOX_FILL[0], BOX_FILL[1], BOX_FILL[2])
  pdf.setDrawColor(BOX_BORDER[0], BOX_BORDER[1], BOX_BORDER[2])
  pdf.setLineWidth(0.75)
  pdf.roundedRect(MARGIN_X, y, CONTENT_W, barH + boxH, 3, 3, 'FD')

  drawGradientBar(pdf, MARGIN_X, y, CONTENT_W, barH)

  let cy = y + barH + padY + nameFont
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(nameFont)
  pdf.setTextColor(INK[0], INK[1], INK[2])
  pdf.text(company.businessName, cx, cy, { align: 'center' })

  cy += 11
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(addrFont)
  pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2])
  if (company.address1) {
    pdf.text(company.address1, cx, cy, { align: 'center' })
    cy += 11
  }
  if (company.address2) {
    pdf.text(company.address2, cx, cy, { align: 'center' })
    cy += 11
  }

  return y + barH + boxH
}

/**
 * Build the full report PDF:
 * company block → centered title → optional bold date line → auto table
 * (auto pagination with a repeated header row, row-safe page breaks)
 * → "Print Date & Time" footer pinned to the bottom of every page.
 */
export async function buildVectorReportPdf(options: VectorPdfOptions): Promise<jsPDF | null> {
  const company = await fetchCompanyInfo()

  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })

  /* ── Company block ── */
  let y = 26
  if (company && company.businessName) {
    y = drawCompanyHeader(pdf, company)
  }

  /* ── Title ── */
  y += 26
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13.5)
  pdf.setTextColor(INK[0], INK[1], INK[2])
  pdf.text(options.title.toUpperCase(), MARGIN_X + CONTENT_W / 2, y, { align: 'center' })

  /* ── Subtitle line (From / To, category, etc.) ── */
  if (options.subtitle) {
    y += 20
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9.5)
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2])
    pdf.text(options.subtitle, MARGIN_X + CONTENT_W / 2, y, { align: 'center' })
    y += 6
  }
  y += 18

  /* ── Table ── */
  const printStamp = `${formatDateFn(new Date(), 'dd-MMM-yyyy')}    ${formatDateFn(new Date(), 'H:mm')}`
  const pageH = pdf.internal.pageSize.getHeight()

  autoTable(pdf, {
    head: options.table.head,
    body: options.table.body,
    columnStyles: options.table.columnStyles,
    startY: y,
    margin: { left: MARGIN_X, right: MARGIN_X, bottom: 44 },
    theme: 'grid',
    /* Single-line rows are protected from straddling a page edge; tall
       note/wrap rows also move whole instead of being sliced in half. */
    rowPageBreak: 'avoid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      textColor: [INK[0], INK[1], INK[2]],
      lineColor: [BORDER[0], BORDER[1], BORDER[2]],
      lineWidth: 0.75,
      cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
    },
    headStyles: {
      fontStyle: 'bold',
      fillColor: [HEAD_FILL[0], HEAD_FILL[1], HEAD_FILL[2]],
      textColor: [INK[0], INK[1], INK[2]],
      lineWidth: 0.75,
    },
    /* Print Date & Time footer on every page, as in the legacy reports */
    didDrawPage: () => {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2])
      pdf.text('Print Date & Time:', MARGIN_X, pageH - 26)
      pdf.setFont('helvetica', 'bold')
      pdf.text(printStamp, MARGIN_X + 62, pageH - 26)
    },
  })

  return pdf
}

/* ═══════════════════════════════════════════════════════════
   DOM TABLE → SPEC CONVERTER

   Most report pages already render a hidden print `<table>`
   (the same node the browser Ctrl+P path uses). This converter
   reads that live node — cell text, col/row spans, bold weight,
   right/left alignment, slate row fills and per-column widths —
   so a report page can migrate to vector PDFs without
   re-describing its layout, and the PDF always matches what
   the print view would produce. `getComputedStyle`/rects work
   on the offscreen node because it is laid out (absolutely
   positioned, not `display: none`).
   ═══════════════════════════════════════════════════════════ */

/**
 * `rgb(241, 245, 249)`-style computed color → autotable fill
 * (white/transparent skipped). Transparent cells compute as
 * `rgba(0, 0, 0, 0)` — the alpha MUST be read, otherwise every
 * unfilled cell would be painted black. Semi-transparent fills
 * are blended against the white page so e.g. `bg-white/60`
 * doesn't come out too dark.
 */
function fillFromComputedColor(color: string): Color | undefined {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:\s*,\s*([\d.]+))?\)/)
  if (!match) return undefined
  const r = Number(match[1])
  const g = Number(match[2])
  const b = Number(match[3])
  const alpha = match[4] === undefined ? 1 : Number(match[4])
  if (alpha < 0.05) return undefined // fully transparent (the default background)
  if (r > 250 && g > 250 && b > 250) return undefined // white / nearly white
  if (alpha < 1) {
    /* Blend onto the white page: c' = c·a + 255·(1−a) */
    const blend = (c: number): number => Math.round(c * alpha + 255 * (1 - alpha))
    return [blend(r), blend(g), blend(b)]
  }
  return [r, g, b]
}

/** Read one `<td>`/`<th>` into an autotable cell (text, spans, style) */
function cellToDef(cell: HTMLTableCellElement): CellDef {
  const computed = getComputedStyle(cell)

  /* Block children (meta/notes divs) preserve their line breaks */
  const blocks = Array.from(cell.children)
  const text = blocks.length
    ? blocks.map((el) => el.textContent?.replace(/\u00a0/g, ' ').trim() ?? '').filter(Boolean).join('\n')
    : cell.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''

  const styles: Partial<Styles> = {
    halign:
      computed.textAlign === 'right' || computed.textAlign === 'end'
        ? 'right'
        : computed.textAlign === 'center'
          ? 'center'
          : 'left',
  }

  /* font-bold / font-semibold (≥600) render bold; font-medium stays normal */
  const weight = Number(computed.fontWeight) || 400
  if (weight >= 600) styles.fontStyle = 'bold'

  const fill = fillFromComputedColor(computed.backgroundColor)
  if (fill) styles.fillColor = fill

  return {
    content: text,
    colSpan: cell.colSpan > 1 ? cell.colSpan : undefined,
    rowSpan: cell.rowSpan > 1 ? cell.rowSpan : undefined,
    styles,
  }
}

/**
 * Convert a hidden print `<table>` into a `VectorPdfTableSpec`.
 * Column widths are measured from the first row (816px-wide node)
 * and scaled onto the PDF content width so proportions match.
 */
export function specFromTable(table: HTMLTableElement): VectorPdfTableSpec {
  const head = table.tHead ? Array.from(table.tHead.rows).map((row) => Array.from(row.cells).map(cellToDef)) : []
  const body = Array.from(table.tBodies)
    .flatMap((tbody) => Array.from(tbody.rows))
    .map((row) => Array.from(row.cells).map(cellToDef))
  /* Totals footers append after the body so they print on the final page */
  const foot = table.tFoot ? Array.from(table.tFoot.rows).map((row) => Array.from(row.cells).map(cellToDef)) : []

  const columnStyles: VectorPdfTableSpec['columnStyles'] = {}
  const firstRow = table.rows.item(0)
  if (firstRow) {
    /* Spread any colspanning measure cell equally across its columns */
    const widthsPx: number[] = []
    Array.from(firstRow.cells).forEach((cell) => {
      const share = cell.getBoundingClientRect().width / cell.colSpan
      for (let i = 0; i < cell.colSpan; i++) widthsPx.push(share)
    })
    const totalPx = widthsPx.reduce((sum, w) => sum + w, 0)
    if (totalPx > 0 && widthsPx.length > 0) {
      widthsPx.forEach((wPx, i) => {
        columnStyles[i] = { cellWidth: Math.max((wPx / totalPx) * CONTENT_W, 4) }
      })
    }
  }

  return { head, body: [...body, ...foot], columnStyles }
}
