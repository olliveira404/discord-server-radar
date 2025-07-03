import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ServerCard from "@/components/ServerCard";
import { supabase } from "@/integrations/supabase/client";

interface Server {
  id: string;
  name: string;
  description: string;
  members: number;
  tags: string[];
  lastBump: string;
  icon?: string;
  inviteCode: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const searchQuery = searchParams.get("q") || "";
    const sortParam = searchParams.get("sort") || "recent";
    setQuery(searchQuery);
    setSortBy(sortParam);
    handleSearch(searchQuery, sortParam);
  }, [searchParams]);

  const handleSearch = async (searchQuery: string, sortBy: string) => {
    setIsLoading(true);
    
    try {
      let queryBuilder = supabase
        .from('servers')
        .select('*')
        .eq('is_active', true);

      // Filter by search query
      if (searchQuery.trim()) {
        const keywords = searchQuery.toLowerCase().split(' ').filter(k => k.length > 0);
        
        // Use PostgreSQL array overlap operator for tags
        for (const keyword of keywords) {
          queryBuilder = queryBuilder.overlaps('tags', [keyword]);
        }
      }

      // Sort results
      switch (sortBy) {
        case "recent":
          queryBuilder = queryBuilder.order('last_bump', { ascending: false });
          break;
        case "members":
          queryBuilder = queryBuilder.order('member_count', { ascending: false });
          break;
        case "name":
          queryBuilder = queryBuilder.order('name', { ascending: true });
          break;
      }

      const { data, error } = await queryBuilder.limit(50);
      
      if (error) throw error;
      
      const formattedServers = data?.map(server => ({
        id: server.id,
        name: server.name,
        description: server.description,
        members: server.member_count,
        tags: server.tags,
        lastBump: server.last_bump,
        icon: server.icon_url || "",
        inviteCode: server.invite_code
      })) || [];

      setServers(formattedServers);
    } catch (error) {
      console.error('Error fetching servers:', error);
      setServers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Header */}
      <section className="py-8 px-4 bg-gradient-subtle border-b border-border">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-4 text-center">
            Resultados da Pesquisa
          </h1>
          <SearchBar onSearch={handleSearch} initialQuery={query} initialSort={sortBy} />
        </div>
      </section>

      {/* Results Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {query ? `Resultados para "${query}"` : "Todos os Servidores"}
          </h2>
          <div className="text-sm text-muted-foreground">
            {servers.length} servidor(es) encontrado(s)
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-6 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                  <div className="h-6 bg-muted rounded w-14"></div>
                </div>
                <div className="h-9 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
        
        {!isLoading && servers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum servidor encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente usar outras palavras-chave ou remova alguns filtros
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;