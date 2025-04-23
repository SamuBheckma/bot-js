require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const processes = new Map();

// Carrega comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else if (file === 'compile.js') {
        // Tratamento especial para o comando compile que permanece como mensagem
        client.commands.set('compile', command);
    }
}

// Evento ready
client.once('ready', () => {
    console.log(`🚀 Bot online como ${client.user.tag}`);
});

// Handler de interações
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, processes);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Houve um erro ao executar este comando!',
            ephemeral: true
        });
    }
});

// Handler de mensagens (apenas para o comando compile)
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith("```js")) {
        const command = client.commands.get("compile");
        if (command) {
            try {
                await command.execute(message, [], processes);
            } catch (err) {
                console.error(`❌ Erro ao executar o comando 'compile':`, err);
            }
        }
    }
});

client.on('debug', (info) => {
    if (info.includes('Kill')) {
        console.log('Debug - Kill:', info);
    }
});

client.login(process.env.TOKEN);