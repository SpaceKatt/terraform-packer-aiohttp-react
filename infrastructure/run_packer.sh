#!/usr/bin/env bash
packer build build.json | tee logs/packout_out.txt

cat logs/packout_out.txt | tail -n 2 \
    | sed '$ d' \
    | sed "s/us-west-2: /packer-build-terra-example-ami = \"/" \
    | sed -e 's/[[:space:]]*$/\"/' > terra/packer_build_vars.tfvars

cat terra/packer_build_vars.tfvars
