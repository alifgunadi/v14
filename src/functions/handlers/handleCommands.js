const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");
const token = process.env.TOKEN;

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
        
      }
    }


    const clientId = '978476535373770794';
    const guildId = '878161228751568946';
    const rest = new REST({ version: "9" }).setToken(token);
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationCommands(clientId, guildId), {
            body: client.commandArray,
        });

        console.log("Successfully reload application (/) commands.");
    } catch (error) {
        console.error(error);
    }
  };
};
