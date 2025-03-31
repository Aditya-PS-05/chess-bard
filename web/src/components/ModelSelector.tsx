
import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { llmModels } from '../utils/llmUtils';

interface ModelSelectorProps {
  onModelSelect: (model: string, apiKey: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelSelect }) => {
  const [selectedModel, setSelectedModel] = useState('');
  
  // Group models by provider
  const groupedModels = llmModels.reduce((acc, model) => {
    const provider = model.provider.charAt(0).toUpperCase() + model.provider.slice(1);
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, typeof llmModels>);

  const handleModelSelection = () => {
    if (selectedModel) {
      // Pass an empty API key as it's no longer required
      onModelSelect(selectedModel, '');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Select onValueChange={setSelectedModel}>
          <SelectTrigger className="w-full bg-gray-900 border-gray-700">
            <SelectValue placeholder="Select a language model" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {Object.entries(groupedModels).map(([provider, models]) => (
              <SelectGroup key={provider}>
                <SelectLabel className="text-gray-400">{provider}</SelectLabel>
                {models.map((model) => (
                  <SelectItem 
                    key={model.id} 
                    value={model.id}
                    className="cursor-pointer hover:bg-gray-800"
                  >
                    {model.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedModel && (
        <Button 
          onClick={handleModelSelection}
          className="w-full bg-chess-ai-purple hover:bg-chess-ai-purple-dark"
        >
          Play with Selected Model
        </Button>
      )}
    </div>
  );
};

export default ModelSelector;
