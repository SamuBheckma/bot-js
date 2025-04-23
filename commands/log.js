const { SlashCommandBuilder } = require('discord.js');
const { getUserLevel, getUptime } = require("../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Mostra informações sobre o status do bot'),

    async execute(interaction) {
        const tempCommand = require("./temp");
        const latency = Date.now() - interaction.createdTimestamp;

        await interaction.reply({
            embeds: [{
                color: 0x00ff00,
                title: "📊 Status do Bot",
                description: `**Nível:** ${getUserLevel(interaction.user.id)}\n**Temp:** ${
                    tempCommand.getTempStatus() ? "Ativado ✅" : "Desativado ❌"
                }\n**Uptime:** ${getUptime()}\n**Latência:** ${latency}ms`
            }],
            flags: ['Ephemeral']
        });
    }
};
