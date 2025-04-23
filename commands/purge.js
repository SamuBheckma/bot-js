const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Apaga um número específico de mensagens')
    .addIntegerOption(option => 
      option.setName('quantidade')
        .setDescription('Número de mensagens para apagar (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)),

  async execute(interaction) {
    const amount = interaction.options.getInteger('quantidade');
    
    try {
      const messages = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ 
        content: `✅ ${messages.size} mensagens foram apagadas.`,
        flags: ['Ephemeral']
      });
    } catch (error) {
      await interaction.reply({ 
        content: '❌ Erro ao tentar apagar mensagens. Certifique-se que as mensagens não são mais antigas que 14 dias.',
        ephemeral: true
      });
    }
  }
};