const express = require('express');
const axios = require('axios');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.TOKEN || '',
  channelSecret: process.env.SECRET || ''
};

const app = express();
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch(console.log);
});

app.listen(3000);

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const roomID = parseInt(event.message.text);
  const hot = event.message.text.indexOf('hot') != -1;

  if(hot) return getHot(event);
  if(roomID) return getRoom(event, roomID);
  return Promise.resolve(null);
}

function getHot(event) {
  return axios.post('https://api-dsa.17app.co/api/v1/liveStreams/getSuggestedLiveStreams', {"region":"global","count":10})
    .then(res => res.data.data)
    .then(data => JSON.parse(data).sort((a, b) => b.liveViewerCount - a.liveViewerCount))
    .then(data => {
      const cards = data.slice(0, 5).map(user => {
        const {userID, rtmpUrls} = user;
        const {roomID, name, openID, bio, picture, caption} = user.userInfo;
        const text = ((bio&&bio.length>50) ? bio.substring(0, 50) + '...' : bio ) || '';
        return {
          thumbnailImageUrl: 'https://new18.now.sh/?line=true&roomID='+roomID,
          title: name,
          text: text,
          actions: [
            {
              type: 'uri',
              label: '直播 ' + roomID,
              uri: rtmpUrls[0].url
            },
            {
              type: 'uri',
              label: '資訊',
              uri: 'http://17.media/share/user/'+openID
            }
          ]
        };
      });
      const msg = {
        type: 'carousel',
        columns: cards
      };

      return client.replyMessage(event.replyToken, {
        type: 'template',
        altText: 'hot list',
        template: msg
      });
    });
}

function getRoom(event, roomID) {
  return axios.get('http://17.media/share/live/'+roomID)
    .then(res => res.data)
    .then(html => JSON.parse(html.split('appData = ')[1].split('</script')[0]))
    .then(json => {
      const url = json.liveStream.rtmpUrls[0].url;
      const {userInfo, liveStatus} = json.liveStream;
      const {name, openID, bio, picture, caption} = userInfo;

      const text = ((bio&&bio.length>50) ? bio.substring(0, 50)+'...' : bio ) || '';

      const msg = {
        type: 'template',
        altText: name,
        template: {
          type: 'buttons',
          thumbnailImageUrl: 'https://new18.now.sh/?line=true&roomID='+roomID,
          title: name,
          text: text,
          actions: [
            {
              type: 'uri',
              label: '直播 ' + roomID,
              uri: url
            },
            {
              type: 'uri',
              label: '資訊',
              uri: 'http://17.media/share/user/'+openID
            }
          ]
        }
      };

      return client.replyMessage(event.replyToken, msg);
    });
}
