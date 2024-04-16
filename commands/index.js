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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageListener = exports.listener = void 0;
const discord_js_1 = require("discord.js");
const voicevox_1 = require("../apis/voicevox");
const os_utils_1 = __importDefault(require("os-utils"));
const index_1 = require("../db/index");
const voice_1 = require("@discordjs/voice");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let cpuUsage = 0;
function getCPU() {
    os_utils_1.default.cpuUsage((v) => __awaiter(this, void 0, void 0, function* () {
        cpuUsage = v * 100;
        process.nextTick(getCPU);
    }));
}
getCPU();
function listener(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (interaction.isCommand()) {
            switch (interaction.commandName) {
                case "info":
                    let base = new discord_js_1.EmbedBuilder()
                        .setTitle("読み上げBot")
                        .setDescription("チャンネルに投稿されたテキストを読み上げます。クレジットは/creditコマンドで確認できます")
                        .addFields([
                        {
                            name: "CPU使用率",
                            value: "`" + cpuUsage.toFixed(2) + "%`",
                            inline: true,
                        },
                    ])
                        .addFields([
                        {
                            name: "メモリ使用率",
                            value: "`" +
                                (os_utils_1.default.freememPercentage() * 100).toFixed(2) +
                                "%`",
                            inline: true,
                        },
                    ]);
                    let b = structuredClone(base.data);
                    interaction.reply({
                        embeds: [
                            base.addFields([
                                { name: "Ping", value: "`計測中`", inline: true },
                            ]),
                        ],
                    });
                    let msg = yield interaction.fetchReply();
                    (_a = b.fields) === null || _a === void 0 ? void 0 : _a.push({
                        name: "Ping",
                        value: "`" +
                            (msg.createdTimestamp - interaction.createdTimestamp) +
                            "ms`",
                        inline: true,
                    });
                    yield interaction.editReply({
                        embeds: [b],
                    });
                    break;
                case "credit":
                    const creditEmbed = new discord_js_1.EmbedBuilder().setTitle("合成音声クレジット");
                    creditEmbed.addFields({
                        name: `Scratch読み上げ`,
                        value: "https://scratch.mit.edu/",
                    });
                    yield interaction.reply({
                        embeds: [creditEmbed],
                    });
                    break;
                case "set":
                    (0, index_1.setUserSettings)(interaction.guildId, interaction.user.id, "voice", (_b = interaction.options.get("voice")) === null || _b === void 0 ? void 0 : _b.value);
                    interaction.reply({
                        content: "設定しました",
                        ephemeral: true,
                    });
                    break;
                case "join":
                    if (interaction.guild &&
                        interaction.guildId &&
                        interaction.member) {
                        if (!("voice" in interaction.member) ||
                            !interaction.member.voice.channelId) {
                            interaction.reply({
                                embeds: [
                                    new discord_js_1.EmbedBuilder().setTitle("ボイスチャンネルに参加してください"),
                                ],
                                ephemeral: true,
                            });
                            return;
                        }
                        index_1.session.set(interaction.guildId, {
                            channels: [interaction.channelId],
                            id: 0,
                            readingID: 0,
                            generate: new Set(),
                            read: false,
                            skip: false,
                        });
                        yield (0, voice_1.joinVoiceChannel)({
                            adapterCreator: interaction.guild.voiceAdapterCreator,
                            guildId: interaction.guildId,
                            channelId: interaction.member.voice.channelId,
                        });
                        interaction.reply({
                            embeds: [
                                new discord_js_1.EmbedBuilder()
                                    .setTitle("接続しました")
                                    .setDescription("/creditで合成音声のクレジットを確認できます"),
                            ],
                        });
                    }
                    break;
                case "exit":
                    if (interaction.guild &&
                        interaction.guildId &&
                        interaction.member) {
                        if (index_1.session.has(interaction.guildId)) {
                            const connection = (0, voice_1.getVoiceConnection)(interaction.guildId);
                            if (connection) {
                                connection.destroy();
                                interaction.reply({
                                    embeds: [
                                        new discord_js_1.EmbedBuilder().setTitle("切断しました"),
                                    ],
                                });
                            }
                        }
                        else {
                            interaction.reply({
                                embeds: [
                                    new discord_js_1.EmbedBuilder().setTitle("どのボイスチャンネルにも参加していません"),
                                ],
                            });
                        }
                    }
                    break;
            }
        }
    });
}
exports.listener = listener;
function messageListener(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (message.author.bot)
            return;
        if (index_1.session.has(message.guildId)) {
            let config = (0, index_1.getUserSettings)(message.guildId, message.author.id);
            let guildConfig = index_1.session.get(message.guildId);
            if (!(guildConfig === null || guildConfig === void 0 ? void 0 : guildConfig.channels.includes(message.channelId))) {
                return;
            }
            let id;
            let read = true;
            if (guildConfig) {
                id = guildConfig.id;
            }
            let voice = "3";
            if (config) {
                voice = config.voice;
            }
            if (message.content == "s" || message.content == "$") {
                guildConfig.skip = true;
                return;
            }
            let msg = message.content
                .replace(/:.+:.*/g, "")
                .replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, "リンク省略")
                .split(/(<@[0-9]+>)/)
                .map((value, index) => {
                var _a, _b;
                if (index % 2 == 1) {
                    return ("@" +
                        ((_b = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(value.slice(2, -1))) === null || _b === void 0 ? void 0 : _b.nickname));
                }
                return value;
            })
                .join("")
                .split(/(<@&[0-9]+>)/)
                .map((value, index) => {
                var _a, _b;
                if (index % 2 == 1) {
                    return ("@" +
                        ((_b = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.get(value.slice(3, -1))) === null || _b === void 0 ? void 0 : _b.name));
                }
                return value;
            })
                .join("");
            guildConfig.id += 1;
            fs_1.default.mkdirSync(path_1.default.join(__dirname, "../audio/"), { recursive: true });
            fs_1.default.writeFileSync(path_1.default.join(__dirname, "../audio/" + message.guildId + "." + id + ".wav"), yield (0, voicevox_1.speech)(msg, voice));
            guildConfig.generate.add(id);
            if (!guildConfig.read) {
                guildConfig.read = true;
                index_1.session.set(message.guildId, guildConfig);
                const connection = (0, voice_1.getVoiceConnection)(message.guildId);
                if (connection) {
                    let player = (0, voice_1.createAudioPlayer)();
                    connection.subscribe(player);
                    let i = setInterval(() => {
                        let gf = index_1.session.get(message.guildId);
                        if (gf && gf.skip) {
                            player.stop();
                            gf.skip = false;
                            index_1.session.set(message.guildId, gf);
                        }
                    }, 100);
                    while (guildConfig &&
                        guildConfig.generate.has(guildConfig.readingID)) {
                        if (!guildConfig)
                            continue;
                        let res = (0, voice_1.createAudioResource)(path_1.default.join(__dirname, "../audio/" +
                            message.guildId +
                            "." +
                            guildConfig.readingID +
                            ".wav"));
                        player.play(res);
                        yield new Promise((resolve, reject) => {
                            player.on("stateChange", (old, newState) => {
                                if (newState.status == "idle" &&
                                    old.status == "playing") {
                                    resolve("");
                                    let guildConfig2 = index_1.session.get(message.guildId);
                                    if (guildConfig && guildConfig2) {
                                        fs_1.default.unlinkSync(path_1.default.join(__dirname, "../audio/" +
                                            message.guildId +
                                            "." +
                                            guildConfig.readingID +
                                            ".wav"));
                                        guildConfig.readingID += 1;
                                        guildConfig2.readingID =
                                            guildConfig.readingID;
                                        guildConfig2.generate.delete(guildConfig.readingID - 1);
                                        index_1.session.set(message.guildId, guildConfig2);
                                        guildConfig = guildConfig2;
                                        player.removeAllListeners("stateChange");
                                    }
                                }
                            });
                        });
                    }
                    clearInterval(i);
                }
                if (guildConfig) {
                    guildConfig.read = false;
                    index_1.session.set(message.guildId, guildConfig);
                }
            }
            else {
                index_1.session.set(message.guildId, guildConfig);
            }
        }
    });
}
exports.messageListener = messageListener;
