# TriumfCoin Docker Blockhain Machines

## Folder structure
### ethereum -  Ethereum blockachain - Official docks -  https://github.com/ethereum/
### bitcoin - Bitcoin blockchain - Official docks - https://bitcoin.org/en/developer-reference
### zcash - Zcash blockchain - Official docks -  https://zcash.readthedocs.io/en/latest/index.html



## Instruction
#### ethereum         - cd /ethereum docker-compose up
#### bitcoin          - cd /bitcoin docker-compose up
#### zcash            - cd /zcash, docker-compose up, docker run -it zcash -p 1531:1531,  /var/zcash/src/zcashd -testnet=1 -server=1 -addnode=testnet.z.cash -rpcuser=u -rpcpassword=p -rpcport=1531 -rpcallowip=172.17.0.1 , -rpcallowip - ip adress docker bridge. For show config bridge run command in container route. (echo $(route | grep default|awk '{ print $2 }'))