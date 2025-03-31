import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LLMConfig, llmModels } from '../utils/llmUtils';

interface GameContextType {
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  getLLMConfig: () => LLMConfig;
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
  const [selectedModel, setSelectedModel] = useState<string>(llmModels[0].id);

  const getLLMConfig = (): LLMConfig => {
    const model = llmModels.find(m => m.id === selectedModel) || llmModels[0];
    const apiKey = getApiKeyForProvider(model.provider);

    return {
      model: model.id,
      apiKey,
      apiUrl: model.apiUrl,
      maxTokens: 100,
      temperature: 0.7
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
