#!/usr/bin/env bash
source .env

npm run start

cd src
gunicorn --bind 127.0.0.1:8080 \
         --worker-class aiohttp.GunicornUVLoopWebWorker \
         main:APP
