
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800">
      <div className="w-[68%] px-4 py-3 mx-auto flex items-center justify-between">
        {/* Logo Section */}
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
        
        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/play" 
            className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Play
          </Link>
          <Link 
            to="/settings" 
            className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Settings
          </Link>
        </div>

        {/* User Profile / Auth Buttons */}
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 text-sm font-medium">
              {user.name}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none hover:opacity-90 transition-opacity">
                <UserAvatar />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-gray-900 border border-gray-700 text-white rounded-md shadow-lg"
              >
                <div className="p-2 border-b border-gray-700">
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{user.email}</div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/auth/login"
              className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/auth/signup"
              className="bg-chess-ai-purple hover:bg-chess-ai-purple/90 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavbarWrapper: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="w-full px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default NavbarWrapper;
