variable "region" {
  type = "string"

  default = "us-west-2"
}

provider "aws" {
  region = "${var.region}"
}

variable "packer-build-terra-example-ami" {}

resource "aws_default_vpc" "default" {}

resource "aws_security_group" "terra-packer-sg" {
  name   = "terra-packer-security-group"
  vpc_id = "${aws_default_vpc.default.id}"

  ingress {
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "terra-packer" {
  ami                         = "${var.packer-build-terra-example-ami}"
  instance_type               = "t2.micro"
  security_groups             = ["${aws_security_group.terra-packer-sg.name}"]
  associate_public_ip_address = true
}

output "terra-packer_public_ip" {
  value = "${aws_instance.terra-packer.public_ip}"
}
