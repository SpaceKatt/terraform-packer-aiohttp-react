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

resource "aws_launch_template" "terra-packer" {
  image_id                    = "${var.packer-build-terra-example-ami}"
  instance_type               = "t2.micro"
  vpc_security_group_ids      = ["${aws_security_group.terra-packer-sg.id}"]
  key_name                    = "${aws_key_pair.terraform-packer-auto.key_name}"

  connection {
    user = "ubuntu"
    private_key = "${file("private/terraform-packer-example.pem")}"
  }


  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_default_subnet" "default_az1" {
  availability_zone = "us-west-2a"
}

resource "aws_autoscaling_group" "terra-packer-scaler" {
  name              = "terra-scaling"
  max_size          = 5
  min_size          = 2

  vpc_zone_identifier = ["${aws_default_subnet.default_az1.id}"]

  launch_template = {
    name = "${aws_launch_template.terra-packer.name}"
  }

  load_balancers = ["${aws_elb.terra-elb.name}"]
  health_check_type = "ELB"

  tag {
    key = "Name"
    value = "terraform-asg"
    propagate_at_launch = true
  }
}

data "aws_availability_zones" "available" {}

resource "aws_elb" "terra-elb" {
  name = "terra-elb"
  security_groups = ["${aws_security_group.terra-packer-sg.id}"]

  availability_zones = ["${data.aws_availability_zones.available.names}"]

  health_check {
    healthy_threshold = 2
    unhealthy_threshold = 2
    timeout = 3
    interval = 30
    target = "HTTP:80/"
  }

  listener {
    lb_port = 80
    lb_protocol = "http"
    instance_port = "80"
    instance_protocol = "http"
  }
}

output "elb_dns_name" {
  value = "${aws_elb.terra-elb.dns_name}"
}

output "instance_ips" {
  value = ["${aws_elb.terra-elb.instances}"]
}
