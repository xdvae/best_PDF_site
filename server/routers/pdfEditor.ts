import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import {
  reorderPDFPages,
  deletePDFPages,
  rotatePDFPages,
  insertBlankPages,
  extractPages,
  getPDFPageInfo,
  duplicatePages,
} from '../utils/pdfEditor';
import { validatePDF, getPDFSize } from '../utils/pdfProcessor';
import { storagePut } from '../storage';

export const pdfEditorRouter = router({
  /**
   * Reorder PDF pages
   */
  reorderPages: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
        newOrder: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) throw new Error('Invalid PDF file');

        const reorderedBuffer = await reorderPDFPages(pdfBuffer, input.newOrder);
        const fileName = `reordered-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/edited/${fileName}`,
          reorderedBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          size: getPDFSize(reorderedBuffer),
        };
      } catch (error) {
        console.error('Reorder pages error:', error);
        throw new Error(
          `Failed to reorder pages: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  /**
   * Delete pages from PDF
   */
  deletePages: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
        pageIndices: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) throw new Error('Invalid PDF file');

        const editedBuffer = await deletePDFPages(pdfBuffer, input.pageIndices);
        const fileName = `edited-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/edited/${fileName}`,
          editedBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          size: getPDFSize(editedBuffer),
          pagesDeleted: input.pageIndices.length,
        };
      } catch (error) {
        console.error('Delete pages error:', error);
        throw new Error(
          `Failed to delete pages: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  /**
   * Rotate pages in PDF
   */
  rotatePages: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
        pageIndices: z.array(z.number()),
        angle: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) throw new Error('Invalid PDF file');

        const rotatedBuffer = await rotatePDFPages(
          pdfBuffer,
          input.pageIndices,
          input.angle
        );
        const fileName = `rotated-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/edited/${fileName}`,
          rotatedBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          size: getPDFSize(rotatedBuffer),
          angle: input.angle,
          pagesRotated: input.pageIndices.length,
        };
      } catch (error) {
        console.error('Rotate pages error:', error);
        throw new Error(
          `Failed to rotate pages: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  /**
   * Insert blank pages into PDF
   */
  insertBlankPages: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
        insertPositions: z.array(
          z.object({
            after: z.number(),
            count: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) throw new Error('Invalid PDF file');

        const editedBuffer = await insertBlankPages(
          pdfBuffer,
          input.insertPositions
        );
        const fileName = `with-blanks-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/edited/${fileName}`,
          editedBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          size: getPDFSize(editedBuffer),
          blankPagesAdded: input.insertPositions.reduce(
            (sum, pos) => sum + pos.count,
            0
          ),
        };
      } catch (error) {
        console.error('Insert blank pages error:', error);
        throw new Error(
          `Failed to insert blank pages: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  /**
   * Extract specific pages from PDF
   */
  extractPages: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
        pageIndices: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) throw new Error('Invalid PDF file');

        const extractedBuffer = await extractPages(
          pdfBuffer,
          input.pageIndices
        );
        const fileName = `extracted-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/edited/${fileName}`,
          extractedBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          size: getPDFSize(extractedBuffer),
          pagesExtracted: input.pageIndices.length,
        };
      } catch (error) {
        console.error('Extract pages error:', error);
        throw new Error(
          `Failed to extract pages: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  /**
   * Get page information from PDF
   */
  getPageInfo: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) throw new Error('Invalid PDF file');

        const pageInfo = await getPDFPageInfo(pdfBuffer);

        return {
          success: true,
          pages: pageInfo,
          totalPages: pageInfo.length,
        };
      } catch (error) {
        console.error('Get page info error:', error);
        throw new Error(
          `Failed to get page info: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  /**
   * Duplicate pages in PDF
   */
  duplicatePages: publicProcedure
    .input(
      z.object({
        fileBuffer: z.string(),
        pageIndices: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const pdfBuffer = Buffer.from(input.fileBuffer, 'base64');
        const isValid = await validatePDF(pdfBuffer);
        if (!isValid) throw new Error('Invalid PDF file');

        const duplicatedBuffer = await duplicatePages(
          pdfBuffer,
          input.pageIndices
        );
        const fileName = `duplicated-${Date.now()}.pdf`;
        const { url, key } = await storagePut(
          `pdfs/edited/${fileName}`,
          duplicatedBuffer,
          'application/pdf'
        );

        return {
          success: true,
          fileName,
          url,
          key,
          size: getPDFSize(duplicatedBuffer),
          pagesDuplicated: input.pageIndices.length,
        };
      } catch (error) {
        console.error('Duplicate pages error:', error);
        throw new Error(
          `Failed to duplicate pages: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),
});
