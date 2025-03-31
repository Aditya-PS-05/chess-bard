
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock user for demo purposes
  const defaultUser = {
    id: '1',
    name: 'Chess Player',
    email: 'player@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chess'
  };

  const [user, setUser] = useState<User | null>(null);

  // Check for user in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('chess-ai-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Auto login for demo
      setUser(defaultUser);
      localStorage.setItem('chess-ai-user', JSON.stringify(defaultUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in a real app, you'd validate credentials with a backend
    const loggedInUser = defaultUser;
    setUser(loggedInUser);
    localStorage.setItem('chess-ai-user', JSON.stringify(loggedInUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    // Mock signup - in a real app, you'd create a user on the backend
    const newUser = { ...defaultUser, email, name };
    setUser(newUser);
    localStorage.setItem('chess-ai-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chess-ai-user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function UserAvatar() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <Avatar>
      <AvatarImage src={user.avatarUrl} alt={user.name} />
      <AvatarFallback>{user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
