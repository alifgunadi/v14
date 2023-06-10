require('dotenv').config();
const { Client, Collection, GatewayIntentBits, ActivityType } = require("discord.js");
const { Configuration, OpenAIApi } = require('openai')
const fs = require("fs");

const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;

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
    const functionFiles = fs.readdirSync(`./src/functions/${folder}`).filter(file => file.endsWith(".js"));
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

    client.user.setPresence({
        activities: [{ name: `MavenPeace Server`, type: ActivityType.Watching }],
        status: 'dnd',
      });
});

const configuration = new Configuration({
    apiKey: process.env.API_CHAT_AI
});

const prefix = "$";

const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== channelId) return;
    if (message.content.startsWith(prefix)) return;

    const mentionedUsers = message.mentions.users;
    const botMentioned = mentionedUsers.has(client.user.id);
    if (!botMentioned) return;

    let conversationLog = [
        { role: "system", content: "You are a MavenPeace chat bot, people call you is Maven and you are made by alifgunadi."}
    ];

    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();
    prevMessages.forEach((msg) => {
        if (message.content.startsWith(prefix)) return;
        if (msg.author.id !== client.user.id && message.author.bot) return;
        if (msg.author.id !== message.author.id) return;

        conversationLog.push({
            role: "user",
            content: msg.content,
        })
    })

    conversationLog.push({
        role: 'user',
        content: message.content,
    });

    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog
    });

    message.reply(result.data.choices[0].message);
});

client.on('guildMemberAdd', (member) => {
    updateMemberCount(member.guild);
});

async function updateMemberCount(guild) {
    setInterval(() => {
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
    }, 300000);
};


client.login(token);
