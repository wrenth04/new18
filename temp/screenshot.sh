#!/bin/bash

while read id uid url; do
  echo $id
  ffmpeg  -y -loglevel panic -i "$url" -f image2 -vframes 1 "$id.png" &
  sleep 1
done
