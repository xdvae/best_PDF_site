import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { chatHistory, InsertChatHistory } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * AI Chat Router
 * Handles PDF summarization and multi-turn conversations
 */
export const aiChatRouter = router({
  /**
   * Upload a PDF and extract text for AI processing
   */
  uploadPDF: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        pdfContent: z.string(), // Base64 encoded or extracted text
      })
    )
    .mutation(async ({ input }) => {
      try {
        // TODO: Extract text from PDF file
        // For now, we'll assume pdfContent is already extracted text

        return {
          success: true,
          message: "PDF uploaded successfully",
          contentPreview: input.pdfContent.substring(0, 200) + "...",
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to upload PDF",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Send a message and get AI response about the PDF
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        pdfContent: z.string(), // The extracted PDF content
        message: z.string(), // User's question or request
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Build the conversation with context
        const messages = [
          {
            role: "system" as const,
            content: `You are a helpful PDF assistant. The user has uploaded a PDF document. Here is the content:\n\n${input.pdfContent}\n\nPlease help the user by answering questions about this document, providing summaries, or extracting information as requested.`,
          },
          ...(input.conversationHistory || []),
          {
            role: "user" as const,
            content: input.message,
          },
        ];

        // Call the LLM
        const response = await invokeLLM({
          messages: messages as any,
        });

        const assistantMessage = response.choices[0]?.message?.content || "I couldn't generate a response.";

        return {
          success: true,
          response: assistantMessage,
          updatedHistory: [
            ...(input.conversationHistory || []),
            { role: "user" as const, content: input.message },
            { role: "assistant" as const, content: assistantMessage },
          ],
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to get AI response",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get AI summary of a PDF
   */
  summarizePDF: publicProcedure
    .input(
      z.object({
        pdfContent: z.string(),
        summaryLength: z.enum(["short", "medium", "long"]).default("medium"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const lengthGuide = {
          short: "2-3 sentences",
          medium: "1 paragraph",
          long: "2-3 paragraphs",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a document summarization expert. Provide clear, concise summaries.",
            },
            {
              role: "user",
              content: `Please summarize the following PDF content in ${lengthGuide[input.summaryLength]}:\n\n${input.pdfContent}`,
            },
          ],
        });

        const summary = response.choices[0]?.message?.content || "Could not generate summary.";

        return {
          success: true,
          summary: summary,
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to summarize PDF",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Save chat history for authenticated users
   */
  saveChatHistory: protectedProcedure
    .input(
      z.object({
        pdfFileName: z.string(),
        pdfContent: z.string(),
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            success: false,
            message: "Database not available",
          };
        }

        const chatRecord: InsertChatHistory = {
          userId: ctx.user.id,
          pdfFileName: input.pdfFileName,
          pdfContent: input.pdfContent,
          messages: JSON.stringify(input.messages),
        };

        await db.insert(chatHistory).values(chatRecord);

        return {
          success: true,
          message: "Chat history saved",
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to save chat history",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get saved chat histories for authenticated user
   */
  getChatHistories: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          histories: [],
          message: "Database not available",
        };
      }

      const histories = await db
        .select()
        .from(chatHistory)
        .where(eq(chatHistory.userId, ctx.user.id));

      return {
        success: true,
        histories: histories.map((h) => ({
          ...h,
          messages: JSON.parse(h.messages || "[]"),
        })),
      };
    } catch (error) {
      return {
        success: false,
        histories: [],
        message: "Failed to retrieve chat histories",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),
});
