import React from 'react';
import { useGame } from '../contexts/GameContext';
import { llmModels } from '../utils/llmUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GameSettings() {
  const { selectedModel, setSelectedModel } = useGame();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Game Settings</CardTitle>
        <CardDescription>Choose your AI opponent</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select AI Model</label>
            <Select
              value={selectedModel?.id || ''}
              onValueChange={(value) => {
                const model = llmModels.find(m => m.id === value);
                if (model) {
                  setSelectedModel(model);
                } else {
                  setSelectedModel(null);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your opponent">
                  {selectedModel?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {llmModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModel && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-sm mb-2">{selectedModel.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedModel.description}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
