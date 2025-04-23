const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js') && file !== 'compile.js');

for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute" requerida.`);
    }
}

const rest = new REST().setToken(process.env.TOKEN);

async function deployGuild() {
    try {
        console.log(`Iniciando o refresh de ${commands.length} comandos (/) na guild de teste.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`Comandos registrados com sucesso (${data.length} comandos)!`);
        setTimeout(() => process.exit(0), 1000); // Delay para garantir que logs sejam escritos
    } catch (error) {
        console.error('Erro ao fazer deploy dos comandos:', error);
        setTimeout(() => process.exit(1), 1000);
    }
}

async function deployGlobal() {
    try {
        console.log(`Iniciando o refresh de ${commands.length} comandos (/) globalmente.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Comandos registrados globalmente com sucesso (${data.length} comandos)!`);
        setTimeout(() => process.exit(0), 1000);
    } catch (error) {
        console.error('Erro ao fazer deploy dos comandos:', error);
        setTimeout(() => process.exit(1), 1000);
    }
}

async function clearCommands() {
    try {
        console.log('Limpando todos os comandos...');
        
        await Promise.all([
            rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] }),
            rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] })
        ]);

        console.log('Todos os comandos foram limpos com sucesso!');
        setTimeout(() => process.exit(0), 1000);
    } catch (error) {
        console.error('Erro ao limpar comandos:', error);
        setTimeout(() => process.exit(1), 1000);
    }
}

// Função principal para execução
async function main() {
    const deployType = process.argv[2];

    try {
        switch (deployType) {
            case 'guild':
                await deployGuild();
                break;
            case 'global':
                await deployGlobal();
                break;
            case 'clear':
                await clearCommands();
                break;
            default:
                console.log('Por favor, especifique "guild", "global" ou "clear" como argumento.');
                setTimeout(() => process.exit(1), 1000);
        }
    } catch (error) {
        console.error('Erro inesperado:', error);
        setTimeout(() => process.exit(1), 1000);
    }
}

// Inicia o processo
main();