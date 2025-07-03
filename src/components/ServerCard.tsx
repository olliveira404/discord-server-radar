import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface ServerCardProps {
  server: {
    id: string;
    name: string;
    description: string;
    members: number;
    tags: string[];
    lastBump: string;
    icon?: string;
    inviteCode: string;
  };
}

const ServerCard = ({ server }: ServerCardProps) => {
  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatLastBump = (date: string) => {
    const now = new Date();
    const bumpDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - bumpDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Há poucos minutos";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  return (
    <div className="group relative bg-gradient-card border border-border rounded-xl p-6 hover:shadow-[var(--shadow-discord)] hover:border-discord-primary/50 transition-all duration-300 hover:-translate-y-1">
      {/* Server Icon & Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          {server.icon ? (
            <img 
              src={server.icon} 
              alt={`${server.name} icon`}
              className="w-16 h-16 rounded-full border-2 border-discord-primary/20 group-hover:border-discord-primary/50 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-discord rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {server.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-discord-primary transition-colors truncate">
            {server.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {server.description}
          </p>
          
          {/* Member Count & Last Bump */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{formatMembers(server.members)} membros</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-discord-success rounded-full"></div>
              <span>{formatLastBump(server.lastBump)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {server.tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="bg-discord-primary/10 text-discord-primary border-discord-primary/20 hover:bg-discord-primary/20 transition-colors"
          >
            #{tag}
          </Badge>
        ))}
      </div>

      {/* Join Button */}
      <div className="flex justify-end">
        <Button 
          variant="discord" 
          size="sm"
          onClick={() => window.open(`https://discord.gg/${server.inviteCode}`, '_blank')}
          className="group-hover:scale-105 transition-transform"
        >
          Entrar no Servidor
        </Button>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-discord opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default ServerCard;