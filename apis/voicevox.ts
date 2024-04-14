let speakers: any[][] = [];

function speech(text: string, id: string = "3") {
    return new Promise<Buffer>((resolve, reject) => {
        fetch("https://scratch-proxy.onrender.com/get_voice/" + encodeURI(text))
            .then((blob) => blob.arrayBuffer())
            .then((arrayBuffer) => {
                resolve(Buffer.from(arrayBuffer));
            });
    });
}

export { speech, speakers };
