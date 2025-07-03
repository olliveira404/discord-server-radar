
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TagInput from "./TagInput";

interface DiscordServer {
  id: string;
  name: string;
  icon_url: string | null;
  member_count: number;
}

interface AddServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServerAdded: () => void;
}

const AddServerModal = ({ open, onOpenChange, onServerAdded }: AddServerModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const [availableServers, setAvailableServers] = useState<DiscordServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (open && user) {
      fetchUserServers();
    }
  }, [open, user]);

  const fetchUserServers = async () => {
    setIsLoadingServers(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-user-servers');
      
      if (error) throw error;
      
      setAvailableServers(data.servers || []);
    } catch (error: any) {
      console.error('Error fetching user servers:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar seus servidores do Discord",
        variant: "destructive"
      });
    } finally {
      setIsLoadingServers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedServerId || !description.trim() || tags.length === 0) return;

    const selectedServer = availableServers.find(s => s.id === selectedServerId);
    if (!selectedServer) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('servers').insert({
        discord_server_id: selectedServer.id,
        name: selectedServer.name,
        description: description.trim(),
        member_count: selectedServer.member_count,
        owner_id: user.id,
        invite_code: "", // Será preenchido pelo usuário depois
        icon_url: selectedServer.icon_url,
        tags: tags
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Servidor adicionado com sucesso"
      });

      // Reset form
      setSelectedServerId("");
      setDescription("");
      setTags([]);
      onOpenChange(false);
      onServerAdded();
    } catch (error: any) {
      console.error('Error adding server:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar servidor",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Servidor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Selecione seu servidor *
            </label>
            {isLoadingServers ? (
              <div className="text-sm text-muted-foreground">Carregando seus servidores...</div>
            ) : availableServers.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Nenhum servidor disponível. Você precisa ser proprietário ou administrador do servidor.
              </div>
            ) : (
              <Select value={selectedServerId} onValueChange={setSelectedServerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um servidor" />
                </SelectTrigger>
                <SelectContent>
                  {availableServers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      <div className="flex items-center gap-2">
                        {server.icon_url ? (
                          <img 
                            src={server.icon_url} 
                            alt={server.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gradient-discord rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {server.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span>{server.name}</span>
                        <span className="text-muted-foreground text-sm">
                          ({server.member_count.toLocaleString()} membros)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descrição *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu servidor para atrair novos membros..."
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (máximo 5) *
            </label>
            <TagInput
              tags={tags}
              onTagsChange={setTags}
              maxTags={5}
              placeholder="Digite uma tag e pressione Enter..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedServerId || !description.trim() || tags.length === 0} 
              className="flex-1"
            >
              {isSubmitting ? "Adicionando..." : "Adicionar Servidor"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServerModal;
