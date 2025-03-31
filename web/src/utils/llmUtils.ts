import { GameState, parseLLMMove, getBoardStateForLLM, PieceType, Square } from './chessLogic';

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  apiUrl: string;
  provider: 'openai' | 'grok' | 'gemini' | 'cohere';
  requiresApiKey: boolean;
  defaultApiUrl?: string;
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
    id: 'grok-1',
    name: 'Grok AI',
    description: 'xAI\'s latest model with strong chess capabilities.',
    apiUrl: 'https://api.grok.ai/v1/chat/completions',
    provider: 'grok',
    requiresApiKey: true,
    defaultApiUrl: 'https://api.grok.ai/v1/chat/completions'
  },
  {
    id: 'gemini-pro',
    name: 'Google Gemini Pro',
    description: 'Google\'s most capable model for chess analysis.',
    apiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
    provider: 'gemini',
    requiresApiKey: true,
    defaultApiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
  },
  {
    id: 'command',
    name: 'Cohere Command',
    description: 'Cohere\'s most capable model for chess strategy.',
    apiUrl: 'https://api.cohere.ai/v1/generate',
    provider: 'cohere',
    requiresApiKey: true,
    defaultApiUrl: 'https://api.cohere.ai/v1/generate'
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    description: 'OpenAI\'s most capable model for chess.',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    provider: 'openai',
    requiresApiKey: true,
    defaultApiUrl: 'https://api.openai.com/v1/chat/completions'
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

  // Get response based on the provider
  switch (selectedModel.provider) {
    case 'openai':
      return await getOpenAIResponse(prompt, config);
    case 'grok':
      return await getGrokResponse(prompt, config);
    case 'gemini':
      return await getGeminiResponse(prompt, config);
    case 'cohere':
      return await getCohereResponse(prompt, config);
    default:
      throw new Error(`Unsupported provider: ${selectedModel.provider}`);
  }
}

// Provider-specific response functions
async function getOpenAIResponse(prompt: string, config: LLMConfig): Promise<string> {
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
      max_tokens: config.maxTokens || 50,
      temperature: config.temperature || 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function getGrokResponse(prompt: string, config: LLMConfig): Promise<string> {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a chess grandmaster assistant that provides precise chess moves in standard notation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: config.temperature || 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function getGeminiResponse(prompt: string, config: LLMConfig): Promise<string> {
  const response = await fetch(`${config.apiUrl}?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{
            text: prompt
          }]
        }
      ],
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 50
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

async function getCohereResponse(prompt: string, config: LLMConfig): Promise<string> {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: 'command',
      prompt: prompt,
      max_tokens: config.maxTokens || 50,
      temperature: config.temperature || 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Cohere API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.generations[0].text.trim();
}