import { execSync } from "child_process";
import { randomUUID } from "crypto";
import { fstat } from "fs";
import { readFile, unlink, writeFile } from "fs/promises";
import path from "path";

let speakers: { [keys: string]: { type: string; playbackRate?: number } } = {
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

function speech(text: string, id: string = "Scratch_0") {
    return new Promise<Buffer>((resolve, reject) => {
        if (id.startsWith("Scratch_")) {
            let speakerData = speakers[id];
            fetch("https://scratch-proxy.onrender.com/proxy/", {
                method: "POST",
                body:
                    "https://synthesis-service.scratch.mit.edu/synth?locale=ja-JP&gender=" +
                    speakerData.type +
                    "&text=" +
                    encodeURIComponent(text),
            })
                .then((blob) => blob.arrayBuffer())
                .then(async (arrayBuffer) => {
                    let data = Buffer.from(arrayBuffer);
                    if (speakerData.playbackRate) {
                        let uuid = randomUUID();
                        await writeFile(
                            path.join(__dirname, "../audio/", uuid + ".wav"),
                            data
                        );
                        execSync(
                            "ffmpeg -i " +
                                path.join(
                                    __dirname,
                                    "../audio/",
                                    uuid + ".wav"
                                ) +
                                ' -filter:a "asetrate=8000*' +
                                speakerData.playbackRate +
                                '" -vn ' +
                                path.join(
                                    __dirname,
                                    "../audio/",
                                    uuid + ".out.wav"
                                )
                        );
                        data = await readFile(
                            path.join(__dirname, "../audio/", uuid + ".out.wav")
                        );
                        resolve(data);
                        unlink(
                            path.join(__dirname, "../audio/", uuid + ".wav")
                        );
                        unlink(
                            path.join(__dirname, "../audio/", uuid + ".out.wav")
                        );
                    } else {
                        resolve(data);
                    }
                });
        }
    });
}

export { speech, speakers };
