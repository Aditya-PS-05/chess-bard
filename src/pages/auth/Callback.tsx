import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Icons } from '@/components/ui/icons';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have an access token in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          if (error) throw error;
        }
        
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        
        navigate('/');
      } catch (error) {
        console.error('Error during auth callback:', error);
        navigate('/auth/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin" />
      <span className="ml-2">Authenticating...</span>
    </div>
  );
}
