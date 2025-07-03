import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, signInWithDiscord, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-discord rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-bold bg-gradient-discord bg-clip-text text-transparent">
            DiscordHub
          </span>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/profile')}
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <Button variant="discord" size="sm" onClick={signInWithDiscord}>
              Login com Discord
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;