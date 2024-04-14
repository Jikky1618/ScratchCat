FROM python:3.10.7
USER root

WORKDIR /app
COPY . /app

RUN npm install

RUN apt-get update
RUN apt-get install -y ffmpeg

CMD ["node","./index.js"]
