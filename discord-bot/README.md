# DiscordHub Bot

Bot Discord para o sistema de bump de servidores do DiscordHub.

## 📋 Pré-requisitos

- Node.js 16+ instalado
- Bot Discord criado no [Discord Developer Portal](https://discord.com/developers/applications)
- Token do bot configurado

## 🚀 Instalação

1. **Clone ou baixe os arquivos**
2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env`
   - Adicione seu token do Discord:
   ```env
   DISCORD_TOKEN=seu_token_aqui
   ```

4. **Inicie o bot:**
   ```bash
   npm start
   ```

## 🔧 Configuração do Bot Discord

### 1. Criar Aplicação
- Acesse [Discord Developer Portal](https://discord.com/developers/applications)
- Clique em "New Application"
- Dê um nome para sua aplicação

### 2. Criar Bot
- Vá na aba "Bot"
- Clique em "Add Bot"
- Copie o **Token** e adicione no arquivo `.env`

### 3. Configurar Permissões
Ative as seguintes **Privileged Gateway Intents**:
- ✅ Server Members Intent
- ✅ Message Content Intent

### 4. Convidar Bot
- Vá na aba "OAuth2" > "URL Generator"
- Marque **"bot"** e **"applications.commands"** em Scopes
- Em Bot Permissions, marque:
  - ✅ Send Messages
  - ✅ Use Slash Commands
  - ✅ Read Message History
  - ✅ Embed Links
  - ✅ Add Reactions

## 📚 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `/bump` | Divulga o servidor na plataforma |
| `/cooldown` | Verifica tempo para próximo bump |
| `/verificar` | Verifica se servidor está cadastrado |
| `/info` | Informações sobre o DiscordHub |
| `/ajuda` | Lista todos os comandos |

## 🔄 Sistema de Cooldowns

- **Servidor**: 1 hora entre bumps
- **Usuário**: 2 horas entre bumps

## 🛠️ Desenvolvimento

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 🌐 Conexão com DiscordHub

O bot se conecta automaticamente com:
- **Site**: https://discordhub.lovable.app
- **API**: Supabase Edge Functions
- **Banco**: PostgreSQL via Supabase

## 📝 Logs

O bot registra automaticamente:
- Conexões e desconexões
- Comandos executados
- Erros e status

## ❗ Troubleshooting

### Bot não responde aos comandos
1. Verifique se o token está correto
2. Confirme que as intents estão ativadas
3. Verifique se o bot tem permissões no servidor

### Erro de autenticação
1. Regenere o token no Discord Developer Portal
2. Atualize o arquivo `.env`
3. Reinicie o bot

### Comandos não aparecem
1. Aguarde alguns minutos (comandos globais demoram para sincronizar)
2. Verifique se o bot tem permissão "Use Slash Commands"
3. Reinstale o bot no servidor se necessário

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do console
2. Consulte a documentação do discord.js
3. Verifique se a edge function está funcionando