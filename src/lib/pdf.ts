import { PDFDocument } from 'pdf-lib'

/** Splits a PDF into small page ranges so each Gemini call stays under output limits. */
export async function splitPdf(
  bytes: Uint8Array,
  pagesPerChunk = 5,
): Promise<{ chunks: Uint8Array[]; pageCount: number }> {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const pageCount = source.getPageCount()
  if (pageCount === 0) throw new Error('This PDF has no pages.')

  const chunks: Uint8Array[] = []
  for (let start = 0; start < pageCount; start += pagesPerChunk) {
    const end = Math.min(start + pagesPerChunk, pageCount)
    const document = await PDFDocument.create()
    const copied = await document.copyPages(
      source,
      Array.from({ length: end - start }, (_, index) => start + index),
    )
    for (const page of copied) document.addPage(page)
    chunks.push(await document.save())
  }
  return { chunks, pageCount }
}

export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const batchSize = 8192
  for (let index = 0; index < bytes.length; index += batchSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + batchSize))
  }
  return btoa(binary)
}
