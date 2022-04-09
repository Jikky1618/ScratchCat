"use strict";
const http = require('http');
const config = require("./config");
const { setTimeout } = require('timers/promises');
const querystring = require('querystring');
const { Client, Intents } = require('discord.js'); 
const client = new Client({ intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_EMOJIS_AND_STICKERS", "GUILD_INTEGRATIONS", "GUILD_WEBHOOKS", "GUILD_INVITES", "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGE_TYPING"], restTimeOffset: 500}); 
const MY_GUILD = config.serverId;
require("dotenv").config();

http.createServer(function (req, res){
  res.write("GG");
  res.end();
}).listen(8080);

client.on("ready", message => {
  const guild = client.guilds.cache.get(MY_GUILD);
  console.log(`Logged in as ${client.user.tag}!`);
  client.channels.cache.get(config.loggingChannelId).send({
    embeds: [{
      author: {
        name: `${client.user.tag}`,
        icon_url: "https://cdn.discordapp.com/attachments/907642837846343681/941851874687062016/icon2.png"
      },
	   	title: `<a:upvote:918371919974248458>${client.user.username}は正常に再起動しました！`,
	   	color: 65280,
	   	timestamp: new Date(),
	  }]
  });
  setInterval(() => {
    client.user.setActivity(`${client.ws.ping}ms | ${guild.memberCount} members`, { type: 'WATCHING' })
    }, 6 * 1000)
});


client.on("messageCreate", async (message) => {
  if(message.author.bot || message.system) return;
  let member = message.member;
  const period = Math.round((Date.now() - member.joinedAt) / ( 1000 * 60 * 60 * 24));
  
  if(period < 30 && period > 7){
    message.member.roles.add(config.oneWeekRole);//1週間参加ロール付与
  }else if(period < 60 && period >= 30){
    message.member.roles.remove(config.oneWeekRole);//1週間参加ロール剥奪
    message.member.roles.add(config.oneMonthRole);//1か月参加ロール付与
  }else if(period < 90 && period >= 60){
    message.member.roles.remove(config.oneWeekRole);//1週間参加ロール剥奪
    message.member.roles.remove(config.oneMonthRole);//1か月参加ロール剥奪
    message.member.roles.add(config.twoMonthsRole);//2か月参加ロール付与
  }else if(period < 180 && period >= 90){
    message.member.roles.remove(config.oneWeekRole);//1週間参加ロール剥奪
    message.member.roles.remove(config.oneMonthRole);//1か月参加ロール剥奪
    message.member.roles.remove(config.twoMonthsRole);//2か月参加ロール剥奪
    message.member.roles.add(config.threeMonthsRole);//3か月参加ロール付与
  }else if(period < 270 && period >= 180){
    message.member.roles.remove(config.oneWeekRole);//1週間参加ロール剥奪
    message.member.roles.remove(config.oneMonthRole);//1か月参加ロール剥奪
    message.member.roles.remove(config.twoMonthsRole);//2か月参加ロール剥奪
    message.member.roles.remove(config.threeMonthsRole);//3か月参加ロール剥奪
    message.member.roles.add(config.sixMonthsRole);//6か月参加ロール付与
  }else if(period < 365 && period >= 270){
    message.member.roles.remove(config.oneWeekRole);//1週間参加ロール剥奪
    message.member.roles.remove(config.oneMonthRole);//1か月参加ロール剥奪
    message.member.roles.remove(config.twoMonthsRole);//2か月参加ロール剥奪
    message.member.roles.remove(config.threeMonthsRole);//3か月参加ロール剥奪
    message.member.roles.remove(config.sixMonthsRole);
    message.member.roles.add(config.nineMonthsRole);
  }
  if(message.content.match(/discord.gg/)){
      message.channel.send("<:yougotthis:937292033784172574>");
  }
  //Omikuji
  if(message.content.match(/[Ss]cratch宝くじ！/)){
    if(message.channel.id === config.lotteryChannelId){
      const contentArr = ["残念、はずれです。。。","残念、はずれです。。。","残念、はずれです。。。"," ","おめでとうございます！🎉🎉\nNITROを手に入れたぞ！報告しよう！"]
      const filesArr = ['https://cdn.discordapp.com/attachments/907642837846343681/949712950460039238/omikuji_hazure.png','https://cdn.discordapp.com/attachments/927964788330491924/949739953779261450/omokuji_hazure1.png','https://cdn.discordapp.com/attachments/927964788330491924/949713626082721862/omokuji_hazure2.png','https://cdn.discordapp.com/attachments/927964788330491924/949741133368537088/omokuji_hazure3.png','https://cdn.discordapp.com/attachments/907642837846343681/949712950195789874/omikuji_atari.png'];
      const weight = [2500,100,50,25,10];
      let totalWeight = 0;
      for(let i = 0; i < weight.length; i++){
        totalWeight += weight[i];
      }
      let random = Math.floor(Math.random() * totalWeight);
      for(let i = 0; i < weight.length; i++){
        if(random < weight[i]){
          message.channel.send({
            content: `${contentArr[i]}`,
            files: [filesArr[i]],
            reply: {messageReference: message.id},
            allowedMentions: { repliedUser: false }
          });
          return;
        }else{
          random -= weight[i];
        }
      }
    }
  }
  //Auto react(channel) 
  if(message.channel.id === "892061606920470540" || message.channel.id === "932104884164100177" || message.channel.id === "939555978330923088"){
    message.react('👍');//#updatesと#なんでも呟きと#Scratch作品紹介
  }
  //Auto react(message)
  if(message.content.match(/^神$/)){
    let emoji = client.emojis.cache.find(emoji => emoji.name === "JP1_kami");
    message.react(`${emoji}`);
  }
  if(message.content.match(/草$|kusa$/i)){
    let emoji = client.emojis.cache.find(emoji => emoji.name === "JP1_kusa");
    message.react(`${emoji}`);
  }
  if(message.content.match(/^Nice$/i)){
    message.react(`👍`);
  }
  
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  //help command
  if (command === "help") {
    message.channel.send("helpなんて不必要GG");
  } 
  //ping command
  if (command === "ping"){
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
        if (output.includes(client.token)) {
          output = output.replace(client.token, "[TOKEN]");
        }
        message.reply(`\`\`\`js\n${output}\n\`\`\``);
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
    if (!["845998854712721408"].includes(message.author.id)) return;
    message.channel.send("> **Scratch認証**\n<:SCDOT:917056096202522634>Scratchアカウントを持っているかたはこちらから認証をお願いします。\n<:SCDOT:917056096202522634>If you have a Scratch account, please click here to authenticate.\n\n:warning:New Scratcherは認証できません。こちらのスタジオで問い合わせをお願いします：https://scratch.mit.edu/studios/31009600/comments \n\nScratch認証をすると専用チャンネルを閲覧＆メッセージを送信することができます。\n<#900714827889123340>...Scratchに関する話題で話し合おう！\n<#939555978330923088>...あなたや他の人のすごい作品を紹介しよう！\n<#917655880433025075>...Scratchに関する質問や疑問点はここでみんなと共有しましょう！")
  }
});

//Welcome message
client.on("guildMemberAdd", async member => {
  const guild = client.guilds.cache.get(MY_GUILD);
  if (member.guild.id !== config.serverId) return;
	console.log(`${member.guild.name} に ${member.displayName} が参加しました。現在は ${guild.memberCount} 人です。`);
  member.guild.channels.cache.get("926716789197508628").send(`**Welcome to Scratch(JP)!**\n${member}さんScratch(JP)へようこそ！！`);
  const welcomePing = await client.channels.cache.get("926716789197508628").send(`<@&` + `916543770022006844` + `>`);
  await setTimeout(10 * 1000);
  await welcomePing.delete()
 })

//voice channel event
client.on("voiceStateUpdate", async (oldState, newState) => {
  if(oldState.channel === null && newState.channel !== null){
    newState.member.roles.add(config.vcRole);
    const connectLog = await client.channels.cache.get(config.noMicChannelId).send(`${newState.member.user.username}さんが${newState.channel}に接続しました！\nVCでの会話やコマンドはこのチャンネル<#${config.noMicChannelId}>で行いましょう！`);
    await setTimeout(10 * 1000);
    await connectLog.delete()
  }
  if(oldState.channel !== null && newState.channel === null){
    oldState.member.roles.remove(config.vcRole);
    const connectLog = await client.channels.cache.get(config.noMicChannelId).send(`${oldState.member.user.username}さんが${oldState.channel}から切断しました。`);
    await setTimeout(10 * 1000);
    await connectLog.delete()
  }
});

//Boost event
client.on("guildMemberUpdate",(oldMember, newMember) => {
  if(!oldMember.premiumSince && newMember.premiumSince){
    console.log('${newMember.user.username} was boosting this server!')
    client.channel.cache.get("888638911088304189").send({
      embeds: {
        author: {
            name: "Thank you for boost!",
            icon_url: "https://cdn.discordapp.com/emojis/917029194238689340.gif",
        },
        title: `**${newMember.user.username}さんがBoostしてくれました！！**`,
        description: `${newMember.user}さん、Boostありがとうございます！\n以下のことができるようになりました！\n>>> <:SCDOT:917056096202522634> <#913817902065524736>の閲覧\n <:SCDOT:917056096202522634> サーバーインサイト、監査ログの閲覧\n <:SCDOT:917056096202522634> 絵文字・スタンプの追加`,
        color: 16023551,
        timestamp: new Date(),
        thumbnail: {
          url: atari.png
        },
        footer: {
            text: `現在のBoost数は${message.guild.premiumSubscriptionCount}Boostになりました！`
        }
      }
    })
  }
});


client.login(process.env.token);

process.on("uncaughtException", (err) => {
  console.log(err);
  client.channels.cache.get(config.loggingChannelId).send({
    embeds: [{
	   	title: `<a:off_nitro:918372245078962187>error発生しました。`,
      description:`\n\`\`\`${err}\`\`\`\n`,
	   	color: 16711680,
	   	timestamp: new Date(),
      author: {
        name: `${client.user.tag}`,
        icon_url: "https://cdn.discordapp.com/attachments/907642837846343681/941851874687062016/icon2.png"
      }
	  }]
  });
});
