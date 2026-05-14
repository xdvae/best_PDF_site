import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import {
  mergePDFs,
  splitPDF,
  compressPDF,
  extractTextFromPDF,
  getPDFMetadata,
  createPDFFromImages,
  validatePDF,
  getPDFSize,
  getCompressionRatio,
} from '../utils/pdfProcessor';
import { storagePut } from '../storage';

export const pdfToolsRouter = router({
  /**
   * Merge multiple PDFs into one
   */
  mergePDF: publicProcedure
    .input(
      z.object({
        fileBuffers: z.array(z.string()),
        fileNames: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffers = input.fileBuffers.map((b64) => Buffer.from(b64, 'base64'));

        for (const buffer of pdfBuffers) {
          const isValid = await validatePDF(buffer);
          if (!isValid) {
            throw new Error('One or more files are not valid PDFs');
          }
        }

        const mergedBuffer = await mergePDFs(pdfBuffers);
        const fileName = `merged-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/merged/${fileName}`,
          mergedBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          size: getPDFSize(mergedBuffer),
        };
      } catch (error) {
        console.error('Merge PDF error:', error);
        throw new Error(`Failed to merge PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Split PDF and extract specific pages
   */
  splitPDF: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
        fileName: z.string(),
        pageIndices: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) {
          throw new Error('Invalid PDF file');
        }

        const splitBuffer = await splitPDF(pdfBuffer, input.pageIndices);
        const fileName = `split-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/split/${fileName}`,
          splitBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          size: getPDFSize(splitBuffer),
          pagesExtracted: input.pageIndices.length,
        };
      } catch (error) {
        console.error('Split PDF error:', error);
        throw new Error(`Failed to split PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Compress PDF
   */
  compressPDF: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
        fileName: z.string(),
        quality: z.enum(['low', 'medium', 'high']).default('medium'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const originalSize = getPDFSize(pdfBuffer);

        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) {
          throw new Error('Invalid PDF file');
        }

        const compressedBuffer = await compressPDF(pdfBuffer, input.quality);
        const compressedSize = getPDFSize(compressedBuffer);

        const fileName = `compressed-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/compressed/${fileName}`,
          compressedBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          originalSize,
          compressedSize,
          compressionRatio: getCompressionRatio(originalSize, compressedSize),
        };
      } catch (error) {
        console.error('Compress PDF error:', error);
        throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Extract text from PDF
   */
  extractText: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) {
          throw new Error('Invalid PDF file');
        }

        const text = await extractTextFromPDF(pdfBuffer);
        const textFileName = `extracted-${Date.now()}.txt`;
        const { url, key } = await storagePut(
          `pdfs/text/${textFileName}`,
          Buffer.from(text, 'utf-8'),
          'text/plain'
        );

        return {
          success: true,
          text,
          fileName: textFileName,
          url,
          key,
          characterCount: text.length,
        };
      } catch (error) {
        console.error('Extract text error:', error);
        throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Get PDF metadata
   */
  getPDFMetadata: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) {
          throw new Error('Invalid PDF file');
        }

        const metadata = await getPDFMetadata(pdfBuffer);
        return {
          success: true,
          ...metadata,
          fileSize: getPDFSize(pdfBuffer),
        };
      } catch (error) {
        console.error('Get PDF metadata error:', error);
        throw new Error(`Failed to get PDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Create PDF from images
   */
  createPDFFromImages: publicProcedure
    .input(
      z.object({
        imageBuffers: z.array(z.string()),
        imageFormats: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const imageBuffers = input.imageBuffers.map((b64) => Buffer.from(b64, 'base64'));
        const pdfBuffer = await createPDFFromImages(imageBuffers, input.imageFormats);

        const fileName = `from-images-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/from-images/${fileName}`,
          pdfBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          size: getPDFSize(pdfBuffer),
          imageCount: imageBuffers.length,
        };
      } catch (error) {
        console.error('Create PDF from images error:', error);
        throw new Error(`Failed to create PDF from images: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Validate PDF file
   */
  validatePDFFile: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);

        return {
          success: true,
          isValid,
          size: getPDFSize(pdfBuffer),
        };
      } catch (error) {
        console.error('Validate PDF error:', error);
        return {
          success: false,
          isValid: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
});
