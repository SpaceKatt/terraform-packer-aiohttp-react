#/usr/bin/env bash

sudo apt-get update
sudo apt-get install -y build-essential \
                        nginx \
                        python3 \
                        python3-pip
#yes 1 | sudo apt-get upgrade -y

mkdir /etc/tmpfiles.d
mkdir /etc/systemd/system

python3 -m pip install aiodns
python3 -m pip install aiohttp
python3 -m pip install aiofiles
python3 -m pip install cchardet
sudo python3 -m pip install gunicorn
python3 -m pip install uvloop

sudo chown -R ubuntu /etc/tmpfiles.d
sudo chown -R ubuntu /etc/systemd/system
sudo chown -R ubuntu /etc/nginx
