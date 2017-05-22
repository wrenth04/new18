#!/bin/bash

roomID=$1

html=$(wget -U Mozilla -q -O - "http://17.media/share/live/$roomID")
rtmpurl=${html#*rtmpUrls}; rtmpurl=${rtmpurl#*rtmp}
rtmpurl="rtmp${rtmpurl%%\"*}"

ffmpeg -y -nostdin -i "$rtmpurl" -f mp4 -strict -2 $roomID.flv
ffmpeg -y -nostdin -i "$roomID.flv" -strict -2 $roomID.mp4
gdrive upload -p $FID $roomID.mp4

rm $roomID.flv
rm $roomID.mp4
