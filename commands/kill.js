const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kill')
        .setDescription('Encerra uma execução de código')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID da execução para encerrar')
                .setRequired(false)),

    async execute(interaction, processes) {
        const executionId = interaction.options.getInteger('id');

        if (!executionId) {
            const activeProcesses = Array.from(processes.entries())
                .filter(([key, value]) => key !== "sharedContext" && value.worker);

            if (activeProcesses.length === 0) {
                return interaction.reply({
                    embeds: [{
                        color: 0xff0000,
                        title: "❌ Nenhuma Execução Ativa",
                        description: "Não há execuções em andamento no momento."
                    }],
                    ephemeral: true
                });
            }

            const outputDescriptions = activeProcesses.map(([id, process]) => {
                const outputs = process.outputs || [];
                return `**ID:** ${id}\n**Outputs:**\n\`\`\`\n${outputs.join('\n') || 'Nenhum output ainda'}\`\`\``;
            }).join('\n\n');

            return interaction.reply({
                embeds: [{
                    color: 0x00ff00,
                    title: "⚙️ Execuções Ativas",
                    description: `${outputDescriptions}\n\nUse \`/kill id:<número>\` para cancelar uma execução.`
                }],
                ephemeral: true
            });
        }

        const process = processes.get(executionId);
        if (!process?.worker) {
            return interaction.reply({
                embeds: [{
                    color: 0xff0000,
                    title: "❌ Execução Não Encontrada",
                    description: `Não foi encontrada nenhuma execução com o ID **${executionId}**.`
                }],
                ephemeral: true
            });
        }

        try {
            const outputs = process.outputs || [];
            process.worker.terminate();
            processes.delete(executionId);

            await interaction.reply({
                embeds: [{
                    color: 0x00ff00,
                    title: "✅ Execução Cancelada",
                    description: `A execução **${executionId}** foi cancelada.\n\n**Outputs até o momento:**\n\`\`\`\n${outputs.join('\n') || 'Nenhum output gerado'}\`\`\``
                }],
                ephemeral: true
            });
        } catch (err) {
            console.error(`Erro ao terminar execução ${executionId}:`, err);
            await interaction.reply({
                content: "Ocorreu um erro ao tentar cancelar a execução.",
                ephemeral: true
            });
        }
    }
};