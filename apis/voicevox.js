"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.speakers = exports.speech = void 0;
let speakers = [];
exports.speakers = speakers;
function speech(text, id = "3") {
    return new Promise((resolve, reject) => {
        fetch("https://synthesis-service.scratch.mit.edu/synth?locale=ja-JP&gender=female&text=" +
            encodeURI(text))
            .then((blob) => blob.arrayBuffer())
            .then((arrayBuffer) => {
            resolve(Buffer.from(arrayBuffer));
        });
    });
}
exports.speech = speech;
