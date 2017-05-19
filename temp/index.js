const axios = require('axios');
  axios.post('https://api-dsa.17app.co/api/v1/liveStreams/getSuggestedLiveStreams', {"region":"global","count":10})
    .then(res => res.data.data)
    .then(data => JSON.parse(data).sort(byViewerCount))
    .then(json => console.log(JSON.stringify(json, null, 4)));

function byViewerCount(a, b) {
  return b.liveViewerCount - a.liveViewerCount;
}
