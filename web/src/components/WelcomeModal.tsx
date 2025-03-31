import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiKeySettings } from './ApiKeySettings';
import { Users, Bot } from 'lucide-react';

interface WelcomeModalProps {
  onClose: (settings: {
    gameMode: 'human-vs-human' | 'human-vs-ai';
    opponentName?: string;
    aiModel?: string;
    aiApiKey?: string;
  }) => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState<'mode' | 'human' | 'ai'>('mode');
  const [opponentName, setOpponentName] = useState('');

  const handleHumanSelect = () => {
    setStep('human');
  };

  const handleAiSelect = () => {
    setStep('ai');
  };

  const handleHumanSubmit = () => {
    if (!opponentName.trim()) return;
    onClose({
      gameMode: 'human-vs-human',
      opponentName: opponentName.trim()
    });
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <span className="text-chess-ai-purple">Chess</span>
            <span>Bard</span>
            <span className="text-xs bg-chess-ai-purple px-2 py-0.5 rounded-full">AI</span>
          </DialogTitle>
        </DialogHeader>

        {step === 'mode' && (
          <div className="grid grid-cols-2 gap-4 p-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 p-6 h-auto"
              onClick={handleHumanSelect}
            >
              <Users size={32} />
              <span className="font-semibold">Play with Human</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 p-6 h-auto"
              onClick={handleAiSelect}
            >
              <Bot size={32} />
              <span className="font-semibold">Play with AI</span>
            </Button>
          </div>
        )}

        {step === 'human' && (
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="opponentName">Opponent's Name</Label>
              <Input
                id="opponentName"
                placeholder="Enter opponent's name"
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('mode')}>Back</Button>
              <Button onClick={handleHumanSubmit}>Start Game</Button>
            </div>
          </div>
        )}

        {step === 'ai' && (
          <div className="p-4">
            <ApiKeySettings
              onSettingsChange={(model, apiKey) => {
                onClose({
                  gameMode: 'human-vs-ai',
                  aiModel: model,
                  aiApiKey: apiKey
                });
              }}
            />
            <div className="mt-4 flex justify-start">
              <Button variant="outline" onClick={() => setStep('mode')}>Back</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
