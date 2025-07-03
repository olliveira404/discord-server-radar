import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
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
  icon: string;
  inviteCode: string;
}

const Index = () => {
  const [featuredServers, setFeaturedServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedServers();
  }, []);

  const fetchFeaturedServers = async () => {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .eq('is_active', true)
        .order('last_bump', { ascending: false })
        .limit(12);

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

      // Shuffle array for random display
      const shuffled = formattedServers.sort(() => 0.5 - Math.random());
      setFeaturedServers(shuffled);
    } catch (error) {
      console.error('Error fetching servers:', error);
      setFeaturedServers([]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <SearchBar />
        
        {/* Results Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Servidores em Destaque
            </h2>
            <div className="text-sm text-muted-foreground">
              {featuredServers.length} servidor(es) em destaque
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
              {featuredServers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>
          )}
          
          {!isLoading && featuredServers.length === 0 && (
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
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-discord rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-xl font-bold bg-gradient-discord bg-clip-text text-transparent">
                  DiscordHub
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A melhor plataforma para descobrir e promover servidores Discord. 
                Conectando comunidades e pessoas com interesses em comum.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Links Úteis</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-discord-primary transition-colors">Como funciona</a></li>
                <li><a href="#" className="hover:text-discord-primary transition-colors">Termos de uso</a></li>
                <li><a href="#" className="hover:text-discord-primary transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-discord-primary transition-colors">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Comunidade</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-discord-primary transition-colors">Discord Oficial</a></li>
                <li><a href="#" className="hover:text-discord-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-discord-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-discord-primary transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 DiscordHub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;