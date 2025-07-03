import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchBarProps {
  onSearch?: (query: string, sortBy: string) => void;
  initialQuery?: string;
  initialSort?: string;
}

const SearchBar = ({ onSearch, initialQuery = "", initialSort = "recent" }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState(initialSort);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, sortBy);
    } else {
      // Navigate to search page with query params
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query);
      if (sortBy !== 'recent') params.set('sort', sortBy);
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex flex-col md:flex-row gap-4 p-6 bg-gradient-card rounded-xl border border-border shadow-[var(--shadow-card)]">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Pesquise por categorias... (anime, games, manga, etc.)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pr-4 py-3 text-lg bg-background/50 border-border focus:border-discord-primary transition-colors"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-background/50">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Última divulgação</SelectItem>
              <SelectItem value="members">Mais membros</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="discord" onClick={handleSearch} className="px-8">
            <Search className="w-4 h-4" />
            Buscar
          </Button>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        💡 Dica: Use até 5 palavras-chave separadas por espaço para encontrar servidores específicos
      </div>
    </div>
  );
};

export default SearchBar;