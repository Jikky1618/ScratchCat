import fs from "fs";
import path from "path";

let session = new Map<
    string,
    {
        channels: string[];
        id: number;
        readingID: number;
        generate: Set<number>;
        read: boolean;
    }
>();
let staticsSettings: {
    [keys: string]: {
        users: {
            [keys: string]: {
                [keys: string]: string;
            };
        };
    };
} = JSON.parse(fs.readFileSync(path.join(__dirname, "./main.json"), "utf-8"));

function setUserSettings(
    guildID: string,
    userName: string,
    key: string,
    value: string
) {
    if (guildID in staticsSettings) {
        if (!staticsSettings[guildID].users[userName]) {
            staticsSettings[guildID].users[userName] = {};
        }
        staticsSettings[guildID].users[userName][key] = value;
    } else {
        staticsSettings[guildID] = {
            users: {},
        };
        staticsSettings[guildID].users[userName] = {};
        staticsSettings[guildID].users[userName][key] = value;
    }
}

function getSessionData(guildID: string) {
    return session.get(guildID);
}
function getUserSettings(guildID: string, userName: string) {
    if (!staticsSettings[guildID]) {
        return undefined;
    }
    return staticsSettings[guildID].users[userName];
}

setInterval(() => {
    fs.writeFileSync(
        path.join(__dirname, "./main.json"),
        JSON.stringify(staticsSettings)
    );
}, 1000);

export { setUserSettings, session, getSessionData, getUserSettings };
