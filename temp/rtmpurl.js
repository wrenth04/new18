const json = require('./data2.json');

json.forEach(user => {
  const { roomID, userID } = user.userInfo;
  const { rtmpUrls } = user;
  console.log(`${roomID} ${userID} ${rtmpUrls[0].url}`);
});
