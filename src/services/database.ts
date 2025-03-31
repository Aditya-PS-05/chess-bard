import { prisma } from '@/lib/prisma';

export interface GameData {
  whitePlayerId: string;
  blackPlayerId: string;
  winner?: 'white' | 'black' | null;
  moves: string[];
  gameMode: 'human-vs-human' | 'human-vs-ai';
  aiModel?: string;
}

export const database = {
  // User API Keys
  async saveApiKey(userId: string, provider: string, apiKey: string) {
    return prisma.apiKey.upsert({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      update: {
        apiKey,
      },
      create: {
        userId,
        provider,
        apiKey,
      },
    });
  },

  async getApiKey(userId: string, provider: string) {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });
    return apiKey?.apiKey;
  },

  // Games
  async createGame(data: GameData) {
    return prisma.game.create({
      data: {
        whitePlayerId: data.whitePlayerId,
        blackPlayerId: data.blackPlayerId,
        winner: data.winner,
        moves: data.moves,
        gameMode: data.gameMode,
        aiModel: data.aiModel,
      },
    });
  },

  async updateGameWinner(gameId: string, winner: 'white' | 'black' | null) {
    return prisma.game.update({
      where: { id: gameId },
      data: {
        winner,
        endedAt: new Date(),
      },
    });
  },

  async getUserStats(userId: string) {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { whitePlayerId: userId },
          { blackPlayerId: userId },
        ],
      },
    });

    const stats = {
      totalGames: games.length,
      wins: 0,
      losses: 0,
      draws: 0,
      aiGames: 0,
      humanGames: 0,
    };

    games.forEach(game => {
      if (game.gameMode === 'human-vs-ai') {
        stats.aiGames++;
      } else {
        stats.humanGames++;
      }

      if (!game.winner) {
        stats.draws++;
      } else if (
        (game.winner === 'white' && game.whitePlayerId === userId) ||
        (game.winner === 'black' && game.blackPlayerId === userId)
      ) {
        stats.wins++;
      } else {
        stats.losses++;
      }
    });

    return stats;
  },
};
