#/usr/bin/env bash

sudo apt-get update
sudo apt-get install build-essential nginx python3 -y

mkdir /etc/tmpfiles.d
mkdir /etc/systemd/system

#sudo python3 -m pip install aiodns
#sudo python3 -m pip install aiohttp
#sudo python3 -m pip install aiofiles
#sudo python3 -m pip install cchardet
sudo python3 -m pip install gunicorn
#sudo python3 -m pip install uvloop

sudo chown -R ubuntu /etc/tmpfiles.d
sudo chown -R ubuntu /etc/systemd/system
sudo chown -R ubuntu /etc/nginx

sudo systemctl enable nginx.service
sudo systemctl start nginx.service

