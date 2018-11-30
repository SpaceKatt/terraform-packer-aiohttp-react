#!/usr/bin/env bash
source .env

cd infrastructure/scripts

npm run build && ./run_packer.sh && ./terra_apply.sh
