const Koa = require('koa');
const axios = require('axios');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const exec = require('child-process-promise').exec;
const send = require('koa-send');
const fs = require('fs-extra');
const app = new Koa();

app.use(logger());
app.use(bodyParser());

app.use(async (ctx, next) => {
  const { url, roomID, line } = ctx.request.query;
  if(!url && !roomID) return ctx.body = null;
  ctx.url = url;
  ctx.roomID = roomID;
  ctx.line = line;
  await next();
});

app.use(async ctx => {
  if(ctx.roomID) {
    const { data } = await axios.get('http://17.media/share/live/'+ctx.roomID);
    const json = JSON.parse(data.split('rtmpUrls')[1].split('[')[1].split(']')[0]);
    console.log(json.url);
    ctx.url = json.url;
  }

  const name = 'time.random.png'
    .replace('time', Date.now())
    .replace('random', Math.round(Math.random()*1000));
  const namejpg = name.replace('png', 'jpg');
  const cmd = 'ffmpeg -loglevel panic -i "url" -f image2 -vframes 1 name'
    .replace('url', ctx.url)
    .replace('name', name);
  const resizeCmd = 'convert -quality 80 -resize 400x400 png jpg'
    .replace('png', name)
    .replace('jpg', namejpg);
  const paddingCmd = 'convert jpg -gravity center -background white -extent 600x400 2jpg'
    .replace(/jpg/g, namejpg);

  await exec(cmd);
  await exec(resizeCmd);
  if(ctx.line) await exec(paddingCmd);
  if(ctx.line) await send(ctx, '2'+namejpg);
  else await send(ctx, namejpg);
  await fs.remove(name);
  await fs.remove(namejpg);
  if(ctx.line) await fs.remove('2'+namejpg);
});

app.listen(3000);
