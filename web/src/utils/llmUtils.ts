import { GameState, parseLLMMove, getBoardStateForLLM, PieceType, Square } from './chessLogic';

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  apiUrl: string;
  provider: string;
}

export interface LLMConfig {
  model: string;
  apiKey: string;
  apiUrl: string;
  maxTokens?: number;
  temperature?: number;
}

// LLM Model configurations
export const llmModels: LLMModel[] = [
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    description: 'Most capable model with latest knowledge. Best for complex chess strategies.',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    provider: 'openai'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Highly capable model with strong chess understanding.',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    provider: 'openai'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient model for casual chess games.',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    provider: 'openai'
  }
];

// Simulate thinking time (min 5 seconds, max 15 seconds)
const simulateThinking = () => new Promise(resolve => {
  const thinkingTime = Math.random() * 10000 + 5000; // Random time between 5-15 seconds
  setTimeout(resolve, thinkingTime);
});

// Get the next move from an AI powered by an LLM
export async function getAIMove(gameState: GameState, config: LLMConfig): Promise<{ from: Square, to: Square, promotion?: PieceType } | null> {
  try {
    // Get the board state in FEN notation
    const fen = getBoardStateForLLM(gameState);
    
    // Create move history text
    const moveHistoryText = gameState.history.length > 0 
      ? `Move history (last ${Math.min(10, gameState.history.length)} moves): ${gameState.history.slice(-10).map((move, i) => 
          `${gameState.fullMoveNumber - Math.floor((gameState.history.length - i + (gameState.turn === 'w' ? 0 : 1)) / 2)}.${
            (gameState.history.length - i) % 2 === (gameState.turn === 'w' ? 0 : 1) ? '..' : ''
          } ${move.notation}`).join(' ')}`
      : 'No moves played yet.';
    
    // Get raw text response from LLM with increased timeout
    await simulateThinking();
    const llmResponse = await Promise.race([
      getLLMResponse(fen, moveHistoryText, config),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
      )
    ]);
    
    // Extract a valid chess move from the LLM response
    const moveData = parseLLMMove(gameState, llmResponse);
    if (!moveData) return null;

    // Ensure promotion is of type PieceType
    if (moveData.promotion && !['q', 'r', 'b', 'n'].includes(moveData.promotion)) {
      moveData.promotion = 'q'; // Default to queen if invalid
    }
    
    return moveData;
  } catch (error) {
    console.error('Error getting AI move:', error);
    return null;
  }
}

// Get raw response from LLM based on model provider
async function getLLMResponse(fenNotation: string, moveHistory: string, config: LLMConfig): Promise<string> {
  const selectedModel = llmModels.find(model => model.id === config.model);
  if (!selectedModel) {
    throw new Error(`Model ${config.model} not found`);
  }
  
  // Construct prompt for the LLM
  const prompt = `
You are an expert chess player. I'll give you a chess position in FEN notation and your task is to suggest the best move.

Current position: ${fenNotation}

${moveHistory}

Based on this position, provide the best move in algebraic notation (e.g. "e4", "Nf3", "O-O") or in the format "e2e4".

Give only ONE single move without any explanation or additional text.
`;

  // Get response from OpenAI
  return await getOpenAIResponse(prompt, config);
}

// Get response from OpenAI models
async function getOpenAIResponse(prompt: string, config: LLMConfig): Promise<string> {
  console.log('Making OpenAI API request with config:', {
    model: config.model,
    apiUrl: config.apiUrl,
    apiKeyPrefix: config.apiKey.substring(0, 7) // Log only prefix for security
  });

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a chess grandmaster assistant that provides precise chess moves in standard notation. Give ONLY the move without any explanation or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: config.temperature || 0.2,
      max_tokens: config.maxTokens || 50
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error}`);
  }
  
  const data = await response.json();
  console.log('OpenAI API response:', data);
  return data.choices?.[0]?.message?.content || '';
}
