
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, UserAvatar } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-chess-ai-purple"
          >
            <path d="M8 16l-1.447.724a1 1 0 0 0-.553.894V20h12v-2.382a1 1 0 0 0-.553-.894L16 16"></path>
            <circle cx="12" cy="4" r="2"></circle>
            <path d="M10 10h4"></path>
            <path d="M12 4v6"></path>
            <path d="M8 13v-3h8v3"></path>
          </svg>
          <span className="text-xl font-bold text-white">Chess Bard AI</span>
        </Link>
        
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 mr-2 hidden md:inline-block">
              {user.name}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <UserAvatar />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700 text-white">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem asChild className="cursor-pointer text-gray-200 focus:bg-gray-800 focus:text-white">
                  <Link to="/settings" className="flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="cursor-pointer text-gray-200 focus:bg-gray-800 focus:text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-white hover:text-chess-ai-purple">Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
