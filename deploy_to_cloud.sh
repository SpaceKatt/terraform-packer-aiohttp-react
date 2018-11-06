#!/usr/bin/env bash
cd infrastructure
./run_packer.sh
./terra_apply.sh
