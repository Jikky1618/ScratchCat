import {
    Interaction,
    CacheType,
    EmbedBuilder,
    Message,
    Embed,
} from "discord.js";
import { speakers, speech } from "../apis/voicevox";
import os from "os-utils";
import {
    setUserSettings,
    getUserSettings,
    getSessionData,
    session,
} from "../db/index";
import {
    joinVoiceChannel,
    getVoiceConnection,
    createAudioResource,
    createAudioPlayer,
} from "@discordjs/voice";
import fs from "fs";
import path from "path";

let cpuUsage = 0;

function getCPU() {
    os.cpuUsage(async (v) => {
        cpuUsage = v * 100;
        process.nextTick(getCPU);
    });
}
getCPU();

async function listener(interaction: Interaction<CacheType>) {
    if (interaction.isCommand()) {
        switch (interaction.commandName) {
            case "info":
                let base = new EmbedBuilder()
                    .setTitle("読み上げBot")
                    .setDescription(
                        "チャンネルに投稿されたテキストを読み上げます。クレジットは/creditコマンドで確認できます"
                    )
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
                            value:
                                "`" +
                                (os.freememPercentage() * 100).toFixed(2) +
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
                let msg = await interaction.fetchReply();
                b.fields?.push({
                    name: "Ping",
                    value:
                        "`" +
                        (msg.createdTimestamp - interaction.createdTimestamp) +
                        "ms`",
                    inline: true,
                });
                await interaction.editReply({
                    embeds: [b],
                });
                break;
            case "credit":
                const creditEmbed = new EmbedBuilder().setTitle(
                    "合成音声クレジット"
                );
                creditEmbed.addFields({
                    name: `Scratch読み上げ`,
                    value: "https://scratch.mit.edu/",
                });
                await interaction.reply({
                    embeds: [creditEmbed],
                });
                break;
            case "set":
                setUserSettings(
                    interaction.guildId as string,
                    interaction.user.id,
                    "voice",
                    interaction.options.get("voice")?.value as string
                );
                interaction.reply({
                    content: "設定しました",
                    ephemeral: true,
                });
                break;
            case "join":
                if (
                    interaction.guild &&
                    interaction.guildId &&
                    interaction.member
                ) {
                    if (
                        !("voice" in interaction.member) ||
                        !interaction.member.voice.channelId
                    ) {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder().setTitle(
                                    "ボイスチャンネルに参加してください"
                                ),
                            ],
                            ephemeral: true,
                        });
                        return;
                    }
                    session.set(interaction.guildId as string, {
                        channels: [interaction.channelId as string],
                        id: 0,
                        readingID: 0,
                        generate: new Set<number>(),
                        read: false,
                    });
                    await joinVoiceChannel({
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                        guildId: interaction.guildId,
                        channelId: interaction.member.voice.channelId as string,
                    });
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("接続しました")
                                .setDescription(
                                    "/creditで合成音声のクレジットを確認できます"
                                ),
                        ],
                    });
                }
                break;
            case "exit":
                if (
                    interaction.guild &&
                    interaction.guildId &&
                    interaction.member
                ) {
                    if (session.has(interaction.guildId)) {
                        const connection = getVoiceConnection(
                            interaction.guildId
                        );
                        if (connection) {
                            connection.destroy();
                            interaction.reply({
                                embeds: [
                                    new EmbedBuilder().setTitle("切断しました"),
                                ],
                            });
                        }
                    } else {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder().setTitle(
                                    "どのボイスチャンネルにも参加していません"
                                ),
                            ],
                        });
                    }
                }
                break;
        }
    }
}

async function messageListener(message: Message<boolean>) {
    if (message.author.bot) return;
    if (session.has(message.guildId as string)) {
        let config = getUserSettings(
            message.guildId as string,
            message.author.id
        );
        let guildConfig = session.get(message.guildId as string);
        if (!guildConfig?.channels.includes(message.channelId)) {
            return;
        }
        let id;
        let read: boolean = true;
        if (guildConfig) {
            id = guildConfig.id;
        }
        let voice = "3";
        if (config) {
            voice = config.voice;
        }
        guildConfig.id += 1;
        fs.mkdirSync(path.join(__dirname, "../audio/"), { recursive: true });
        fs.writeFileSync(
            path.join(
                __dirname,
                "../audio/" + message.guildId + "." + id + ".wav"
            ),
            await speech(message.content, voice)
        );
        guildConfig.generate.add(id as number);
        if (!guildConfig.read) {
            guildConfig.read = true;
            session.set(message.guildId as string, guildConfig);
            const connection = getVoiceConnection(message.guildId as string);
            if (connection) {
                let player = createAudioPlayer();
                connection.subscribe(player);
                while (
                    guildConfig &&
                    guildConfig.generate.has(guildConfig.readingID)
                ) {
                    if (!guildConfig) continue;
                    let res = createAudioResource(
                        path.join(
                            __dirname,
                            "../audio/" +
                                message.guildId +
                                "." +
                                guildConfig.readingID +
                                ".wav"
                        )
                    );
                    player.play(res);
                    await new Promise((resolve, reject) => {
                        player.on("stateChange", (old, newState) => {
                            if (
                                newState.status == "idle" &&
                                old.status == "playing"
                            ) {
                                resolve("");
                                let guildConfig2 = session.get(
                                    message.guildId as string
                                );
                                if (guildConfig && guildConfig2) {
                                    fs.unlinkSync(
                                        path.join(
                                            __dirname,
                                            "../audio/" +
                                                message.guildId +
                                                "." +
                                                guildConfig.readingID +
                                                ".wav"
                                        )
                                    );
                                    guildConfig.readingID += 1;
                                    guildConfig2.readingID =
                                        guildConfig.readingID;
                                    guildConfig2.generate.delete(
                                        guildConfig.readingID - 1
                                    );
                                    session.set(
                                        message.guildId as string,
                                        guildConfig2
                                    );
                                    guildConfig = guildConfig2;
                                    player.removeAllListeners("stateChange");
                                }
                            }
                        });
                    });
                }
            }
            if (guildConfig) {
                guildConfig.read = false;
                session.set(message.guildId as string, guildConfig);
            }
        }
    }
}

export { listener, messageListener };
