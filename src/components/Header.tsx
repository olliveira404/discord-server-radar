import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";

const Header = () => {
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

        {/* Auth Button */}
        <div className="flex items-center">
          <Button variant="discord" size="sm">
            Login com Discord
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;