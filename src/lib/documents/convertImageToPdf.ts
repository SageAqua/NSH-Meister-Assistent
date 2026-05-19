import { PDFDocument } from "pdf-lib"

export async function convertImageToPdf(file: File): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)

  const mimeType = file.type.toLowerCase()

  let image
  if (mimeType === "image/png") {
    image = await pdfDoc.embedPng(bytes)
  } else {
    // jpeg, webp, heic — treat as jpeg for embedding
    image = await pdfDoc.embedJpg(bytes)
  }

  // A4 dimensions in points (72pt = 1 inch)
  const A4_WIDTH = 595.28
  const A4_HEIGHT = 841.89

  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT])
  const { width: imgW, height: imgH } = image

  // Scale to fit A4 with 20pt margin
  const margin = 20
  const maxW = A4_WIDTH - margin * 2
  const maxH = A4_HEIGHT - margin * 2
  const scale = Math.min(maxW / imgW, maxH / imgH)
  const drawW = imgW * scale
  const drawH = imgH * scale
  const x = (A4_WIDTH - drawW) / 2
  const y = (A4_HEIGHT - drawH) / 2

  page.drawImage(image, { x, y, width: drawW, height: drawH })

  return pdfDoc.save()
}
