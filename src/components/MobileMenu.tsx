import React, { useState } from 'react';
import { Menu, X, Settings, User, LogOut, Users, Bot } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  user: any;
  gameMode?: 'human-vs-human' | 'human-vs-ai';
  onLogout: () => void;
  onSettingsClick: () => void;
  onGameModeChange: (mode: 'human-vs-human' | 'human-vs-ai') => void;
}

export function MobileMenu({ user, gameMode, onLogout, onSettingsClick, onGameModeChange }: MobileMenuProps) {
  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
            <Menu size={24} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-gray-800 text-white border-gray-700">
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center space-x-2">
              <User size={16} />
              <div>
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-gray-400 font-normal">Game Mode</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => onGameModeChange('human-vs-human')}
              className={`${gameMode === 'human-vs-human' ? 'bg-chess-ai-purple' : ''} hover:bg-chess-ai-purple cursor-pointer`}
            >
              <Users size={16} className="mr-2" />
              Human vs Human
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onGameModeChange('human-vs-ai')}
              className={`${gameMode === 'human-vs-ai' ? 'bg-chess-ai-purple' : ''} hover:bg-chess-ai-purple cursor-pointer`}
            >
              <Bot size={16} className="mr-2" />
              Human vs AI
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator className="bg-gray-700" />
          
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onSettingsClick} className="hover:bg-gray-700 cursor-pointer">
              <Settings size={16} className="mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="text-red-400 hover:bg-gray-700 hover:text-red-400 cursor-pointer">
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
