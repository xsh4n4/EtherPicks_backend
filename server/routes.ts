import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current lottery round data
  app.get("/api/lottery/current", async (req, res) => {
    try {
      const currentRound = await storage.getCurrentRound();
      if (!currentRound) {
        return res.status(404).json({ message: "No active lottery round found" });
      }
      
      const playerCount = await storage.getPlayerCount(currentRound.id);
      const players = await storage.getPlayersByRound(currentRound.id);
      
      res.json({
        round: currentRound,
        playerCount,
        players,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lottery data" });
    }
  });

  // Get recent winners
  app.get("/api/lottery/winners", async (req, res) => {
    try {
      const winners = await storage.getRecentWinners(5);
      res.json(winners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch winners" });
    }
  });

  // Enter lottery (simulate)
  app.post("/api/lottery/enter", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const currentRound = await storage.getCurrentRound();
      if (!currentRound) {
        return res.status(404).json({ message: "No active lottery round" });
      }
      
      // Check if player already exists
      const existingPlayers = await storage.getPlayersByRound(currentRound.id);
      const existingPlayer = existingPlayers.find(p => p.address === address);
      
      if (existingPlayer) {
        // Increment entry count for existing player
        const updatedPlayer = await storage.addPlayer({
          address,
          roundId: currentRound.id,
          entryCount: 1,
        });
        
        // Update prize pool
        const newPrizePool = (parseFloat(currentRound.prizePool) + 0.05).toFixed(2);
        await storage.updateLotteryRound(currentRound.id, {
          prizePool: newPrizePool,
        });
        
        res.json({ message: "Successfully entered lottery", player: updatedPlayer });
      } else {
        // Add new player
        const newPlayer = await storage.addPlayer({
          address,
          roundId: currentRound.id,
          entryCount: 1,
        });
        
        // Update prize pool
        const newPrizePool = (parseFloat(currentRound.prizePool) + 0.05).toFixed(2);
        await storage.updateLotteryRound(currentRound.id, {
          prizePool: newPrizePool,
        });
        
        res.json({ message: "Successfully entered lottery", player: newPlayer });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to enter lottery" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
