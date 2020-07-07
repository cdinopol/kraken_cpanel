CPANEL USING DOCKERIZED NGINX
===================================

**Note: All steps from here should be done in a non-root sudo user [[how-to]](#additional-notes)**

## 1. Setup Server (Ubuntu 18+)
- Install minimum dependencies
```sh
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y apache2 git tmux
```

## 2. Download project repo
```sh
cd ~/app
git clone https://github.com/cdinopol/kraken_cpanel.git
```

## 3. Install Docker
```sh
cd ~/app/kraken_cpanel/scripts
./docker_install.sh
```

## 4. Setup Apache2 reverse proxy
```sh
# enable proxy
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_balancer
sudo a2enmod lbmethod_byrequests
sudo a2enmod ssl

# retart apache
sudo systemctl restart apache2
```

## 5. Update apache default conf
```sh
sudo cp conf/host/cpanel.conf /etc/apache2/sites-available/cpanel.conf
sudo a2ensite cpanel.conf
sudo systemctl reload apache2
```

- disable default apache page (be cautious)
```sh
sudo a2dissite 000-default.conf
sudo systemctl reload apache2
```
## 6. Run server docker
- to start
```sh
cd ~/app/kraken_cpanel/scripts
tmux_start.sh
```

- to stop
```sh
cd ~/app/kraken_cpanel/scripts
tmux_stop.sh
```

------

## Additional notes:
1. Create new sudo user (while on root)
```sh
sudo adduser kraken
# note: password prompt will appear, always have a password!

# add to sudo
usermod -aG sudo kraken
```

2. Disable sudo access
```sh
sudo vi /etc/ssh/sshd_config

PermitRootLogin yes # Change this line (whatever value there is)
PermitRootLogin no  # Edit to this (value should be <no>)
```
