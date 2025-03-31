import React, { useState, useEffect } from 'react';
import { llmModels, LLMModel } from '../utils/llmUtils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Icons } from "@/components/ui/icons";

interface ApiKeySettingsProps {
  onSettingsChange: (model: string, apiKey: string) => void;
  initialModel?: string;
}

export function ApiKeySettings({ onSettingsChange, initialModel }: ApiKeySettingsProps) {
  const [selectedModel, setSelectedModel] = useState<string>(initialModel || llmModels[0].id);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key for the selected model.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('chess_llm_model', selectedModel);
      localStorage.setItem('chess_llm_api_key', apiKey);
      
      onSettingsChange(selectedModel, apiKey);
      
      toast({
        title: "Settings Saved",
        description: "Your API key has been saved securely.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSave} className="w-full" disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save your API key and model selection</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
