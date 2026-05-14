import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const pdfConversions = mysqlTable("pdfConversions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  toolType: varchar("toolType", { length: 50 }).notNull(), // 'merge', 'split', 'compress', etc.
  inputFileName: varchar("inputFileName", { length: 255 }),
  outputFileName: varchar("outputFileName", { length: 255 }),
  inputSize: int("inputSize"),
  outputSize: int("outputSize"),
  status: varchar("status", { length: 20 }).default("completed"), // 'pending', 'completed', 'failed'
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PDFConversion = typeof pdfConversions.$inferSelect;
export type InsertPDFConversion = typeof pdfConversions.$inferInsert;

export const chatHistory = mysqlTable("chatHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pdfFileName: varchar("pdfFileName", { length: 255 }),
  pdfContent: text("pdfContent"), // Extracted text from PDF
  messages: text("messages"), // JSON array of {role, content} objects
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = typeof chatHistory.$inferInsert;