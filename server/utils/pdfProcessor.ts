import { PDFDocument, PDFPage } from 'pdf-lib';
import * as pdfParseModule from 'pdf-parse';
import PDFKit from 'pdfkit';
import sharp from 'sharp';
import { Readable } from 'stream';

const pdfParse = (pdfParseModule as any).default || pdfParseModule;

/**
 * PDF Processing Utilities
 * Handles all PDF manipulation operations
 */

/**
 * Merge multiple PDF buffers into a single PDF
 */
export async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const pdfBuffer of pdfBuffers) {
    try {
      const pdf = await PDFDocument.load(pdfBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    } catch (error) {
      console.error('Error merging PDF:', error);
      throw new Error('Failed to merge PDFs');
    }
  }

  return Buffer.from(await mergedPdf.save());
}

/**
 * Split a PDF and extract specific pages
 */
export async function splitPDF(
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
    console.error('Error splitting PDF:', error);
    throw new Error('Failed to split PDF');
  }
}

/**
 * Extract text from PDF
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer as any);
    return (data as any).text;
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Get PDF metadata (page count, dimensions, etc.)
 */
export async function getPDFMetadata(
  pdfBuffer: Buffer
): Promise<{
  pageCount: number;
  width?: number;
  height?: number;
  title?: string;
  author?: string;
}> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);
    const pages = pdf.getPages();
    const firstPage = pages[0];

    return {
      pageCount: pdf.getPageCount(),
      width: firstPage?.getWidth(),
      height: firstPage?.getHeight(),
      title: pdf.getTitle(),
      author: pdf.getAuthor(),
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    throw new Error('Failed to get PDF metadata');
  }
}

/**
 * Convert PDF pages to images (PNG or JPG)
 * Note: This requires additional dependencies like pdf2image or similar
 * For now, this is a placeholder that would need pdf2image or similar library
 */
export async function convertPDFToImages(
  pdfBuffer: Buffer,
  format: 'jpg' | 'png' = 'jpg',
  quality: number = 85
): Promise<Buffer[]> {
  // This would require pdf2image or similar library
  // For now, returning placeholder
  console.warn('PDF to images conversion requires pdf2image library');
  return [];
}

/**
 * Create PDF from images
 */
export async function createPDFFromImages(
  imageBuffers: Buffer[],
  imageFormats: string[] = []
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFKit();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      for (let i = 0; i < imageBuffers.length; i++) {
        if (i > 0) {
          doc.addPage();
        }

        const format = imageFormats[i] || 'image/jpeg';
        const imageBuffer = imageBuffers[i];

        // Add image to PDF
        doc.image(imageBuffer, 0, 0, {
          fit: [doc.page.width, doc.page.height],
        });
      }

      doc.end();
    } catch (error) {
      console.error('Error creating PDF from images:', error);
      reject(new Error('Failed to create PDF from images'));
    }
  });
}

/**
 * Compress PDF (basic implementation)
 * Note: For production, use ghostscript or similar for better compression
 */
export async function compressPDF(
  pdfBuffer: Buffer,
  quality: 'high' | 'medium' | 'low' = 'medium'
): Promise<Buffer> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);

    // Basic compression by removing unnecessary data
    // For production, integrate ghostscript or similar
    const compressed = await pdf.save({
      useObjectStreams: true,
    });

    return Buffer.from(compressed);
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('Failed to compress PDF');
  }
}

/**
 * Convert PDF to DOCX
 * Note: This requires additional library like pdf2docx or similar
 * For now, this is a placeholder
 */
export async function convertPDFToDocx(pdfBuffer: Buffer): Promise<Buffer> {
  // This would require pdf2docx or similar library
  console.warn('PDF to DOCX conversion requires external library');
  return pdfBuffer;
}

/**
 * Validate PDF file
 */
export async function validatePDF(pdfBuffer: Buffer): Promise<boolean> {
  try {
    await PDFDocument.load(pdfBuffer);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get PDF file size in bytes
 */
export function getPDFSize(pdfBuffer: Buffer): number {
  return pdfBuffer.length;
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
