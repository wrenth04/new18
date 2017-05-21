const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const exec = require('child-process-promise').exec;
const send = require('koa-send');
const fs = require('fs-extra');
const app = new Koa();

app.use(logger());
app.use(bodyParser());

app.use(async (ctx, next) => {
  const { url } = ctx.request.query;
  if(!url) return ctx.body = null;
  ctx.url = url;
  await next();
});

app.use(async ctx => {
  const name = 'time.random.png'
    .replace('time', Date.now())
    .replace('random', Math.round(Math.random()*1000));
  const cmd = 'ffmpeg -loglevel panic -i "url" -f image2 -vframes 1 name'
    .replace('url', ctx.url)
    .replace('name', name);
  await exec(cmd);
  await send(ctx, name);
  await fs.remove(name);
});

app.listen(3000);
