import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LLMModel, llmModels } from '../utils/llmUtils';

interface GameContextType {
  selectedModel: LLMModel | null;
  setSelectedModel: (model: LLMModel | null) => void;
  getLLMConfig: () => {
    model: string;
    apiKey: string;
    apiUrl: string;
  } | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const getApiKeyForProvider = (provider: string): string => {
  switch (provider) {
    case 'openai':
      return import.meta.env.VITE_OPENAI_API_KEY || '';
    case 'google':
      return import.meta.env.VITE_GOOGLE_API_KEY || '';
    case 'anthropic':
      return import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    default:
      return '';
  }
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(llmModels[0]);

  const getLLMConfig = (): {
    model: string;
    apiKey: string;
    apiUrl: string;
  } | null => {
    if (!selectedModel) return null;

    const apiKey = getApiKeyForProvider(selectedModel.provider);
    if (!apiKey) {
      console.error(`${selectedModel.provider} API key not found in environment variables`);
      return null;
    }

    return {
      model: selectedModel.id,
      apiKey,
      apiUrl: selectedModel.apiUrl
    };
  };

  const value = {
    selectedModel,
    setSelectedModel,
    getLLMConfig
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
