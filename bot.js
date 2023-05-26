require('dotenv').config();
const { token } = process.env;
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ] 
});
client.commands = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter(file => file.endsWith(".js"));
    for (const file of functionFiles)
        require(`./src/functions/${folder}/${file}`)(client);
};

client.handleEvents();
client.handleCommands();

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} is online.`);
  
    const guild = client.guilds.cache.get('878161228751568946');
    if (guild) {
        updateMemberCount(guild);
    } else {
        console.log('Guild not found');
    };

    client.user.setStatus('dnd');
    client.user.setActivity('your screen');

    // client.user.setPresence({
    //     status: 'dnd',
    //     activity: {
    //         name: "your screen",
    //         type: 'WATCHING'
    //     }
    // });
});

client.on('guildMemberAdd', (member) => {
    updateMemberCount(member.guild);
});

async function updateMemberCount(guild) {
    const totalUsers = guild.memberCount;
    const members = guild.members.cache.filter(member => !member.user.bot).size;
    const bots = guild.members.cache.filter(member => member.user.bot).size;
    const onlineUsers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
    const dndUsers = guild.members.cache.filter(member => member.presence?.status === 'dnd').size;
    const idleUsers = guild.members.cache.filter(member => member.presence?.status === 'idle').size;


    const totalUsersChannel = guild.channels.cache.get('1109079433387716628');
    if (totalUsersChannel) {
        totalUsersChannel.setName(`👥・All members: ${totalUsers}`)
            .catch(console.error);
    } else {
        console.log('Total Users channel not found');
    }

    const membersChannel = guild.channels.cache.get('1109079465251840132');
    if (membersChannel) {
        membersChannel.setName(`👥・Members: ${members}`)
            .catch(console.error);
    } else {
        console.log('Members channel not found');
    }

    const botsChannel = guild.channels.cache.get('1109079483450921110');
    if (botsChannel) {
        botsChannel.setName(`🤖・Bots: ${bots}`)
            .catch(console.error);
    } else {
        console.log('Bots channel not found');
    };

    const userCheckerChannel = guild.channels.cache.get('1111583269578883113');
    if (userCheckerChannel) {
        userCheckerChannel.setName(`🟢・${onlineUsers} ⛔️・${dndUsers} 🌙・${idleUsers}`)
            .catch(console.error);
    } else {
        console.log('User checker channel not found');
    }
};


client.login(token);
