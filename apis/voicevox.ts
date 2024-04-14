let speakers: any[][] = [];

function speech(text: string, id: string = "3") {
    return new Promise<Buffer>((resolve, reject) => {
        fetch(
            "https://synthesis-service.scratch.mit.edu/synth?locale=ja-JP&gender=female&text=" +
                encodeURI(text)
        )
            .then((blob) => blob.arrayBuffer())
            .then((arrayBuffer) => {
                resolve(Buffer.from(arrayBuffer));
            });
    });
}

export { speech, speakers };
