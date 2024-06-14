"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("./commands/index");
const voice_1 = require("@discordjs/voice");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildMembers,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.GuildVoiceStates,
        discord_js_1.IntentsBitField.Flags.MessageContent,
    ],
});
const dotenv_1 = require("dotenv");
const db_1 = require("./db");
(0, dotenv_1.config)({
    path: "./config.env",
});
const MY_GUILD = process.env.serverId;
const LOGGING_CHANNEL = process.env.serverId;
if (!MY_GUILD || !LOGGING_CHANNEL) {
    console.error("config.envファイルが正しく設定されていません");
    process.exit(1);
}
function updatePresence() {
    var _a;
    (_a = client.user) === null || _a === void 0 ? void 0 : _a.setPresence({
        activities: [
            {
                name: client.guilds.cache.size + "サーバーに導入中",
                state: "/joinコマンドで読み上げを起動できるよ",
            },
        ],
    });
}
client.on("ready", () => {
    var _a, _b, _c, _d, _e;
    let kangping = client.users.cache.get("1028165215579279410");
    if (kangping) {
        kangping.send("discord.jsのバージョンは" + discord_js_1.version);
    }
    (_a = client.user) === null || _a === void 0 ? void 0 : _a.setPresence({
        activities: [
            {
                name: "初期化中",
                type: discord_js_1.ActivityType.Playing,
                state: "クレジットは/creditコマンドで確認してください",
            },
        ],
    });
    let setCommand = new discord_js_1.SlashCommandBuilder()
        .setName("set")
        .setDescription("読み上げの声を指定します")
        .addStringOption((builder) => {
        builder.setName("voice");
        builder.setDescription("声");
        builder.setRequired(true);
        let choices = [];
        choices.push({
            name: "Scratch読み上げ(アルト)",
            value: "Scratch_0",
        });
        choices.push({
            name: "Scratch読み上げ(テノール)",
            value: "Scratch_1",
        });
        choices.push({
            name: "Scratch読み上げ(ネズミ)",
            value: "Scratch_2",
        });
        choices.push({
            name: "Scratch読み上げ(巨人)",
            value: "Scratch_3",
        });
        choices.push({
            name: "Scratch読み上げ(子猫)",
            value: "Scratch_4",
        });
        builder.setChoices(...choices);
        return builder;
    });
    (_b = client.application) === null || _b === void 0 ? void 0 : _b.commands.set([
        new discord_js_1.SlashCommandBuilder()
            .setName("info")
            .setDescription("Botの情報を表示できます。"),
        new discord_js_1.SlashCommandBuilder()
            .setName("credit")
            .setDescription("音声読み上げのクレジットを表示します"),
        new discord_js_1.SlashCommandBuilder()
            .setName("join")
            .setDescription("読み上げを接続します"),
        new discord_js_1.SlashCommandBuilder()
            .setName("exit")
            .setDescription("読み上げを切断します"),
        setCommand,
    ]);
    updatePresence();
    setInterval(updatePresence, 1000 * 10);
    const guild = client.guilds.cache.get(MY_GUILD);
    console.log(`Logged in as ${(_c = client.user) === null || _c === void 0 ? void 0 : _c.tag}!`);
    let channel = client.channels.cache.get(LOGGING_CHANNEL);
    if (channel && "send" in channel) {
        channel.send({
            embeds: [
                {
                    author: {
                        name: `${(_d = client.user) === null || _d === void 0 ? void 0 : _d.tag}`,
                        icon_url: "https://cdn.discordapp.com/attachments/907642837846343681/941851874687062016/icon2.png",
                    },
                    title: `<a:upvote:918371919974248458>${(_e = client.user) === null || _e === void 0 ? void 0 : _e.username}は正常に再起動しました！`,
                    color: 65280,
                    timestamp: new Date().toString(),
                },
            ],
        });
    }
    setInterval(() => {
        var _a;
        (_a = client.user) === null || _a === void 0 ? void 0 : _a.setActivity(`${client.ws.ping}ms | ${guild === null || guild === void 0 ? void 0 : guild.memberCount} members`, { type: discord_js_1.ActivityType.Watching });
    }, 6 * 1000);
});
client.on("interactionCreate", (interaction) => {
    (0, index_1.listener)(interaction);
});
client.on("voiceStateUpdate", (oldState, newState) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if ((_a = oldState.member) === null || _a === void 0 ? void 0 : _a.user.bot)
        return;
    if (((_b = oldState.channel) === null || _b === void 0 ? void 0 : _b.members.size) == 1) {
        if (oldState.guild && oldState.guild.id) {
            if (db_1.session.has(oldState.guild.id) &&
                ((_c = db_1.session.get(oldState.guild.id)) === null || _c === void 0 ? void 0 : _c.joinVoiceChannelId) ==
                    oldState.channelId) {
                const connection = (0, voice_1.getVoiceConnection)(oldState.guild.id);
                if (connection) {
                    connection.destroy();
                }
            }
        }
    }
    else if (oldState.channelId && !newState.channelId) {
        let guildConfig = db_1.session.get(newState.guild.id);
        if (!guildConfig ||
            guildConfig.joinVoiceChannelId != oldState.channelId) {
            return;
        }
        let member = oldState.guild.members.cache.get(oldState.id);
        (0, index_1.speechContent)(((member === null || member === void 0 ? void 0 : member.nickname) || (member === null || member === void 0 ? void 0 : member.user.displayName)) + "が退出しました。", "Scratch_0", guildConfig, oldState.guild.id);
    }
    else if (!oldState.channelId && newState.channelId) {
        let guildConfig = db_1.session.get(newState.guild.id);
        if (!guildConfig ||
            guildConfig.joinVoiceChannelId != newState.channelId) {
            return;
        }
        let member = newState.guild.members.cache.get(newState.id);
        (0, index_1.speechContent)(((member === null || member === void 0 ? void 0 : member.nickname) || (member === null || member === void 0 ? void 0 : member.user.displayName)) + "が入室しました。", "Scratch_0", guildConfig, newState.guild.id);
    }
}));
client.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
    (0, index_1.messageListener)(message);
    if (message.author.bot || message.system)
        return;
    if (!message.content.startsWith(String(process.env.prefix)))
        return;
    let member = message.member;
    //Omikuji
    if (message.content.match(/[Ss]cratch宝くじ！/)) {
        if (message.channel.id === process.env.lotteryChannelId) {
            const contentArr = [
                "残念、はずれです。。。",
                "残念、はずれです。。。",
                "残念、はずれです。。。",
                " ",
                "おめでとうございます！🎉🎉\nNITROを手に入れたぞ！報告しよう！",
            ];
            const filesArr = [
                "https://cdn.discordapp.com/attachments/907642837846343681/949712950460039238/omikuji_hazure.png",
                "https://cdn.discordapp.com/attachments/927964788330491924/949739953779261450/omokuji_hazure1.png",
                "https://cdn.discordapp.com/attachments/927964788330491924/949713626082721862/omokuji_hazure2.png",
                "https://cdn.discordapp.com/attachments/927964788330491924/949741133368537088/omokuji_hazure3.png",
                "https://cdn.discordapp.com/attachments/907642837846343681/949712950195789874/omikuji_atari.png",
            ];
            const weight = [2500, 100, 50, 25, 10];
            let totalWeight = 0;
            for (let i = 0; i < weight.length; i++) {
                totalWeight += weight[i];
            }
            let random = Math.floor(Math.random() * totalWeight);
            for (let i = 0; i < weight.length; i++) {
                if (random < weight[i]) {
                    message.channel.send({
                        content: `${contentArr[i]}`,
                        files: [filesArr[i]],
                        reply: { messageReference: message.id },
                        allowedMentions: { repliedUser: false },
                    });
                    return;
                }
                else {
                    random -= weight[i];
                }
            }
        }
    }
    //Auto react(message)
    if (message.content.match(/^神$/)) {
        let emoji = client.emojis.cache.find((emoji) => emoji.name === "JP1_kami");
        message.react(`${emoji}`);
    }
    if (message.content.match(/草$|kusa$/i)) {
        let emoji = client.emojis.cache.find((emoji) => emoji.name === "JP1_kusa");
        message.react(`${emoji}`);
    }
    if (message.content.match(/^Nice$/i)) {
        message.react(`👍`);
    }
    const args = message.content
        .slice(String(process.env.prefix).length)
        .trim()
        .split(/ +/g);
    const command = String(args.shift()).toLowerCase();
    //help command
    if (command === "help") {
        message.channel.send("helpなんて不必要GG");
    }
    //ping command
    if (command === "ping") {
        message.channel.send(`🏓Pong!\n現在のping値：${client.ws.ping}ms`);
    }
    //run command
    if (command === "run") {
        if (!["845998854712721408"].includes(message.author.id))
            return;
        const code = args.join(" ");
        const result = new Promise((resolve) => resolve(eval(code)));
        return result
            .then((output) => __awaiter(void 0, void 0, void 0, function* () {
            if (typeof output !== "string") {
                output = require("util").inspect(output, { depth: 0 });
            }
            let output_str = String(output);
            if (output_str.includes(String(client.token))) {
                output = output_str.replace(String(client.token), "[TOKEN]");
            }
            message.reply(`\`\`\`js\n${output_str}\n\`\`\``);
        }))
            .catch((err) => __awaiter(void 0, void 0, void 0, function* () {
            err = err.toString();
            if (err.includes(client.token)) {
                err = err.replace(client.token, "[TOKEN]");
            }
            message.reply(`\`\`\`js\n${err}\n\`\`\``);
        }));
    }
    if (command === "say") {
        if (!["744786285130154084"].includes(message.author.id))
            return;
        const result = args.join(" ");
        message.reply(`result`);
    }
}));
//Welcome message
// client.on("guildMemberAdd", async (member) => {
//     const guild = client.guilds.cache.get(MY_GUILD);
//     if (member.guild.id !== config.serverId) return;
//     console.log(
//         `${member.guild.name} に ${member.displayName} が参加しました。現在は ${guild.memberCount} 人です。`
//     );
//     member.guild.channels.cache
//         .get("959845771145019492")
//         .send(
//             `**Welcome to Scratch(JP)!**\n${member}さんScratch(JP)へようこそ！！\n<#1016269888937017394>で是非、自己紹介をお願いします！`
//         );
// });
//Boost event
client.on("guildMemberUpdate", (oldMember, newMember) => {
    if (!oldMember.premiumSince && newMember.premiumSince) {
        console.log(`${newMember.user.username} was boosting this server!`);
        let channel = client.channels.cache.get("888638911088304189");
        if (channel && "send" in channel) {
            channel.send({
                embeds: [
                    {
                        author: {
                            name: "Thank you for boost!",
                            icon_url: "https://cdn.discordapp.com/emojis/917029194238689340.gif",
                        },
                        title: `**${newMember.user.username}さんがBoostしてくれました！！**`,
                        description: `${newMember.user}さん、Boostありがとうございます！`,
                        color: 16023551,
                        timestamp: new Date().toString(),
                        thumbnail: {
                            url: "https://cdn.discordapp.com/attachments/907642837846343681/949712950195789874/omikuji_atari.png",
                        },
                        footer: {
                            text: `現在のBoost数は${newMember.guild.premiumSubscriptionCount}Boostになりました！`,
                        },
                    },
                ],
            });
        }
    }
});
client.login(process.env.token);
process.on("uncaughtException", (err) => {
    var _a;
    console.log(err);
    let logging_channel = client.channels.cache.get(LOGGING_CHANNEL);
    if (logging_channel && "send" in logging_channel) {
        logging_channel.send({
            embeds: [
                {
                    title: `<a:off_nitro:918372245078962187>error発生しました。`,
                    description: `\n\`\`\`${err}\`\`\`\n`,
                    color: 16711680,
                    timestamp: new Date().toString(),
                    author: {
                        name: `${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`,
                        icon_url: "https://cdn.discordapp.com/attachments/907642837846343681/941851874687062016/icon2.png",
                    },
                },
            ],
        });
    }
});
process.on("SIGINT", () => {
    let count = 0;
    client.guilds.cache.forEach((guild) => __awaiter(void 0, void 0, void 0, function* () {
        const connection = (0, voice_1.getVoiceConnection)(guild.id);
        if (connection) {
            connection.destroy();
        }
        count += 1;
        if (count == client.guilds.cache.size) {
            setTimeout(process.exit, 1000);
        }
    }));
});
setInterval(() => {
    fetch("https://scratch-proxy.onrender.com/");
}, 1000);
