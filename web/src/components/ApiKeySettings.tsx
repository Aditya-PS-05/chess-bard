import React, { useState, useEffect } from 'react';
import { llmModels, LLMModel } from '../utils/llmUtils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ApiKeySettingsProps {
  onSettingsChange: (model: string, apiKey: string) => void;
  initialModel?: string;
}

export function ApiKeySettings({ onSettingsChange, initialModel }: ApiKeySettingsProps) {
  const [selectedModel, setSelectedModel] = useState<string>(initialModel || llmModels[0].id);
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key for the selected model.",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem('chess_llm_model', selectedModel);
    localStorage.setItem('chess_llm_api_key', apiKey);
    
    onSettingsChange(selectedModel, apiKey);
    
    toast({
      title: "Settings Saved",
      description: "Your API key has been saved securely.",
    });
  };

  // Load saved settings on mount
  useEffect(() => {
    const savedModel = localStorage.getItem('chess_llm_model');
    const savedApiKey = localStorage.getItem('chess_llm_api_key');
    
    if (savedModel) setSelectedModel(savedModel);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>AI Model Settings</CardTitle>
        <CardDescription>Configure your AI model and API key</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model">Select AI Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {llmModels.map((model: LLMModel) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                  <span className="text-sm text-gray-500 block">
                    {model.description}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Your API key will be stored securely in your browser.
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
