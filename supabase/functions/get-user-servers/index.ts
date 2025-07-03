import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  approximate_member_count?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    // Get user's Discord access token from metadata
    const discordAccessToken = user.user_metadata?.provider_token

    if (!discordAccessToken) {
      throw new Error('Token do Discord não encontrado')
    }

    // Fetch user's guilds from Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${discordAccessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar servidores do Discord')
    }

    const guilds: DiscordGuild[] = await response.json()

    // Filter only guilds where user is owner and has icon
    const ownedGuildsWithIcon = guilds.filter(guild => 
      guild.owner && guild.icon !== null
    )

    // Get already added servers from database
    const { data: existingServers } = await supabaseClient
      .from('servers')
      .select('discord_server_id')
      .eq('owner_id', user.id)
      .eq('is_active', true)

    const existingServerIds = existingServers?.map(s => s.discord_server_id) || []

    // Filter out already added servers
    const availableServers = ownedGuildsWithIcon
      .filter(guild => !existingServerIds.includes(guild.id))
      .map(guild => ({
        id: guild.id,
        name: guild.name,
        icon_url: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
        member_count: guild.approximate_member_count || 0
      }))

    return new Response(
      JSON.stringify({ servers: availableServers }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error fetching Discord servers:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})