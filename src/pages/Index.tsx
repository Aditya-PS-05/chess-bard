import { useState } from 'react';
import Chessboard from '@/components/Chessboard';
import { MoveHistory } from '@/components/MoveHistory';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useGame } from '../contexts/GameContext';
import { llmModels, LLMModel } from '../utils/llmUtils';
import { Users, Bot, ChevronDown } from 'lucide-react';
import { initializeChessGame } from '../utils/chessLogic';
import { WelcomeModal } from '../components/WelcomeModal';
import { ApiKeySettings } from '../components/ApiKeySettings';
import VictoryModal from '../components/VictoryModal';

export default function Index() {
  const { user } = useRequireAuth();
  const { selectedModel, getLLMConfig, setSelectedModel, setApiKey } = useGame();
  const [llmSettings, setLLMSettings] = useState<{ model: string, apiKey: string } | null>(null);
  const [gameMode, setGameMode] = useState<'human-vs-human' | 'human-vs-ai' | undefined>();
  const [opponentName, setOpponentName] = useState<string>();
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [gameEndDialog, setGameEndDialog] = useState<{
    open: boolean;
    result: 'checkmate' | 'stalemate' | 'king-captured';
    winner?: 'w' | 'b';
  }>({ open: false, result: 'checkmate' });
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [moves, setMoves] = useState<Array<{ san: string; color: 'w' | 'b'; number: number; }>>([]);
  const [scores, setScores] = useState({ white: 0, black: 0 });
  
  const { toast } = useToast();

  const [key, setKey] = useState(0);

  // Reset game to initial state
  const handleReset = () => {
    // Reset all game-related state
    setMoves([]);
    setGameEndDialog({
      open: false,
      result: 'checkmate',
      winner: undefined
    });
    // Force a complete reset of the game
    setGameState(initializeChessGame());
    // Force a remount of the Chessboard component with a new key
    setKey(prev => prev + 1);
  };

  const [gameState, setGameState] = useState(() => initializeChessGame());

  // Handle game end
  const handleGameEnd = (result: 'checkmate' | 'stalemate' | 'king-captured', winner?: 'w' | 'b') => {
    setGameEndDialog({
      open: true,
      result,
      winner
    });
    
    if (winner) {
      setScores(prev => ({
        ...prev,
        [winner === 'w' ? 'white' : 'black']: prev[winner === 'w' ? 'white' : 'black'] + 1
      }));
    }
  };

  // Undo last move
  const handleUndo = () => {
    setMoves(prev => prev.slice(0, -1));
  };

  const handleModelSelect = (modelId: string | null) => {
    console.log('Handling model selection:', modelId);
    const config = getLLMConfig();
    console.log('LLM Config:', config);
    
    setShowAiDialog(false);
    setGameMode(modelId ? 'human-vs-ai' : 'human-vs-human');
    
    // Reset game
    handleReset();
    
    setSelectedModel(modelId);
    
    const model = modelId ? llmModels.find(m => m.id === modelId) : null;
    toast({
      title: model ? "AI Connected" : "AI Disconnected",
      description: model ? `You're now playing against ${model.name}` : 'Switched to human vs human mode',
    });
  };

  const handleWelcomeComplete = (settings: {
    gameMode: 'human-vs-human' | 'human-vs-ai';
    opponentName?: string;
    aiModel?: string;
    aiApiKey?: string;
  }) => {
    setGameMode(settings.gameMode);
    setOpponentName(settings.opponentName);
    
    if (settings.gameMode === 'human-vs-ai' && settings.aiModel) {
      setSelectedModel(settings.aiModel);
      setLLMSettings({
        model: settings.aiModel,
        apiKey: settings.aiApiKey || ''
      });
    }
    
    toast({
      title: 'Game Started',
      description: settings.gameMode === 'human-vs-ai'
        ? 'Playing against AI'
        : `Playing against ${settings.opponentName}`,
    });
  };

  const handleMove = (move: { from: string, to: string, san: string, color: 'w' | 'b' }) => {
    console.log('Move:', move);
    setMoves(prev => [...prev, {
      san: move.san,
      color: move.color,
      number: Math.floor(prev.length / 2) + 1
    }]);
  };

  const handlePlayAgain = () => {
    handleReset();
  };

  return (
    <div className="w-screen flex flex-col bg-gray-900 text-white">
      {!gameMode && (
        <WelcomeModal onClose={handleWelcomeComplete} />
      )}
      {/* Header */}
      <header className="w-full bg-gray-800 py-3 shadow-md sticky top-0 z-50">
        <nav className="w-[68%] mx-auto flex justify-between items-center">
          {/* <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-1">
            <span className="text-chess-ai-purple">Chess</span>
            <span>Bard</span>
            <span className="text-[10px] md:text-xs bg-chess-ai-purple px-1.5 py-0.5 rounded-full">AI</span>
          </h1>
           */}
          <div className="flex items-center gap-2 md:gap-4 ml-16">
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {gameMode === 'human-vs-human' ? 'Human vs Human' : 'Human vs AI'}
              </span>
              
              <div className="relative">
              <Button
                variant={gameMode === 'human-vs-human' ? 'default' : 'outline'}
                onClick={() => setGameMode('human-vs-human')}
                className={`rounded-l-md rounded-r-none px-3 ${
                  gameMode === 'human-vs-human' 
                    ? 'bg-chess-ai-purple hover:bg-chess-ai-purple-dark' 
                    : 'border-gray-700'
                }`}
              >
                <Users size={16} className="mr-2" />
                <span className="hidden sm:inline">Human</span>
              </Button>
              
              <Button
                variant={gameMode === 'human-vs-ai' ? 'default' : 'outline'}
                onClick={() => setShowAiDialog(true)}
                className={`rounded-r-md rounded-l-none px-3 ${
                  gameMode === 'human-vs-ai' 
                    ? 'bg-chess-ai-purple hover:bg-chess-ai-purple-dark' 
                    : 'border-gray-700'
                }`}
              >
                <Bot size={16} className="mr-2" />
                <span className="hidden sm:inline">AI</span>
              </Button>
              </div>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="w-[68%] mx-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Chessboard */}
          <div className="md:col-span-2 flex items-center justify-center" style={{ minHeight: '80vh' }}>
            
            {gameMode === 'human-vs-ai' && !llmSettings ? (
              <div className="flex items-center justify-center h-full">
                <ApiKeySettings
                  onSettingsChange={(model, apiKey) => {
                    setLLMSettings({ model, apiKey });
                    setSelectedModel(model);
                  }}
                  initialModel={selectedModel}
                />
              </div>
            ) : (
              <Chessboard 
                key={key}
                gameMode={gameMode}
                llmConfig={gameMode === 'human-vs-ai' ? {
                  model: llmSettings?.model || selectedModel,
                  apiKey: llmSettings?.apiKey || '',
                  apiUrl: llmModels.find(m => m.id === (llmSettings?.model || selectedModel))?.apiUrl || ''
                } : undefined}
                playerColor={playerColor}
                onGameEnd={handleGameEnd}
                onMove={handleMove}
                onUndo={handleUndo}
                isBoardFlipped={playerColor === 'b'}
                gameState={gameState}
                onGameStateChange={setGameState}
              />
            )}
          </div>
          
          {/* Sidebar - Move History and Status */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Game Info</h3>
                
                {gameMode === 'human-vs-ai' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Playing as:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700 h-8"
                      onClick={() => {
                        setPlayerColor(playerColor === 'w' ? 'b' : 'w');
                        handleReset();
                      }}
                    >
                      {playerColor === 'w' ? 'White' : 'Black'}
                      <ChevronDown size={14} className="ml-1" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">White</div>
                  <div className="flex items-center">
                    {gameMode === 'human-vs-ai' && playerColor === 'w' ? (
                      <span className="font-medium">You</span>
                    ) : gameMode === 'human-vs-ai' ? (
                      <span className="font-medium flex items-center">
                        <Bot size={14} className="mr-1 text-chess-ai-purple" />
                        AI
                      </span>
                    ) : (
                      <span className="font-medium">{user?.name || 'Player 1'}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Captured: 
                  </div>
                </div>
                
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Black</div>
                  <div className="flex items-center">
                    {gameMode === 'human-vs-ai' && playerColor === 'b' ? (
                      <span className="font-medium">You</span>
                    ) : gameMode === 'human-vs-ai' ? (
                      <span className="font-medium flex items-center">
                        <Bot size={14} className="mr-1 text-chess-ai-purple" />
                        AI
                      </span>
                    ) : (
                      <span className="font-medium">{opponentName || 'Player 2'}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Captured: 
                  </div>
                </div>
              </div>
              
              <div className="text-sm">
                <div className="flex justify-between py-1 border-b border-gray-700">
                  <span className="text-gray-400">Current Turn</span>
                  <span className="font-medium">
                    
                  </span>
                </div>
                
                <div className="flex justify-between py-1 border-b border-gray-700">
                  <span className="text-gray-400">Move Number</span>
                  <span className="font-medium">
                    
                  </span>
                </div>
                
                <div className="flex justify-between py-1 border-b border-gray-700">
                  <span className="text-gray-400">Game Status</span>
                  <span className="font-medium">
                    
                  </span>
                </div>
                
                {gameMode === 'human-vs-ai' && (
                  <div className="flex justify-between py-1 border-b border-gray-700">
                    <span className="text-gray-400">AI Model</span>
                    <span className="font-medium text-chess-ai-purple">
                      {llmModels.find(m => m.id === selectedModel)?.name || 'No model selected'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Move History */}
            <div className="flex-1">
              <MoveHistory 
                moves={moves}
                whiteScore={scores.white}
                blackScore={scores.black}
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 p-3 text-center text-gray-400 text-sm">
        <div className="container mx-auto">
          Chess Bard AI - Your intelligent chess companion - BharatX Tech Intern Task
        </div>
      </footer>
      
      {/* AI Model Selection Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Connect to AI</DialogTitle>
            <DialogDescription>
              Select an AI model and provide your API key
            </DialogDescription>
          </DialogHeader>
          
          <ApiKeySettings
            initialModel={selectedModel}
            onSettingsChange={(model, apiKey) => {
              setSelectedModel(model);
              setApiKey(apiKey);
              setGameMode('human-vs-ai');
              setShowAiDialog(false);
              
              const selectedModelInfo = llmModels.find(m => m.id === model);
              toast({
                title: 'AI Connected',
                description: `You're now playing against ${selectedModelInfo?.name}`,
              });
            }}
          />
          
          <div className="text-xs text-gray-500 mt-4">
            Your API key is stored locally and is never sent to our servers.
          </div>
        </DialogContent>
      </Dialog>
      

      
      <VictoryModal 
        winner={gameEndDialog.winner} 
        onPlayAgain={handleReset} 
      />
    </div>
  );
};