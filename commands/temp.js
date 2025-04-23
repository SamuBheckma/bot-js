const { Worker } = require("worker_threads");
const path = require("path");
const { SlashCommandBuilder } = require('discord.js');

let tempMode = false;
let tempMessages = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temp')
        .setDescription('Ativa/desativa o modo temporário de mensagens'),
    
    async execute(interaction) {
        try {
            tempMode = !tempMode;

            if (!tempMode) {
                // Desativando o modo temp
                while (tempMessages.length > 0) {
                    const batch = tempMessages.splice(0, 100);
                    await Promise.all(
                        batch.map(async (msgId) => {
                            try {
                                const msg = await interaction.channel.messages.fetch(msgId);
                                if (msg) await msg.delete();
                            } catch (err) {
                                console.log(`Não foi possível deletar mensagem ${msgId}`);
                            }
                        })
                    );
                }

                await interaction.reply({
                    embeds: [{
                        color: 0xff0000,
                        title: "🕒 Modo Temporário",
                        description: "Modo temporário agora está: **Desativado ❌**"
                    }],
                    flags: ['Ephemeral']
                });
            } else {
                await interaction.reply({
                    embeds: [{
                        color: 0x00ff00,
                        title: "🕒 Modo Temporário",
                        description: "Modo temporário agora está: **Ativado ✅**"
                    }],
                    flags: ['Ephemeral']
                });
            }
        } catch (error) {
            console.error("Erro no comando temp:", error);
            tempMode = false;
            tempMessages = [];
            await interaction.reply({ 
                content: 'Ocorreu um erro ao executar o comando.',
                flags: ['Ephemeral']
            });
        }
    },

    getTempStatus: () => tempMode,
    addTempMessage: (msgId) => {
        if (tempMode && msgId) {
            tempMessages.push(msgId);
            if (tempMessages.length > 100) {
                tempMessages = tempMessages.slice(-100);
            }
        }
    }
};