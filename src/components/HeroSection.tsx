import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 text-center bg-gradient-hero">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-discord-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-discord-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-discord bg-clip-text text-transparent">
            Descubra
          </span>
          <br />
          <span className="text-foreground">
            Servidores Incríveis
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          A maior plataforma de divulgação de servidores Discord do Brasil. 
          Encontre comunidades perfeitas para você ou promova seu servidor para milhares de usuários.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="discord" 
            size="lg" 
            className="text-lg px-8 py-4 hover:animate-glow"
          >
            🚀 Adicionar Meu Servidor
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-4 border-discord-primary/30 hover:border-discord-primary hover:bg-discord-primary/10"
          >
            📊 Ver Ranking
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-discord-primary">10,000+</div>
            <div className="text-muted-foreground">Servidores cadastrados</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-discord-secondary">50,000+</div>
            <div className="text-muted-foreground">Usuários ativos</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-discord-success">1M+</div>
            <div className="text-muted-foreground">Conexões realizadas</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;