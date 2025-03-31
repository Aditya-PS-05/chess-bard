import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LLMModel, llmModels } from '../utils/llmUtils';

interface GameContextType {
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  setApiKey: (apiKey: string) => void;
  getLLMConfig: () => {
    model: string;
    apiKey: string;
    apiUrl: string;
  } | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<string>(llmModels[0].id);
  const [apiKey, setApiKey] = useState<string>('');

  const getLLMConfig = (): {
    model: string;
    apiKey: string;
    apiUrl: string;
  } | null => {
    const model = llmModels.find(m => m.id === selectedModel);
    if (!model) return null;

    if (!apiKey) {
      console.error('No API key provided');
      return null;
    }

    return {
      model: model.id,
      apiKey,
      apiUrl: model.apiUrl
    };
  };

  const value = {
    selectedModel,
    setSelectedModel,
    setApiKey,
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
