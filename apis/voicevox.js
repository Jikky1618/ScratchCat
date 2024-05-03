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
exports.speakers = exports.speech = void 0;
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
let speakers = {
    Scratch_0: {
        type: "female",
    },
    Scratch_1: {
        type: "male",
    },
    Scratch_2: {
        type: "female",
        playbackRate: 1.19,
    },
    Scratch_3: {
        type: "male",
        playbackRate: 0.84,
    },
    Scratch_4: {
        type: "female",
        playbackRate: 1.41,
    },
};
exports.speakers = speakers;
function speech(text, id = "Scratch_0") {
    return new Promise((resolve, reject) => {
        if (id.startsWith("Scratch_")) {
            let speakerData = speakers[id];
            fetch("https://scratch-proxy.onrender.com/proxy/", {
                method: "POST",
                body: "https://synthesis-service.scratch.mit.edu/synth?locale=ja-JP&gender=" +
                    speakerData.type +
                    "&text=" +
                    encodeURIComponent(text),
            })
                .then((blob) => blob.arrayBuffer())
                .then((arrayBuffer) => __awaiter(this, void 0, void 0, function* () {
                let data = Buffer.from(arrayBuffer);
                if (speakerData.playbackRate) {
                    let uuid = (0, crypto_1.randomUUID)();
                    yield (0, promises_1.writeFile)(path_1.default.join(__dirname, "../audio/", uuid + ".wav"), data);
                    (0, child_process_1.execSync)("ffmpeg -i " +
                        path_1.default.join(__dirname, "../audio/", uuid + ".wav") +
                        ' -filter:a "asetrate=8000*' +
                        speakerData.playbackRate +
                        '" -vn ' +
                        path_1.default.join(__dirname, "../audio/", uuid + ".out.wav"));
                    data = yield (0, promises_1.readFile)(path_1.default.join(__dirname, "../audio/", uuid + ".out.wav"));
                    resolve(data);
                    (0, promises_1.unlink)(path_1.default.join(__dirname, "../audio/", uuid + ".wav"));
                    (0, promises_1.unlink)(path_1.default.join(__dirname, "../audio/", uuid + ".out.wav"));
                }
                else {
                    resolve(data);
                }
            }));
        }
    });
}
exports.speech = speech;
