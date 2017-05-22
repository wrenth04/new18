#!/bin/bash

while :; do
  t=$(date "+%Y%m%d%H%M")
  mkdir "$t"
  echo "$t start"
  node index.js > data2.json
  node rtmpurl.js | ./screenshot.sh
  sleep 10
  mv *.png "$t"
  gdrive upload --recursive -p $FID "$t"
  rm -rf "$t"
  echo "$t end"
  sleep 900
done
