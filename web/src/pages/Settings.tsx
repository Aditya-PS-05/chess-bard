import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GameSettings } from '@/components/GameSettings';

const Settings = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Please log in to view settings.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <Card className="bg-gray-900 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Profile Information</CardTitle>
          <CardDescription className="text-gray-400">
            Update your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Name</Label>
            <Input id="name" defaultValue={user.name} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input id="email" defaultValue={user.email} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <Button className="bg-chess-ai-purple hover:bg-chess-ai-purple-dark mt-2">
            Save Changes
          </Button>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Game Settings</CardTitle>
          <CardDescription className="text-gray-400">
            Configure AI model and game preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GameSettings />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
