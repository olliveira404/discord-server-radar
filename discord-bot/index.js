const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Configurações
const EDGE_FUNCTION_URL = process.env.EDGE_FUNCTION_URL || 'https://ngwyufwsznapmzcvvjrn.supabase.co/functions/v1/discord-bot';
const WEBSITE_URL = 'https://discordhub.lovable.app'; // Substitua pela URL do seu site

// Comandos slash
const commands = [
    new SlashCommandBuilder()
        .setName('bump')
        .setDescription('Divulga seu servidor na plataforma DiscordHub'),
    
    new SlashCommandBuilder()
        .setName('info')
        .setDescription('Informações sobre o DiscordHub'),
    
    new SlashCommandBuilder()
        .setName('cooldown')
        .setDescription('Verifica o tempo de cooldown para próximo bump'),
    
    new SlashCommandBuilder()
        .setName('verificar')
        .setDescription('Verifica se o servidor está registrado na plataforma'),
    
    new SlashCommandBuilder()
        .setName('ajuda')
        .setDescription('Mostra todos os comandos disponíveis')
];

// Registrar comandos
async function registerCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        console.log('Registrando comandos slash...');
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        
        console.log('✅ Comandos registrados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
}

// Função para fazer requisições à edge function
async function callEdgeFunction(endpoint, data) {
    try {
        const response = await fetch(`${EDGE_FUNCTION_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { success: false, message: 'Erro interno. Tente novamente.' };
    }
}

// Event: Bot online
client.once('ready', async () => {
    console.log(`🚀 Bot online como ${client.user.tag}!`);
    console.log(`📊 Presente em ${client.guilds.cache.size} servidores`);
    
    // Registrar comandos
    await registerCommands();
    
    // Definir atividade
    client.user.setActivity('🚀 /bump para divulgar!', { type: 'WATCHING' });
});

// Event: Interações
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, guild, user, channel } = interaction;

    try {
        switch (commandName) {
            case 'bump':
                await handleBumpCommand(interaction);
                break;
            
            case 'cooldown':
                await handleCooldownCommand(interaction);
                break;
            
            case 'verificar':
                await handleVerifyCommand(interaction);
                break;
            
            case 'info':
                await handleInfoCommand(interaction);
                break;
            
            case 'ajuda':
                await handleHelpCommand(interaction);
                break;
        }
    } catch (error) {
        console.error('Erro ao processar comando:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Erro')
            .setDescription('Ocorreu um erro interno. Tente novamente.')
            .setTimestamp();
        
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

// Handler: Comando Bump
async function handleBumpCommand(interaction) {
    await interaction.deferReply();
    
    const result = await callEdgeFunction('/bump', {
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        username: interaction.user.username,
        channelId: interaction.channel.id
    });
    
    const embed = new EmbedBuilder()
        .setTimestamp()
        .setFooter({ text: 'DiscordHub • Sistema de Bump' });
    
    if (result.success) {
        embed
            .setColor('#00FF00')
            .setTitle('🚀 Bump Realizado!')
            .setDescription(result.message)
            .setThumbnail(interaction.guild.iconURL());
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 Visitar Site')
                    .setURL(WEBSITE_URL)
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('📊 Ver Cooldown')
                    .setCustomId('check_cooldown')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        await interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        embed
            .setColor('#FF0000')
            .setTitle('❌ Bump Falhou')
            .setDescription(result.message);
        
        if (result.message.includes('não foi cadastrado')) {
            const registerButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('📝 Cadastrar Servidor')
                        .setURL(`${WEBSITE_URL}/profile`)
                        .setStyle(ButtonStyle.Link)
                );
            
            await interaction.editReply({ embeds: [embed], components: [registerButton] });
        } else {
            await interaction.editReply({ embeds: [embed] });
        }
    }
}

// Handler: Comando Cooldown
async function handleCooldownCommand(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const result = await callEdgeFunction('/check-cooldown', {
        guildId: interaction.guild.id,
        userId: interaction.user.id
    });
    
    const embed = new EmbedBuilder()
        .setColor(result.canBump ? '#00FF00' : '#FFA500')
        .setTitle('⏰ Status do Cooldown')
        .setDescription(result.message)
        .setTimestamp()
        .setFooter({ text: 'DiscordHub • Sistema de Cooldown' });
    
    if (result.canBump) {
        embed.addFields({
            name: '✅ Pronto!',
            value: 'Você pode usar `/bump` agora!',
            inline: true
        });
    }
    
    await interaction.editReply({ embeds: [embed] });
}

// Handler: Comando Verificar
async function handleVerifyCommand(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const result = await callEdgeFunction('/verify-server', {
        guildId: interaction.guild.id
    });
    
    const embed = new EmbedBuilder()
        .setTitle('🔍 Verificação do Servidor')
        .setTimestamp()
        .setFooter({ text: 'DiscordHub • Verificação' });
    
    if (result.registered) {
        embed
            .setColor(result.active ? '#00FF00' : '#FFA500')
            .setDescription(result.message)
            .addFields(
                { name: '📋 Nome', value: result.name, inline: true },
                { name: '✅ Status', value: result.active ? 'Ativo' : 'Inativo', inline: true }
            );
    } else {
        embed
            .setColor('#FF0000')
            .setDescription(result.message)
            .addFields({
                name: '📝 Como cadastrar?',
                value: `Acesse [nosso site](${WEBSITE_URL}/profile) e cadastre seu servidor!`
            });
    }
    
    await interaction.editReply({ embeds: [embed] });
}

// Handler: Comando Info
async function handleInfoCommand(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🌟 DiscordHub')
        .setDescription('A maior plataforma de divulgação de servidores Discord do Brasil!')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            {
                name: '🚀 Como funciona?',
                value: 'Use `/bump` para divulgar seu servidor na nossa plataforma e atrair novos membros!',
                inline: false
            },
            {
                name: '⏰ Cooldowns',
                value: '• **Servidor**: 1 hora entre bumps\n• **Usuário**: 2 horas entre bumps',
                inline: true
            },
            {
                name: '📊 Estatísticas',
                value: `• **Servidores**: ${client.guilds.cache.size}\n• **Usuários**: ${client.users.cache.size}`,
                inline: true
            },
            {
                name: '🔗 Links Úteis',
                value: `[🌐 Site](${WEBSITE_URL}) • [📝 Cadastrar](${WEBSITE_URL}/profile) • [🔍 Buscar](${WEBSITE_URL}/search)`,
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'DiscordHub • Sistema de Divulgação' });
    
    await interaction.reply({ embeds: [embed] });
}

// Handler: Comando Ajuda
async function handleHelpCommand(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📚 Comandos Disponíveis')
        .setDescription('Lista de todos os comandos do DiscordHub Bot')
        .addFields(
            {
                name: '🚀 `/bump`',
                value: 'Divulga seu servidor na plataforma',
                inline: true
            },
            {
                name: '⏰ `/cooldown`',
                value: 'Verifica tempo para próximo bump',
                inline: true
            },
            {
                name: '🔍 `/verificar`',
                value: 'Verifica se servidor está cadastrado',
                inline: true
            },
            {
                name: '🌟 `/info`',
                value: 'Informações sobre o DiscordHub',
                inline: true
            },
            {
                name: '📚 `/ajuda`',
                value: 'Mostra esta mensagem',
                inline: true
            },
            {
                name: '💡 Dica',
                value: `Para cadastrar seu servidor, acesse: [${WEBSITE_URL}/profile](${WEBSITE_URL}/profile)`,
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'DiscordHub • Sistema de Ajuda' });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Handler: Interações de botões
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    
    if (interaction.customId === 'check_cooldown') {
        await handleCooldownCommand(interaction);
    }
});

// Event: Bot entra em um servidor
client.on('guildCreate', guild => {
    console.log(`✅ Bot adicionado ao servidor: ${guild.name} (${guild.id})`);
    
    // Enviar mensagem de boas-vindas se possível
    const channel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'));
    
    if (channel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎉 Obrigado por me adicionar!')
            .setDescription(`Olá! Eu sou o **DiscordHub Bot**!\n\nUse \`/bump\` para divulgar este servidor na nossa plataforma e atrair novos membros!`)
            .addFields(
                {
                    name: '🚀 Primeiros passos',
                    value: `1. Cadastre seu servidor em [${WEBSITE_URL}/profile](${WEBSITE_URL}/profile)\n2. Use \`/bump\` para divulgar\n3. Atraia novos membros!`
                },
                {
                    name: '❓ Precisa de ajuda?',
                    value: 'Use `/ajuda` para ver todos os comandos disponíveis!'
                }
            )
            .setTimestamp();
        
        channel.send({ embeds: [welcomeEmbed] }).catch(console.error);
    }
});

// Event: Bot sai de um servidor
client.on('guildDelete', guild => {
    console.log(`❌ Bot removido do servidor: ${guild.name} (${guild.id})`);
});

// Error handling
client.on('error', error => {
    console.error('❌ Erro no cliente Discord:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Erro não tratado:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN);