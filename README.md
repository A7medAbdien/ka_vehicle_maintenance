## KA Vehicle Maintenance

Vehicle Maintenance

#### License

mit

# Instructions

isntall nvm
```sh
sudo apt install curl 
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.profile
nvm install 18
nvm use 18
```

clean npm cash
```sh
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
sudo n latest
```

setup bench env
```sh
sudo bench setup requirements --node
sudo bench build
```

install app
```sh
bench get-app https://github.com/A7medAbdien/ka_vehicle_maintenance.git
bench --site MY_SITE install-app ka_vehicle_maintenance
```
