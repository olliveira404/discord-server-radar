import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BumpRequest {
  guildId: string;
  userId: string;
  username: string;
  channelId: string;
}

interface CooldownCheck {
  canBump: boolean;
  serverCooldown?: number;
  userCooldown?: number;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname === '/bump' && req.method === 'POST') {
      return await handleBump(req, supabase);
    } else if (pathname === '/check-cooldown' && req.method === 'POST') {
      return await handleCooldownCheck(req, supabase);
    } else if (pathname === '/verify-server' && req.method === 'POST') {
      return await handleServerVerification(req, supabase);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleBump(req: Request, supabase: any) {
  const { guildId, userId, username, channelId }: BumpRequest = await req.json();

  console.log(`Bump request - Guild: ${guildId}, User: ${userId}`);

  // Check if server exists and is registered
  const { data: server, error: serverError } = await supabase
    .from('servers')
    .select('*')
    .eq('discord_server_id', guildId)
    .eq('is_active', true)
    .single();

  if (serverError || !server) {
    console.log(`Server not found: ${guildId}`);
    return new Response(JSON.stringify({
      success: false,
      message: "❌ Este servidor ainda não foi cadastrado na plataforma! Peça ao dono do servidor para cadastrá-lo em nosso site."
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check cooldowns
  const cooldownCheck = await checkCooldowns(supabase, guildId, userId);
  if (!cooldownCheck.canBump) {
    console.log(`Cooldown active - ${cooldownCheck.message}`);
    return new Response(JSON.stringify({
      success: false,
      message: cooldownCheck.message
    }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Perform bump
  try {
    // Update server last_bump time
    const { error: updateError } = await supabase
      .from('servers')
      .update({ last_bump: new Date().toISOString() })
      .eq('id', server.id);

    if (updateError) throw updateError;

    // Log the bump
    const { error: logError } = await supabase
      .from('bump_logs')
      .insert({
        server_id: server.id,
        user_id: userId,
        bumped_at: new Date().toISOString()
      });

    if (logError) throw logError;

    console.log(`Bump successful - Server: ${server.name}, User: ${username}`);

    return new Response(JSON.stringify({
      success: true,
      message: `🚀 **${server.name}** foi divulgado com sucesso!\n\n✅ Próximo bump disponível em: **1 hora**\n🔄 Você pode usar /bump novamente em: **2 horas**\n\n💡 Ajude a manter o servidor ativo fazendo bump regularmente!`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error during bump:', error);
    return new Response(JSON.stringify({
      success: false,
      message: "❌ Erro interno. Tente novamente em alguns minutos."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleCooldownCheck(req: Request, supabase: any): Promise<Response> {
  const { guildId, userId }: { guildId: string; userId: string } = await req.json();
  
  const cooldownCheck = await checkCooldowns(supabase, guildId, userId);
  
  return new Response(JSON.stringify(cooldownCheck), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleServerVerification(req: Request, supabase: any): Promise<Response> {
  const { guildId }: { guildId: string } = await req.json();

  const { data: server, error } = await supabase
    .from('servers')
    .select('name, is_active')
    .eq('discord_server_id', guildId)
    .single();

  if (error || !server) {
    return new Response(JSON.stringify({
      registered: false,
      message: "Este servidor não está cadastrado na plataforma."
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    registered: true,
    active: server.is_active,
    name: server.name,
    message: server.is_active ? "Servidor registrado e ativo!" : "Servidor registrado mas inativo."
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function checkCooldowns(supabase: any, guildId: string, userId: string): Promise<CooldownCheck> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // Get server info
  const { data: server } = await supabase
    .from('servers')
    .select('id, last_bump, name')
    .eq('discord_server_id', guildId)
    .single();

  if (!server) {
    return {
      canBump: false,
      message: "❌ Servidor não encontrado na plataforma."
    };
  }

  // Check server cooldown (1 hour)
  const lastBump = new Date(server.last_bump);
  if (lastBump > oneHourAgo) {
    const timeLeft = Math.ceil((lastBump.getTime() + 60 * 60 * 1000 - now.getTime()) / (1000 * 60));
    return {
      canBump: false,
      serverCooldown: timeLeft,
      message: `⏰ **${server.name}** já foi divulgado recentemente!\n\n🕐 Próximo bump disponível em: **${timeLeft} minuto(s)**\n\n💡 O cooldown é de 1 hora por servidor para manter a qualidade das divulgações.`
    };
  }

  // Check user cooldown (2 hours)
  const { data: userBumps } = await supabase
    .from('bump_logs')
    .select('bumped_at')
    .eq('user_id', userId)
    .gte('bumped_at', twoHoursAgo.toISOString())
    .order('bumped_at', { ascending: false })
    .limit(1);

  if (userBumps && userBumps.length > 0) {
    const lastUserBump = new Date(userBumps[0].bumped_at);
    const timeLeft = Math.ceil((lastUserBump.getTime() + 2 * 60 * 60 * 1000 - now.getTime()) / (1000 * 60));
    return {
      canBump: false,
      userCooldown: timeLeft,
      message: `⏰ Você já fez um bump recentemente!\n\n🕐 Você pode usar /bump novamente em: **${timeLeft} minuto(s)**\n\n💡 O cooldown pessoal é de 2 horas para evitar spam.`
    };
  }

  return {
    canBump: true,
    message: "✅ Pronto para fazer bump!"
  };
}