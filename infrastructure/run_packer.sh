#!/usr/bin/env bash
packer build build.json | tee logs/packout_out.txt
