import React from 'react';
import { llmModels, LLMModel } from '../utils/llmUtils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ModelSelectorProps {
  onModelSelect: (model: LLMModel) => void;
  selectedModel: LLMModel | null;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelSelect, selectedModel }) => {
  return (
    <div className="space-y-4">
      <Select
        value={selectedModel?.id || ''}
        onValueChange={(value) => {
          const model = llmModels.find(m => m.id === value);
          if (model) {
            onModelSelect(model);
          }
        }}
      >
        <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-black">
          <SelectValue placeholder="Select a language model" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700">
          {llmModels.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              className="cursor-pointer hover:bg-gray-800"
            >
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedModel && (
        <Button 
          onClick={() => onModelSelect(selectedModel)}
          className="w-full bg-chess-ai-purple hover:bg-chess-ai-purple-dark"
        >
          Play with Selected Model
        </Button>
      )}
    </div>
  );
};

export default ModelSelector;
