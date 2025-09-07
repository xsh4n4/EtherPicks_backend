import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lotteryRounds = pgTable("lottery_rounds", {
  id: serial("id").primaryKey(),
  roundNumber: integer("round_number").notNull(),
  prizePool: decimal("prize_pool", { precision: 18, scale: 8 }).notNull(),
  winner: text("winner"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  roundId: integer("round_id").notNull(),
  entryCount: integer("entry_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const winners = pgTable("winners", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  roundNumber: integer("round_number").notNull(),
  prizeAmount: decimal("prize_amount", { precision: 18, scale: 8 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLotteryRoundSchema = createInsertSchema(lotteryRounds).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const insertWinnerSchema = createInsertSchema(winners).omit({
  id: true,
  createdAt: true,
});

export type InsertLotteryRound = z.infer<typeof insertLotteryRoundSchema>;
export type LotteryRound = typeof lotteryRounds.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertWinner = z.infer<typeof insertWinnerSchema>;
export type Winner = typeof winners.$inferSelect;
