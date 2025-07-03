import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AddServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServerAdded: () => void;
}

const AddServerModal = ({ open, onOpenChange, onServerAdded }: AddServerModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    discord_server_id: "",
    name: "",
    description: "",
    member_count: "",
    invite_code: "",
    icon_url: "",
    tags: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
        .slice(0, 5);

      const { error } = await supabase.from('servers').insert({
        discord_server_id: formData.discord_server_id,
        name: formData.name,
        description: formData.description,
        member_count: parseInt(formData.member_count) || 0,
        owner_id: user.id,
        invite_code: formData.invite_code,
        icon_url: formData.icon_url || null,
        tags: tags
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Servidor adicionado com sucesso"
      });

      setFormData({
        discord_server_id: "",
        name: "",
        description: "",
        member_count: "",
        invite_code: "",
        icon_url: "",
        tags: ""
      });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ID do Servidor Discord *
              </label>
              <Input
                value={formData.discord_server_id}
                onChange={(e) => setFormData({...formData, discord_server_id: e.target.value})}
                placeholder="123456789123456789"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome do Servidor *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Meu Servidor Incrível"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descrição *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição do seu servidor..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Código do Convite *
              </label>
              <Input
                value={formData.invite_code}
                onChange={(e) => setFormData({...formData, invite_code: e.target.value})}
                placeholder="abcdef123"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Número de Membros *
              </label>
              <Input
                type="number"
                value={formData.member_count}
                onChange={(e) => setFormData({...formData, member_count: e.target.value})}
                placeholder="100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              URL do Ícone (opcional)
            </label>
            <Input
              value={formData.icon_url}
              onChange={(e) => setFormData({...formData, icon_url: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (máximo 5, separadas por vírgula) *
            </label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="anime, games, comunidade, brasil"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
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