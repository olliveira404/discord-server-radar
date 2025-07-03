import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import ServerCard from "@/components/ServerCard";

// Mock data for demonstration
const mockServers = [
  {
    id: "1",
    name: "Anime Central",
    description: "A maior comunidade de anime do Discord! Discuta seus animes favoritos, participe de eventos e faça novos amigos otakus.",
    members: 15420,
    tags: ["anime", "manga", "otaku", "jogos", "comunidade"],
    lastBump: "2024-01-15T10:30:00Z",
    icon: "",
    inviteCode: "animeCentral123"
  },
  {
    id: "2", 
    name: "Gaming Squad BR",
    description: "Servidor dedicado a jogadores brasileiros. Encontre seu squad, participe de campeonatos e descubra novos games!",
    members: 8760,
    tags: ["games", "esports", "competitivo", "brasil", "squad"],
    lastBump: "2024-01-15T08:15:00Z",
    icon: "",
    inviteCode: "gamingSquad456"
  },
  {
    id: "3",
    name: "Tech Talk",
    description: "Comunidade de desenvolvedores e entusiastas de tecnologia. Compartilhe conhecimento e cresça profissionalmente.",
    members: 5230,
    tags: ["programação", "tech", "desenvolvimento", "carreira", "estudos"],
    lastBump: "2024-01-15T06:45:00Z", 
    icon: "",
    inviteCode: "techTalk789"
  },
  {
    id: "4",
    name: "Arte & Criatividade",
    description: "Espaço para artistas digitais, tradicionais e criativos em geral. Compartilhe suas obras e inspire-se!",
    members: 3450,
    tags: ["arte", "design", "criatividade", "desenho", "digital"],
    lastBump: "2024-01-15T05:20:00Z",
    icon: "",
    inviteCode: "arteCreate101"
  },
  {
    id: "5",
    name: "Música Brasileira",
    description: "Celebre a música nacional! Desde MPB até funk, sertanejo e rock brasileiro. Todos os ritmos são bem-vindos.",
    members: 2890,
    tags: ["música", "brasil", "mpb", "rock", "cultura"],
    lastBump: "2024-01-15T04:10:00Z",
    icon: "",
    inviteCode: "musicaBR202"
  },
  {
    id: "6",
    name: "Estudos & Vestibular",
    description: "Grupo de estudos colaborativo para vestibular, ENEM e concursos. Vamos conquistar nossos objetivos juntos!",
    members: 6780,
    tags: ["estudos", "vestibular", "enem", "concursos", "educação"],
    lastBump: "2024-01-15T03:00:00Z",
    icon: "",
    inviteCode: "estudos303"
  }
];

const Index = () => {
  const [filteredServers, setFilteredServers] = useState(mockServers);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (query: string, sortBy: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered = [...mockServers];
      
      // Filter by search query
      if (query.trim()) {
        const keywords = query.toLowerCase().split(' ').filter(k => k.length > 0);
        filtered = filtered.filter(server => 
          keywords.every(keyword =>
            server.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
            server.name.toLowerCase().includes(keyword) ||
            server.description.toLowerCase().includes(keyword)
          )
        );
      }
      
      // Sort results
      switch (sortBy) {
        case "recent":
          filtered.sort((a, b) => new Date(b.lastBump).getTime() - new Date(a.lastBump).getTime());
          break;
        case "members":
          filtered.sort((a, b) => b.members - a.members);
          break;
        case "name":
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
      
      setFilteredServers(filtered);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <SearchBar onSearch={handleSearch} />
        
        {/* Results Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Servidores em Destaque
            </h2>
            <div className="text-sm text-muted-foreground">
              {filteredServers.length} servidor(es) encontrado(s)
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
              {filteredServers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>
          )}
          
          {!isLoading && filteredServers.length === 0 && (
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