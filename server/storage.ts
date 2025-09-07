import { lotteryRounds, players, winners, type LotteryRound, type Player, type Winner, type InsertLotteryRound, type InsertPlayer, type InsertWinner } from "@shared/schema";

export interface IStorage {
  // Lottery Rounds
  getCurrentRound(): Promise<LotteryRound | undefined>;
  createLotteryRound(round: InsertLotteryRound): Promise<LotteryRound>;
  updateLotteryRound(id: number, updates: Partial<LotteryRound>): Promise<LotteryRound | undefined>;
  
  // Players
  getPlayersByRound(roundId: number): Promise<Player[]>;
  addPlayer(player: InsertPlayer): Promise<Player>;
  getPlayerCount(roundId: number): Promise<number>;
  
  // Winners
  getRecentWinners(limit?: number): Promise<Winner[]>;
  addWinner(winner: InsertWinner): Promise<Winner>;
}

export class MemStorage implements IStorage {
  private lotteryRounds: Map<number, LotteryRound>;
  private players: Map<number, Player>;
  private winners: Map<number, Winner>;
  private currentRoundId: number;
  private currentPlayerId: number;
  private currentWinnerId: number;

  constructor() {
    this.lotteryRounds = new Map();
    this.players = new Map();
    this.winners = new Map();
    this.currentRoundId = 1;
    this.currentPlayerId = 1;
    this.currentWinnerId = 1;
    
    // Initialize with a current active round
    this.initializeData();
  }

  private initializeData() {
    // Create initial lottery round
    const initialRound: LotteryRound = {
      id: this.currentRoundId++,
      roundNumber: 1248,
      prizePool: "12.45",
      winner: null,
      isActive: true,
      createdAt: new Date(),
      endedAt: null,
    };
    this.lotteryRounds.set(initialRound.id, initialRound);
    
    // Add some recent winners
    const recentWinners: Winner[] = [
      {
        id: this.currentWinnerId++,
        address: "0x1234567890123456789012345678901234567890",
        roundNumber: 1247,
        prizeAmount: "8.75",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: this.currentWinnerId++,
        address: "0x9876543210987654321098765432109876543210",
        roundNumber: 1246,
        prizeAmount: "15.2",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: this.currentWinnerId++,
        address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        roundNumber: 1245,
        prizeAmount: "22.1",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];
    
    recentWinners.forEach(winner => {
      this.winners.set(winner.id, winner);
    });
    
    // Add some current players
    const currentPlayers: Player[] = [
      {
        id: this.currentPlayerId++,
        address: "0x1111111111111111111111111111111111111111",
        roundId: initialRound.id,
        entryCount: 1,
        createdAt: new Date(),
      },
      {
        id: this.currentPlayerId++,
        address: "0x2222222222222222222222222222222222222222",
        roundId: initialRound.id,
        entryCount: 3,
        createdAt: new Date(),
      },
      {
        id: this.currentPlayerId++,
        address: "0x3333333333333333333333333333333333333333",
        roundId: initialRound.id,
        entryCount: 2,
        createdAt: new Date(),
      },
    ];
    
    currentPlayers.forEach(player => {
      this.players.set(player.id, player);
    });
  }

  async getCurrentRound(): Promise<LotteryRound | undefined> {
    return Array.from(this.lotteryRounds.values()).find(round => round.isActive);
  }

  async createLotteryRound(insertRound: InsertLotteryRound): Promise<LotteryRound> {
    const id = this.currentRoundId++;
    const round: LotteryRound = {
      ...insertRound,
      id,
      createdAt: new Date(),
      endedAt: null,
    };
    this.lotteryRounds.set(id, round);
    return round;
  }

  async updateLotteryRound(id: number, updates: Partial<LotteryRound>): Promise<LotteryRound | undefined> {
    const round = this.lotteryRounds.get(id);
    if (!round) return undefined;
    
    const updatedRound = { ...round, ...updates };
    this.lotteryRounds.set(id, updatedRound);
    return updatedRound;
  }

  async getPlayersByRound(roundId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.roundId === roundId);
  }

  async addPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const player: Player = {
      ...insertPlayer,
      id,
      createdAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayerCount(roundId: number): Promise<number> {
    const players = await this.getPlayersByRound(roundId);
    return players.reduce((total, player) => total + player.entryCount, 0);
  }

  async getRecentWinners(limit: number = 10): Promise<Winner[]> {
    return Array.from(this.winners.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async addWinner(insertWinner: InsertWinner): Promise<Winner> {
    const id = this.currentWinnerId++;
    const winner: Winner = {
      ...insertWinner,
      id,
      createdAt: new Date(),
    };
    this.winners.set(id, winner);
    return winner;
  }
}

export const storage = new MemStorage();
