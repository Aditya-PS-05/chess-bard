
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Trophy } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center mb-6">
            <svg
              viewBox="0 0 24 24"
              width="64"
              height="64"
              className="text-chess-ai-purple mr-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 3-1 3 3 1-3 3h4l1 4 1-4h4l-3-3 3-1-1-3" />
              <path d="M12 12h.01" />
              <path d="M12 16a4 4 0 0 1-4 4 7 7 0 0 0 8 0 4 4 0 0 1-4-4Z" />
            </svg>
            <h1 className="text-4xl md:text-6xl font-bold">
              Chess Bard <span className="text-chess-ai-purple">AI</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
            Play chess against advanced AI language models capable of explaining their moves and teaching you chess strategy
          </p>
          
          <div className="mt-10">
            <Link to="/play">
              <Button size="lg" className="bg-chess-ai-purple hover:bg-chess-ai-purple-dark text-white text-lg px-8 py-6">
                Start Playing Now
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard 
            icon={<Brain size={40} />}
            title="AI Opponents"
            description="Challenge different AI language models with varying play styles and difficulty levels"
          />
          <FeatureCard 
            icon={<Sparkles size={40} />}
            title="Learning Experience"
            description="Get explanations for AI moves and receive personalized chess advice to improve your game"
          />
          <FeatureCard 
            icon={<Trophy size={40} />}
            title="Improve Your Skills"
            description="Track your progress and develop your chess abilities through regular practice"
          />
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-gray-700 hover:border-chess-ai-purple transition-colors">
      <div className="text-chess-ai-purple mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

export default Home;
