const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check my ping.."),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    const newMessage = (`${interaction.user}\nAPI Latency: ${client.ws.ping}\nClient Ping: ${
      message.createdTimestamp - interaction.createdTimestamp
    }`);
    await interaction.editReply({
      content: newMessage,
    });
  },
};
