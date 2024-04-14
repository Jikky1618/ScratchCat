import { speakers } from "./apis/voicevox";
import {
    Client,
    IntentsBitField,
    ActivityType,
    SlashCommandBuilder,
    ChannelType,
    version,
} from "discord.js";
import { listener, messageListener } from "./commands/index";
import { joinVoiceChannel, getVoiceConnection } from "@discordjs/voice";
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent,
    ],
});
import { config } from "dotenv";
config({
    path: "./config.env",
});

const MY_GUILD = process.env.serverId;
const LOGGING_CHANNEL = process.env.serverId;
if (!MY_GUILD || !LOGGING_CHANNEL) {
    console.error("config.envファイルが正しく設定されていません");
    process.exit(1);
}
function updatePresence() {
    client.user?.setPresence({
        activities: [
            {
                name: client.guilds.cache.size + "サーバーに導入中",
                state: "/joinコマンドで読み上げを起動できるよ",
            },
        ],
    });
}

client.on("ready", () => {
    let kangping = client.users.cache.get("1028165215579279410");
    if (kangping) {
        kangping.send("discord.jsのバージョンは" + version);
    }
    client.user?.setPresence({
        activities: [
            {
                name: "初期化中",
                type: ActivityType.Playing,
                state: "クレジットは/creditコマンドで確認してください",
            },
        ],
    });
    let setCommand = new SlashCommandBuilder()
        .setName("set")
        .setDescription("読み上げの声を指定します")
        .addStringOption((builder) => {
            builder.setName("voice");
            builder.setDescription("声");
            builder.setRequired(true);
            let choices: { name: string; value: string }[] = [];
            choices.push({
                name: "Scratch読み上げ",
                value: "scratch_0",
            });
            builder.setChoices(...choices);
            return builder;
        });
    client.application?.commands.set([
        new SlashCommandBuilder()
            .setName("info")
            .setDescription("Botの情報を表示できます。"),
        new SlashCommandBuilder()
            .setName("credit")
            .setDescription("音声読み上げのクレジットを表示します"),
        new SlashCommandBuilder()
            .setName("join")
            .setDescription("読み上げを接続します"),
        new SlashCommandBuilder()
            .setName("exit")
            .setDescription("読み上げを切断します"),
        setCommand,
    ]);
    updatePresence();
    setInterval(updatePresence, 1000 * 10);
    const guild = client.guilds.cache.get(MY_GUILD);
    console.log(`Logged in as ${client.user?.tag}!`);
    let channel = client.channels.cache.get(LOGGING_CHANNEL);
    if (channel && "send" in channel) {
        channel.send({
            embeds: [
                {
                    author: {
                        name: `${client.user?.tag}`,
                        icon_url:
                            "https://cdn.discordapp.com/attachments/907642837846343681/941851874687062016/icon2.png",
                    },
                    title: `<a:upvote:918371919974248458>${client.user?.username}は正常に再起動しました！`,
                    color: 65280,
                    timestamp: new Date().toString(),
                },
            ],
        });
    }
    setInterval(() => {
        client.user?.setActivity(
            `${client.ws.ping}ms | ${guild?.memberCount} members`,
            { type: ActivityType.Watching }
        );
    }, 6 * 1000);
});

client.on("interactionCreate", (interaction) => {
    listener(interaction);
});

client.on("messageCreate", async (message) => {
    messageListener(message);
    if (message.author.bot || message.system) return;
    if (!message.content.startsWith(String(process.env.prefix))) return;
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
                } else {
                    random -= weight[i];
                }
            }
        }
    }
    //Auto react(message)
    if (message.content.match(/^神$/)) {
        let emoji = client.emojis.cache.find(
            (emoji) => emoji.name === "JP1_kami"
        );
        message.react(`${emoji}`);
    }
    if (message.content.match(/草$|kusa$/i)) {
        let emoji = client.emojis.cache.find(
            (emoji) => emoji.name === "JP1_kusa"
        );
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
        if (!["845998854712721408"].includes(message.author.id)) return;
        const code = args.join(" ");
        const result = new Promise((resolve) => resolve(eval(code)));
        return result
            .then(async (output) => {
                if (typeof output !== "string") {
                    output = require("util").inspect(output, { depth: 0 });
                }
                let output_str = String(output);
                if (output_str.includes(String(client.token))) {
                    output = output_str.replace(
                        String(client.token),
                        "[TOKEN]"
                    );
                }
                message.reply(`\`\`\`js\n${output_str}\n\`\`\``);
            })
            .catch(async (err) => {
                err = err.toString();
                if (err.includes(client.token)) {
                    err = err.replace(client.token, "[TOKEN]");
                }
                message.reply(`\`\`\`js\n${err}\n\`\`\``);
            });
    }

    if (command === "say") {
        if (!["744786285130154084"].includes(message.author.id)) return;
        const result = args.join(" ");
        message.reply(`result`);
    }
});

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
                            icon_url:
                                "https://cdn.discordapp.com/emojis/917029194238689340.gif",
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
                        name: `${client.user?.tag}`,
                        icon_url:
                            "https://cdn.discordapp.com/attachments/907642837846343681/941851874687062016/icon2.png",
                    },
                },
            ],
        });
    }
});
process.on("SIGINT", () => {
    let count = 0;
    client.guilds.cache.forEach(async (guild) => {
        const connection = getVoiceConnection(guild.id);
        if (connection) {
            connection.destroy();
        }
        count += 1;
        if (count == client.guilds.cache.size) {
            setTimeout(process.exit, 1000);
        }
    });
});

setInterval(() => {
    fetch("https://scratch-proxy.onrender.com/");
}, 1000);
