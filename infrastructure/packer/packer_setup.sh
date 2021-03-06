#/usr/bin/env bash

sudo add-apt-repository main
sudo add-apt-repository universe
sudo add-apt-repository multiverse
sudo add-apt-repository restricted

sudo apt-get update
sudo apt-get update
sudo apt-get install -y  \
                        nginx \
                        python3 \

sudo apt-get update
sudo apt-get install -y  \
                        python3-pip

#yes 1 | sudo apt-get upgrade -y

mkdir /etc/tmpfiles.d
mkdir /etc/systemd/system
mkdir /home/ubuntu/.aws

sudo echo "AWS_PROFILE=default" >> /home/ubuntu/.bashrc

sudo python3 -m pip install gunicorn
sudo python3 -m pip install aiodns
sudo python3 -m pip install aiohttp
sudo python3 -m pip install aiofiles
sudo python3 -m pip install asyncpg
sudo python3 -m pip install boto3
sudo python3 -m pip install cchardet
sudo python3 -m pip install uvloop

sudo chown -R ubuntu /etc/tmpfiles.d
sudo chown -R ubuntu /etc/systemd/system
sudo chown -R ubuntu /etc/nginx
