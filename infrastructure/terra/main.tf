variable "region" {
  type = "string"

  default = "us-west-2"
}

provider "aws" {
  region = "${var.region}"
}

resource "aws_key_pair" "terraform-packer-auto" {
    key_name = "terraform-packer-auto"
    public_key = "${file("private/id_terra.pub")}"
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

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
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
  key_name                    = "${aws_key_pair.terraform-packer-auto.key_name}"

  connection {
    user = "ubuntu"
    private_key = "${file("private/terraform-packer-example.pem")}"
  }

  provisioner "file" {
    source = "private/credentials"
    destination = "/home/ubuntu/.aws/credentials"
  }

  provisioner "file" {
    source = "private/config"
    destination = "/home/ubuntu/.aws/config"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo systemctl stop gunicorn.service",
      "sudo systemctl stop gunicorn.socket",
      "sudo systemctl start gunicorn.socket",
      "sudo systemctl start gunicorn.socket"
    ]
  }
}

output "terra-packer_public_ip" {
  value = "${aws_instance.terra-packer.public_ip}"
}
