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

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const roomID = parseInt(event.message.text);
  if(!roomID) return Promise.resolve(null);

  return axios.get('http://17.media/share/live/'+roomID)
    .then(res => res.data)
    .then(html => JSON.parse(html.split('appData = ')[1].split('</script')[0]))
    .then(json => {
      const url = json.liveStream.rtmpUrls[0].url;
      const {userInfo, liveStatus} = json.liveStream;
      const {name, openID, bio, picture, caption} = userInfo;

      const text = ((bio&&bio.length>200) ? bio.substring(0, 200) : bio ) || '';

      const msg = {
        type: 'template',
        altText: name,
        template: {
          type: 'buttons',
          //thumbnailImageUrl: 'https://new18.now.sh/?roomID='+roomID,
          title: name,
          text: text,
          actions: [
            {
              type: 'uri',
              label: '直播',
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

app.listen(3000);

