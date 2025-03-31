
import React from 'react';
import { Button } from '@/components/ui/button';

interface ApiKeyFormProps {
  onSubmit: (apiKey: string) => void;
  provider: string;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSubmit, provider }) => {
  // This component is now simplified to just pass an empty API key
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Button 
        type="submit" 
        className="w-full bg-chess-ai-purple hover:bg-chess-ai-purple-dark"
      >
        Connect to {provider}
      </Button>
    </form>
  );
};

export default ApiKeyForm;
