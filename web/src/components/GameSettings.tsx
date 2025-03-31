import React from 'react';
import { useGame } from '../contexts/GameContext';
import { llmModels } from '../utils/llmUtils';

const gptTurboModel = llmModels.find(m => m.name === 'GPT-3.5-turbo');

export function GameSettings() {
  const { selectedModel, setSelectedModel } = useGame();
  const currentModel = gptTurboModel;

  React.useEffect(() => {
    if (selectedModel !== gptTurboModel.id) {
      setSelectedModel(gptTurboModel.id);
    }
  }, [selectedModel, setSelectedModel, gptTurboModel]);

  return (
    <div className="p-4 bg-gray-800 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-white">AI Model Settings</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Select AI Model</label>
        <select
          value={gptTurboModel.id}
          disabled
          className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
        >
          <option key={gptTurboModel.id} value={gptTurboModel.id}>
            {gptTurboModel.name}
          </option>
        </select>
        <p className="text-sm text-gray-400 mt-2">
          {gptTurboModel.description}
        </p>
      </div>
    </div>
  );
}
