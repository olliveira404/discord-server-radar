import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Server, Users, Trash2 } from "lucide-react";
import AddServerModal from "@/components/AddServerModal";

interface UserServer {
  id: string;
  name: string;
  description: string;
  member_count: number;
  tags: string[];
  last_bump: string;
  icon_url?: string;
  invite_code: string;
  discord_server_id: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [userServers, setUserServers] = useState<UserServer[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserServers();
    }
  }, [user]);

  const fetchUserServers = async () => {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserServers(data || []);
    } catch (error) {
      console.error('Error fetching user servers:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar seus servidores",
        variant: "destructive"
      });
    } finally {
      setIsLoadingServers(false);
    }
  };


  const handleDeleteServer = async (serverId: string) => {
    try {
      const { error } = await supabase
        .from('servers')
        .update({ is_active: false })
        .eq('id', serverId);

      if (error) throw error;

      toast({
        title: "Servidor removido",
        description: "Servidor removido da plataforma"
      });

      fetchUserServers();
    } catch (error) {
      console.error('Error deleting server:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover servidor",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p>Você precisa estar logado para acessar esta página.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
              <p className="text-muted-foreground">
                Gerencie seus servidores cadastrados ({userServers.length}/3)
              </p>
            </div>
            
            {userServers.length < 3 && (
              <Button 
                onClick={() => setShowAddModal(true)}
                variant="discord"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Servidor
              </Button>
            )}
          </div>

          <AddServerModal
            open={showAddModal}
            onOpenChange={setShowAddModal}
            onServerAdded={fetchUserServers}
          />

          {/* User Servers */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Meus Servidores</h2>
            
            {isLoadingServers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userServers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Server className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum servidor cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione seu primeiro servidor para começar a divulgar!
                  </p>
                  <Button onClick={() => setShowAddModal(true)} variant="discord">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Servidor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userServers.map((server) => (
                  <Card key={server.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {server.icon_url ? (
                            <img 
                              src={server.icon_url} 
                              alt={server.name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-discord rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {server.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-foreground">{server.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              {server.member_count.toLocaleString()} membros
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteServer(server.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {server.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {server.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;