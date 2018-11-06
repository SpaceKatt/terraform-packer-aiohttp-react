#!/usr/bin/env bash
echo "Terraform Apply"

terraform get 

terraform apply -var-file=variables.tfvars -var-file=packer_build_vars.tfvars -auto-approve=false
