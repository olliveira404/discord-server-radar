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
        
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['anime', 'games', 'música', 'arte', 'estudos', 'tecnologia', 'memes', 'comunidade'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 bg-discord-primary/10 hover:bg-discord-primary/20 text-discord-primary border border-discord-primary/30 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
              onClick={() => {
                // Scroll to search section and populate with tag
                const searchSection = document.querySelector('main');
                searchSection?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                  const searchInput = document.querySelector('input[placeholder*="pesquisar"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.value = tag;
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }, 500);
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;