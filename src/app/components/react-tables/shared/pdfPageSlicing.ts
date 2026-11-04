import jsPDF from 'jspdf'

/* ═══════════════════════════════════════════════════════════
   Shared multi-page PDF helper for screenshot-based printing.

   Page cuts are aligned to table-row boundaries so no row is
   cropped in half between pages, and a cut never orphans a
   group-header row (`.pdf-group-header`) or a detail row
   (`.pdf-detail-row`) from the row it belongs to.
   ═══════════════════════════════════════════════════════════ */

/** A cut must leave at least this much content on the page */
const MIN_SLICE_PX = 40

/**
 * Draw a tall element screenshot into `pdf` page by page.
 *
 * Single-page images are drawn in one piece. Taller images are sliced into
 * per-page canvases (jsPDF does not reliably render images with negative y
 * offsets — slices beyond page 1 would come out blank), with every cut aligned
 * to a `<tr>` boundary measured from `clone` (the element that was screenshotted,
 * still mounted in the DOM; CSS px map 1:1 to screenshot px because pixelRatio
 * is 1).
 */
export async function sliceTallImageIntoPdfPages(
  pdf: jsPDF,
  dataUrl: string,
  clone: HTMLElement
): Promise<void> {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgProps = pdf.getImageProperties(dataUrl)
  const pdfHeight = (imgProps.height / imgProps.width) * pageWidth

  if (pdfHeight <= pageHeight) {
    pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pdfHeight)
    return
  }

  /* Multi-page: slice the tall screenshot into per-page canvases. */
  const img = new Image()
  img.src = dataUrl
  await img.decode()

  /* Measure table-row bottoms inside the still-mounted clone */
  const cloneRect = clone.getBoundingClientRect()
  const rowLines = Array.from(clone.querySelectorAll('tr'))
    .map((tr) => ({
      bottom: Math.floor(tr.getBoundingClientRect().bottom - cloneRect.top),
      isGroupHeader: tr.classList.contains('pdf-group-header'),
      isDetailRow: tr.classList.contains('pdf-detail-row'),
    }))
    .filter((line) => line.bottom > 0)

  const sliceHeightPx = Math.floor(pageHeight * (imgProps.width / pageWidth))
  let rendered = 0
  let isFirstPage = true
  while (rendered < imgProps.height) {
    let sliceH = Math.min(sliceHeightPx, imgProps.height - rendered)

    /* Not the final page → move the cut up to the closest row bottom */
    if (rendered + sliceH < imgProps.height) {
      let cutIndex = -1
      for (let i = rowLines.length - 1; i >= 0; i--) {
        const candidate = i > 0 && rowLines[i].isGroupHeader ? i - 1 : i
        if (rowLines[candidate].bottom <= rendered + sliceH) {
          /* A main row must not be separated from its detail row */
          if (candidate > 0 && rowLines[candidate + 1]?.isDetailRow) {
            cutIndex = candidate - 1
          } else {
            cutIndex = candidate
          }
          break
        }
      }
      const boundaryH = cutIndex >= 0 ? rowLines[cutIndex].bottom - rendered : 0
      if (boundaryH >= MIN_SLICE_PX) {
        sliceH = boundaryH
      }
    }

    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width = imgProps.width
    sliceCanvas.height = sliceH
    const ctx = sliceCanvas.getContext('2d')
    if (!ctx) break
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
    ctx.drawImage(img, 0, rendered, imgProps.width, sliceH, 0, 0, imgProps.width, sliceH)

    if (!isFirstPage) pdf.addPage()
    const slicePdfHeight = (sliceH / imgProps.width) * pageWidth
    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, slicePdfHeight)
    rendered += sliceH
    isFirstPage = false
  }
}
