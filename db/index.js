"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSettings = exports.getSessionData = exports.session = exports.setUserSettings = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let session = new Map();
exports.session = session;
let staticsSettings = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "./main.json"), "utf-8"));
function setUserSettings(guildID, userName, key, value) {
    if (guildID in staticsSettings) {
        if (!staticsSettings[guildID].users[userName]) {
            staticsSettings[guildID].users[userName] = {};
        }
        staticsSettings[guildID].users[userName][key] = value;
    }
    else {
        staticsSettings[guildID] = {
            users: {},
        };
        staticsSettings[guildID].users[userName] = {};
        staticsSettings[guildID].users[userName][key] = value;
    }
}
exports.setUserSettings = setUserSettings;
function getSessionData(guildID) {
    return session.get(guildID);
}
exports.getSessionData = getSessionData;
function getUserSettings(guildID, userName) {
    if (!staticsSettings[guildID]) {
        return undefined;
    }
    return staticsSettings[guildID].users[userName];
}
exports.getUserSettings = getUserSettings;
setInterval(() => {
    fs_1.default.writeFileSync(path_1.default.join(__dirname, "./main.json"), JSON.stringify(staticsSettings));
}, 1000);
