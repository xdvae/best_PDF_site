import { PDFDocument, PDFPage } from 'pdf-lib';

/**
 * PDF Editor Utilities
 * Handles PDF page manipulation (reorder, delete, insert, rotate)
 */

export interface PageOperation {
  type: 'reorder' | 'delete' | 'insert' | 'rotate';
  pageIndex?: number;
  newIndex?: number;
  angle?: number; // 0, 90, 180, 270
  insertAfterPage?: number;
}

/**
 * Reorder PDF pages
 */
export async function reorderPDFPages(
  pdfBuffer: Buffer,
  newOrder: number[]
): Promise<Buffer> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);
    const newPdf = await PDFDocument.create();

    for (const index of newOrder) {
      if (index >= 0 && index < pdf.getPageCount()) {
        const [copiedPage] = await newPdf.copyPages(pdf, [index]);
        newPdf.addPage(copiedPage);
      }
    }

    return Buffer.from(await newPdf.save());
  } catch (error) {
    console.error('Error reordering PDF pages:', error);
    throw new Error('Failed to reorder PDF pages');
  }
}

/**
 * Delete pages from PDF
 */
export async function deletePDFPages(
  pdfBuffer: Buffer,
  pageIndices: number[]
): Promise<Buffer> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);
    const newPdf = await PDFDocument.create();

    // Create set of indices to delete for O(1) lookup
    const indicesToDelete = new Set(pageIndices);

    // Copy all pages except those to delete
    for (let i = 0; i < pdf.getPageCount(); i++) {
      if (!indicesToDelete.has(i)) {
        const [copiedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copiedPage);
      }
    }

    return Buffer.from(await newPdf.save());
  } catch (error) {
    console.error('Error deleting PDF pages:', error);
    throw new Error('Failed to delete PDF pages');
  }
}

/**
 * Rotate PDF pages
 */
export async function rotatePDFPages(
  pdfBuffer: Buffer,
  pageIndices: number[],
  angle: number
): Promise<Buffer> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);
    const indicesToRotate = new Set(pageIndices);

    // Normalize angle to 0, 90, 180, 270
    const normalizedAngle = ((angle % 360) + 360) % 360;

    for (let i = 0; i < pdf.getPageCount(); i++) {
      if (indicesToRotate.has(i)) {
        const page = pdf.getPage(i);
        // Rotate page by the specified angle
        (page as any).rotate(normalizedAngle);
      }
    }

    return Buffer.from(await pdf.save());
  } catch (error) {
    console.error('Error rotating PDF pages:', error);
    throw new Error('Failed to rotate PDF pages');
  }
}

/**
 * Insert blank pages into PDF
 */
export async function insertBlankPages(
  pdfBuffer: Buffer,
  insertPositions: Array<{ after: number; count: number }>
): Promise<Buffer> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);
    const newPdf = await PDFDocument.create();

    let insertIndex = 0;
    const sortedPositions = insertPositions.sort((a, b) => a.after - b.after);

    for (let i = 0; i < pdf.getPageCount(); i++) {
      const [copiedPage] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copiedPage);

      // Check if we need to insert blank pages after this page
      const position = sortedPositions[insertIndex];
      if (position && position.after === i) {
        for (let j = 0; j < position.count; j++) {
          newPdf.addPage();
        }
        insertIndex++;
      }
    }

    return Buffer.from(await newPdf.save());
  } catch (error) {
    console.error('Error inserting blank pages:', error);
    throw new Error('Failed to insert blank pages');
  }
}

/**
 * Extract specific pages and create new PDF
 */
export async function extractPages(
  pdfBuffer: Buffer,
  pageIndices: number[]
): Promise<Buffer> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);
    const newPdf = await PDFDocument.create();

    for (const index of pageIndices) {
      if (index >= 0 && index < pdf.getPageCount()) {
        const [copiedPage] = await newPdf.copyPages(pdf, [index]);
        newPdf.addPage(copiedPage);
      }
    }

    return Buffer.from(await newPdf.save());
  } catch (error) {
    console.error('Error extracting pages:', error);
    throw new Error('Failed to extract pages');
  }
}

/**
 * Get page count and dimensions
 */
export async function getPDFPageInfo(pdfBuffer: Buffer): Promise<
  Array<{
    index: number;
    width: number;
    height: number;
    rotation: number;
  }>
> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);
    const pages = pdf.getPages();

    return pages.map((page, index) => ({
      index,
      width: page.getWidth(),
      height: page.getHeight(),
      rotation: page.getRotation().angle || 0,
    }));
  } catch (error) {
    console.error('Error getting PDF page info:', error);
    throw new Error('Failed to get PDF page info');
  }
}

/**
 * Duplicate pages in PDF
 */
export async function duplicatePages(
  pdfBuffer: Buffer,
  pageIndices: number[]
): Promise<Buffer> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);
    const newPdf = await PDFDocument.create();
    const indicesToDuplicate = new Set(pageIndices);

    // Copy all pages, duplicating specified ones
    for (let i = 0; i < pdf.getPageCount(); i++) {
      const [copiedPage] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copiedPage);

      // Add duplicate if this page is marked for duplication
      if (indicesToDuplicate.has(i)) {
        const [duplicatedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(duplicatedPage);
      }
    }

    return Buffer.from(await newPdf.save());
  } catch (error) {
    console.error('Error duplicating pages:', error);
    throw new Error('Failed to duplicate pages');
  }
}
