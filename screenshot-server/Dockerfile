FROM wrenth04/ffmpeg:node7

WORKDIR /app
RUN apt-get -y update && apt-get -y install imagemagick
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 3000
CMD ["npm", "start"]
